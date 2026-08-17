import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { decryptKey } from "@/lib/crypto";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { PROVIDER_REGISTRY } from "@/lib/provider-adapters";
import { parseUploadedFile } from "@/lib/file-parser";
import type { HomeChatMessage, Language } from "@/lib/types";
import { searchKamusEntries, getFeaturedSiderCards } from "@/lib/kamus-parser";
import { searchMongondowVerifiedWords, getFeaturedMongondowWords } from "@/lib/mongondow-vocab";
import { searchManadoPhrases, getFeaturedManadoPhrases } from "@/lib/manado-vocab";
import { AI_NAME, WEBSITE_NAME, PROJECT_NAME, BOGANI_PERSONA_ID, BOGANI_PERSONA_EN } from "@/lib/bogani-persona";
import { getKnowledgeContext } from "@/lib/knowledge-retrieval";
import { getCurrentUserProfile } from "@/lib/supabase-auth-server";
import { saveConversation, logMetricEvent, listUserMemory, upsertUserMemory, listInstantReplies, type Profile, type UserMemoryRow, type InstantReplyRow } from "@/lib/ginza-db";
import {
  checkGuestQuota,
  checkUserQuota,
  incrementGuestQuota,
  getOrCreateGuestId,
  setGuestCookieHeader,
} from "@/lib/ai-usage-quota";

const SYSTEM_PROMPT_ID = BOGANI_PERSONA_ID;
const SYSTEM_PROMPT_EN = BOGANI_PERSONA_EN;

const GATEWAY_FIELD = "bogani_ai";

// Gateway tidak mendukung streaming (satu JSON utuh dikirim setelah LLM
// selesai) -- diukur langsung ke console.myai.nexus, jawaban Bogani yang
// berbobot (dgn konteks RAG) bisa makan waktu >15 detik. Timeout SEBELUMNYA
// cuma 2 detik, jadi HAMPIR SEMUA pertanyaan nyata timeout duluan sebelum
// Gateway sempat menjawab, dan diam-diam jatuh ke simulateReply() (balasan
// template kosong tanpa isi) -- itulah kenapa Bogani AI terasa "tidak paham
// konteks" di production, padahal Gateway-nya sendiri menjawab dgn benar.
const GATEWAY_TIMEOUT_MS = 45_000;

/** Blok teks siap-sisip ke prompt AI + daftar sumber (kata Kamus/file Knowledge/dst) yg BENAR-BENAR terpakai -- lihat components/homepage/BoganiThinkingIndicator.tsx utk bagaimana `sources` ditampilkan sekilas ke user selagi AI berpikir. */
interface ContextResult {
  text: string;
  sources: string[];
}

function getKamusContext(userPrompt: string): ContextResult {
  try {
    const tokens = userPrompt.split(/\s+/).filter((t) => t.length >= 2);
    const matchedWords = new Set<string>();
    for (const token of tokens) {
      const searchRes = searchKamusEntries({ query: token, limit: 5 });
      for (const item of searchRes.items) {
        matchedWords.add(item.word);
        if (matchedWords.size >= 25) break;
      }
      if (matchedWords.size >= 25) break;
    }
    if (matchedWords.size === 0) return { text: "", sources: [] };

    // Kata yang cocok dengan salah satu Featured Sider Card sudah punya
    // makna+contoh kalimat asli (bukan tebakan) -- sertakan itu, jangan cuma
    // daftar kata mentah tanpa arti. Ini memberi Bogani AI pijakan nyata utk
    // berbicara Mongondow beneran, bukan cuma menyapa lalu balik ke Indonesia
    // karena tidak tahu artinya. Sisanya (belum ada gloss tersimpan) tetap
    // dilampirkan sbg daftar kata polos spt sebelumnya.
    const featured = getFeaturedSiderCards();
    const glossed: string[] = [];
    const plainWords: string[] = [];
    for (const w of matchedWords) {
      const card = featured.find((f) => f.word.toLowerCase() === w.toLowerCase());
      if (card) {
        glossed.push(`${card.word} = ${card.meaning} (Contoh: "${card.example}")`);
      } else {
        plainWords.push(w);
      }
    }

    let ctx = `\n\n--- KONTEKS KOSA KATA KAMUS MONGONDOWPEDIA (${matchedWords.size} KATA TERHUBUNG) ---\n`;
    if (glossed.length > 0) {
      ctx += `Kata dengan makna & contoh kalimat terverifikasi:\n${glossed.join("\n")}\n`;
    }
    if (plainWords.length > 0) {
      ctx += `Kata lain yang terhubung (belum ada gloss/makna tersimpan -- jangan mengarang artinya):\n${plainWords.join(", ")}\n`;
    }
    ctx += `--- AKHIR KONTEKS KAMUS ---`;
    return { text: ctx, sources: Array.from(matchedWords).map((w) => `Kamus: ${w}`) };
  } catch (e) {
    console.warn("[homepage-chat] Failed retrieving kamus context:", e);
  }
  return { text: "", sources: [] };
}

/**
 * Kosakata Manado + Mongondow ✔ yang boleh dipakai Bogani AI untuk
 * menyisipkan bahasa daerah otentik di balasan santai (lihat aturan
 * "Campuran Bahasa" di lib/bogani-persona.ts). Terpisah dari
 * getKamusContext() di atas -- fungsi itu untuk pertanyaan tentang KATA
 * MONGONDOW itu sendiri (mode "definisikan kata"), sementara ini untuk
 * bumbu percakapan sehari-hari terlepas dari topik. Selalu sertakan set
 * "featured" kecil (sapaan/kata ganti) walau tidak ada kata yang cocok
 * dengan pesan pengguna, supaya obrolan singkat pun tetap kebagian warna
 * lokal -- tapi HANYA dari daftar terverifikasi ini, tidak pernah dikarang.
 */
function getLanguageMixContext(userPrompt: string): ContextResult {
  try {
    const manadoMatches = searchManadoPhrases(userPrompt, 6);
    const manado = manadoMatches.length > 0 ? manadoMatches : getFeaturedManadoPhrases().slice(0, 4);

    const mongondowMatches = searchMongondowVerifiedWords(userPrompt, 8);
    const mongondow = mongondowMatches.length > 0 ? mongondowMatches : getFeaturedMongondowWords().slice(0, 4);

    if (manado.length === 0 && mongondow.length === 0) return { text: "", sources: [] };

    let ctx = `\n\n--- KOSAKATA MANADO & MONGONDOW UNTUK CAMPURAN BAHASA (boleh dipakai apa adanya, JANGAN dikarang di luar daftar ini) ---\n`;
    if (manado.length > 0) {
      ctx += `Manado:\n${manado.map((m) => `- "${m.indonesia}" → ${m.manado}`).join("\n")}\n`;
    }
    if (mongondow.length > 0) {
      ctx += `Mongondow ✔:\n${mongondow.map((w) => `- ${w.mongondow} = ${w.meaning}${w.example ? ` (${w.example})` : ""}`).join("\n")}\n`;
    }
    ctx += `--- AKHIR KOSAKATA CAMPURAN BAHASA ---`;

    // Sumber cuma dilaporkan kalau ini kecocokan NYATA thd pertanyaan
    // (searchManadoPhrases/searchMongondowVerifiedWords) -- bukan set
    // "featured" default yg selalu disisipkan walau tak ada kecocokan
    // (bukan benar2 "sumber yg dipakai utk pertanyaan ini").
    const sources: string[] = [];
    if (manadoMatches.length > 0) sources.push(...manadoMatches.map((m) => `Kosakata Manado: ${m.indonesia}`));
    if (mongondowMatches.length > 0) sources.push(...mongondowMatches.map((w) => `Kosakata Mongondow: ${w.mongondow}`));

    return { text: ctx, sources };
  } catch (e) {
    console.warn("[homepage-chat] Failed retrieving language-mix context:", e);
  }
  return { text: "", sources: [] };
}

/**
 * Format memori tersimpan ttg user (lihat lib/ginza-db.ts#listUserMemory)
 * jadi blok konteks -- rows sudah difetch di pemanggil (paralel dgn cek
 * kuota, lihat POST handler) supaya fungsi ini murni sinkron & tidak
 * menambah round-trip DB baru di sini.
 */
function formatMemoryContext(rows: UserMemoryRow[]): string {
  if (!rows || rows.length === 0) return "";
  const top = rows.slice(0, 20);
  return `\n\n--- MEMORI TENTANG UTAT INI (fakta ringkas dari percakapan sebelumnya, boleh dipakai utk personalisasi -- JANGAN diucapkan ulang scr harfiah kecuali relevan) ---\n${top
    .map((m) => `- ${m.content}`)
    .join("\n")}\n--- AKHIR MEMORI ---`;
}

/**
 * Ekstraksi memori RINGAN berbasis pola teks (regex), BUKAN panggilan LLM
 * tambahan -- sengaja begitu supaya TIDAK menambah latensi balasan chat sama
 * sekali. Dipanggil fire-and-forget SETELAH balasan sudah dikirim ke user
 * (lihat logChatTurn()). Sengaja konservatif: cuma tangkap pola pernyataan
 * eksplisit umum, supaya tidak salah tangkap kalimat biasa jadi "fakta".
 */
function extractMemoryCandidates(prompt: string): { content: string; category: UserMemoryRow["category"] }[] {
  const text = prompt.trim();
  const results: { content: string; category: UserMemoryRow["category"] }[] = [];
  if (!text || text.length > 300) return results; // pesan kepanjangan kemungkinan bukan pernyataan fakta sederhana

  const patterns: { re: RegExp; category: UserMemoryRow["category"]; label: (m: RegExpMatchArray) => string }[] = [
    { re: /\b(?:nama saya|namaku|nama aku|panggil saya|panggil aku)\s+([a-zA-Z' ]{2,40})/i, category: "fact", label: (m) => `Nama panggilan: ${m[1].trim()}` },
    { re: /\baku\s+(?:tidak suka|nggak suka|ga suka|benci)\s+(.{2,80})/i, category: "preference", label: (m) => `Tidak suka: ${m[1].trim()}` },
    { re: /\baku\s+(?:suka|senang|hobi)\s+(.{2,80})/i, category: "preference", label: (m) => `Suka: ${m[1].trim()}` },
    { re: /\baku\s+(?:tinggal di|berasal dari|asal dari)\s+([a-zA-Z' ]{2,40})/i, category: "fact", label: (m) => `Domisili/asal: ${m[1].trim()}` },
    { re: /\baku\s+(?:kerja sebagai|bekerja sebagai)\s+(.{2,60})/i, category: "fact", label: (m) => `Pekerjaan: ${m[1].trim()}` },
    { re: /\b(?:tolong ingat|ingatkan|camkan|catat)\s*(?:ya|dong|bahwa|kalau)?[:,]?\s+(.{3,150})/i, category: "general", label: (m) => m[1].trim() },
    { re: /\baku\s+(?:sedang|lagi)\s+belajar\s+(.{2,60})/i, category: "goal", label: (m) => `Sedang belajar: ${m[1].trim()}` },
  ];

  for (const p of patterns) {
    const m = text.match(p.re);
    if (m) {
      const content = p.label(m).replace(/[.!?]+$/, "").trim();
      if (content.length >= 3) results.push({ content, category: p.category });
    }
  }
  return results.slice(0, 2); // maks 2 fakta baru per giliran, jaga2 supaya tidak spam
}

// Riwayat percakapan dikirim client TANPA batas (HomeApp.tsx mengirim seluruh
// existingMessages sesi, bisa puluhan giliran) -- dulu semuanya digabung
// mentah2 ke prompt, jadi makin panjang sesi obrolan, makin panjang & makin
// lama diproses AI di SETIAP giliran berikutnya (biaya & latensi naik terus,
// tanpa batas). Fakta penting lintas-sesi sudah dijaga terpisah lewat
// listUserMemory()/formatMemoryContext() di atas, jadi aman memotong riwayat
// mentah ke N giliran terakhir -- konsisten dgn playground AiMasterPanel.tsx
// yg sudah lebih dulu membatasi ke -8 pesan.
const MAX_HISTORY_MESSAGES = 20;

/**
 * Peringkasan konteks (mirip "compacting" Claude): begitu histori sebuah
 * sesi lebih panjang dari MAX_HISTORY_MESSAGES, giliran-giliran yang
 * "jatuh" dari jendela di atas dulu HILANG TOTAL dari yang dilihat AI --
 * sekarang, sebelum dibuang, digabung jadi satu ringkasan padat (1 panggilan
 * AI murah lewat Gateway) lalu tetap disisipkan ke prompt. Ringkasan
 * disimpan & dikirim balik ke client (contextSummary + summarizedThroughCount
 * di body/­event `done`), client menaruhnya di state sesi & mengirim balik di
 * giliran berikutnya -- INKREMENTAL: cuma bagian yang BARU jatuh dari jendela
 * yang diringkas tiap kali, bukan mengulang meringkas seluruh histori lama
 * setiap giliran (itu akan makin lambat & mahal seiring sesi memanjang).
 * Sengaja stateless di server (tidak disimpan ke DB) -- kalau state klien
 * hilang (reload tab tamu, dst), sistem cuma mulai meringkas ulang dari 0,
 * BUKAN kehilangan data (histori mentah lengkap tetap selalu dikirim utuh
 * oleh client, cuma "cache" ringkasannya yang reset, self-healing).
 */
async function compactOverflowIfNeeded(opts: {
  history: HomeChatMessage[];
  existingSummary: string;
  summarizedThroughCount: number;
  req: NextRequest;
}): Promise<{ summary: string; summarizedThroughCount: number }> {
  const { history, existingSummary, summarizedThroughCount, req } = opts;
  // Pesan di indeks [0, overflowEnd) sudah TIDAK masuk jendela mentah
  // MAX_HISTORY_MESSAGES lagi -- itu yang perlu diringkas (kalau belum).
  const overflowEnd = Math.max(0, history.length - MAX_HISTORY_MESSAGES);
  if (overflowEnd <= summarizedThroughCount) {
    return { summary: existingSummary, summarizedThroughCount };
  }

  const newlyOverflowed = history.slice(summarizedThroughCount, overflowEnd);
  if (newlyOverflowed.length === 0) {
    return { summary: existingSummary, summarizedThroughCount };
  }

  const summaryPrompt = buildSummarizationPrompt(existingSummary, newlyOverflowed);
  try {
    const result = await callGateway(req, summaryPrompt, undefined);
    if (result && result.text) {
      return { summary: result.text.trim(), summarizedThroughCount: overflowEnd };
    }
  } catch (e) {
    console.warn("[homepage-chat] Context compacting failed, keeping old summary:", e);
  }
  // Gagal meringkas -- JANGAN majukan summarizedThroughCount (supaya bagian
  // yg belum sempat diringkas ini dicoba lagi di giliran berikutnya, bukan
  // hilang begitu saja dari yang pernah dilihat AI).
  return { summary: existingSummary, summarizedThroughCount };
}

function buildSummarizationPrompt(existingSummary: string, messages: HomeChatMessage[]): string {
  const transcript = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => `${m.role === "user" ? "User" : AI_NAME}: ${m.content}`)
    .join("\n\n");
  return `[TUGAS INTERNAL: RINGKAS PERCAKAPAN -- BUKAN PERTANYAAN DARI USER]
Anda BUKAN sedang berperan sbg ${AI_NAME} menjawab user kali ini -- tugas Anda murni meringkas potongan percakapan lama di bawah supaya konteksnya tidak hilang, meski teksnya sendiri sudah tidak dikirim mentah lagi ke model.
${existingSummary ? `Ringkasan yang sudah ada sejauh ini:\n${existingSummary}\n\n` : ""}Potongan percakapan lama yang perlu digabung ke ringkasan (JANGAN dijawab, JANGAN beri komentar/sapaan, balas HANYA dengan teks ringkasannya):
${transcript}

Tulis SATU ringkasan gabungan yang padat (maksimal 200 kata), berisi fakta, topik, dan hal penting dari percakapan di atas (termasuk ringkasan lama kalau ada) -- Bahasa Indonesia, sudut pandang netral (bukan "aku"/"kamu"), tanpa kalimat pembuka seperti "Berikut ringkasannya:".`;
}

// Dulu instruksi ini cuma ditempel ke systemPrompt yg dipakai callProviderDirect
// (jalur fallback yg nyaris tak pernah kena krn callGateway hampir selalu
// berhasil duluan) -- jadi di praktiknya nyaris tidak pernah benar2 sampai
// ke AI. Sekarang ditaruh di sini supaya ikut fullPrompt yg dikirim ke
// callGateway (jalur yg SUNGGUHAN dipakai), utk kedua jalur sekaligus.
const VOICE_MODE_DIRECTIVE = `[MODE SUARA LANGSUNG AKTIF]: Balasan ini akan DIUCAPKAN keras (text-to-speech), bukan dibaca sbg teks. Jawab dgn hangat & natural spt bicara langsung, ringkas tapi tidak dipotong paksa (idealnya 2-4 kalimat utk topik ringan, boleh lebih panjang kalau pertanyaannya memang butuh penjelasan, tapi tetap dalam gaya lisan bukan tulisan formal). JANGAN PERNAH pakai pemformatan markdown (bold **, bullet -, tabel |, header #) krn semua itu akan diucapkan literal & terdengar aneh. Ucapkan nama tempat & kosa kata Mongondow dgn fonetik yg jernih.`;

interface PromptWithHistoryResult {
  prompt: string;
  /** Kamus/Knowledge Base/kosakata yg BENAR-BENAR terpakai menyusun prompt ini -- ditampilkan sekilas ke user selagi AI berpikir (lihat runChatPipeline). */
  sources: string[];
}

const CONVO_DATA_STOPWORDS = new Set([
  "yang", "dan", "atau", "dari", "untuk", "dengan", "pada", "dalam", "ini", "itu",
  "adalah", "juga", "tidak", "akan", "bisa", "saya", "anda", "kamu", "kami", "kita",
  "apa", "bagaimana", "siapa", "kenapa", "mengapa", "kapan", "dimana", "tentang", "soal",
]);

function tokenizeForConvoData(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !CONVO_DATA_STOPWORDS.has(t));
}

/**
 * Lapisan RAG BARU: "Data Percakapan" -- fakta/topik yg pernah muncul di
 * chat lain (disimpan lewat syncToDataCenter, source_type "chat_memory_fact")
 * yg berkaitan dgn pertanyaan sekarang. SENGAJA belum lewat review manusia
 * (verifikator situs ini sudah kewalahan mengejar Knowledge Base biasa) --
 * atas permintaan eksplisit Boss Bayu, tetap dipakai AI TAPI SELALU dilabeli
 * jelas sbg hipotesis/belum terverifikasi, bukan disamakan dgn Kamus/
 * Knowledge Base yg sudah terverifikasi. Lihat lib/bogani-persona.ts utk
 * instruksi cara AI memperlakukan label ini.
 */
async function getConversationDataContext(userPrompt: string): Promise<ContextResult> {
  if (!supabaseAdmin) return { text: "", sources: [] };
  const queryTokens = Array.from(new Set(tokenizeForConvoData(userPrompt)));
  if (queryTokens.length === 0) return { text: "", sources: [] };

  try {
    const { data, error } = await supabaseAdmin
      .from("gw_data_center")
      .select("id, raw_text, extracted_data, review_status, created_at")
      .eq("source_type", "chat_memory_fact")
      .neq("review_status", "rejected")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error || !data || data.length === 0) return { text: "", sources: [] };

    const scored = data
      .map((row) => {
        const text = (row.raw_text || "").toString();
        const lower = text.toLowerCase();
        let score = 0;
        for (const t of queryTokens) if (lower.includes(t)) score += 1;
        return { row, text, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    if (scored.length === 0) return { text: "", sources: [] };

    // Baris yg sudah disetujui verifikator (review_status "approved") dapat
    // label sedikit lebih percaya diri drpd yg masih "pending" -- tapi
    // KEDUANYA tetap eksplisit BUKAN Kamus/Knowledge Base resmi (cuma
    // ditinjau verifikator, belum benar2 masuk sbg entri resmi tersendiri).
    const label = (status: string) =>
      status === "approved" ? "Sudah ditinjau verifikator" : "Belum ditinjau/belum terverifikasi";

    let ctx = `\n\n--- DATA PERCAKAPAN (dari pertanyaan/diskusi pengguna lain sebelumnya, BUKAN Kamus/Knowledge Base resmi) ---\n`;
    ctx += scored.map((s) => `[${label(s.row.review_status)}] ${s.text.slice(0, 600)}`).join("\n\n");
    ctx += `\n--- AKHIR DATA PERCAKAPAN (ingat: WAJIB sebut status verifikasinya kalau dipakai di jawaban, jangan disamakan dgn fakta resmi) ---`;

    return {
      text: ctx,
      sources: scored.map((s) => `Data Percakapan (${label(s.row.review_status)}): ${s.text.slice(0, 60)}${s.text.length > 60 ? "..." : ""}`),
    };
  } catch (e) {
    console.warn("[homepage-chat] Failed retrieving conversation-data context:", e);
    return { text: "", sources: [] };
  }
}

/**
 * Gabung beberapa daftar sumber jadi SATU array yg diselang-seling
 * round-robin antar kategori (bukan disambung mentah2 blok-per-blok) --
 * kalau tidak, kategori dgn hasil paling banyak (biasanya Kamus, bisa
 * sampai 25 entri vs 3-8 kategori lain) akan mendominasi tampilan cepat-
 * bergantian di BoganiThinkingIndicator/VoiceModeOverlay: user cuma lihat
 * beberapa detik pertama dari array yg sangat panjang, jadi TERASA cuma
 * "loop Kamus doang" & ritme cepat/lambat yg dirancang tidak pernah
 * kelihatan (baru muncul jauh di tengah array yg keburu tak sempat
 * ditonton). Dibatasi ke MAX_INTERLEAVED_SOURCES total spy satu putaran
 * penuh (dgn ritme cepat-lambat-cepatnya) selesai dlm hitungan detik,
 * bukan puluhan detik.
 */
const MAX_INTERLEAVED_SOURCES = 16;
function interleaveSources(...lists: string[][]): string[] {
  const result: string[] = [];
  const maxLen = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < maxLen && result.length < MAX_INTERLEAVED_SOURCES; i++) {
    for (const list of lists) {
      if (i < list.length) {
        result.push(list[i]);
        if (result.length >= MAX_INTERLEAVED_SOURCES) break;
      }
    }
  }
  return result;
}

async function buildPromptWithHistory(history: HomeChatMessage[], prompt: string, memoryCtx: string = "", isVoiceMode: boolean = false, compactSummary: string = ""): Promise<PromptWithHistoryResult> {
  const kamusCtx = getKamusContext(prompt);
  const languageMixCtx = getLanguageMixContext(prompt);
  let knowledgeCtx: ContextResult = { text: "", sources: [] };
  try {
    knowledgeCtx = getKnowledgeContext(prompt);
  } catch (e) {
    console.warn("[homepage-chat] Failed retrieving knowledge context:", e);
  }
  const convoDataCtx = await getConversationDataContext(prompt);
  // Urutan list menentukan prioritas SAAT SERI (i sama) -- Knowledge &
  // Data Percakapan didahulukan drpd Kamus/Kosakata krn itu yg paling
  // "menunjukkan AI benar2 riset", Kamus/Kosakata cenderung generik.
  const sources: string[] = interleaveSources(
    knowledgeCtx.sources.map((s) => `Knowledge: ${prettifyKnowledgeSource(s)}`),
    convoDataCtx.sources,
    kamusCtx.sources,
    languageMixCtx.sources
  );

  const personaHeader = `[SYSTEM INSTRUCTION BOGANI AI]:\n${SYSTEM_PROMPT_ID}${isVoiceMode ? `\n\n${VOICE_MODE_DIRECTIVE}` : ""}\n\n`;
  const fullPrompt = prompt + kamusCtx.text + languageMixCtx.text + memoryCtx + knowledgeCtx.text + convoDataCtx.text;
  const isFirstTurn = !Array.isArray(history) || history.length === 0;

  // Sinyal eksplisit & terstruktur ttg posisi giliran ini -- diletakkan
  // SEDEKAT MUNGKIN ke titik AI mulai menjawab (bukan cuma disebut sekali di
  // persona yg panjang di atas), krn instruksi dekat titik-generate jauh
  // lebih dipatuhi LLM drpd instruksi yg terkubur jauh di awal system
  // prompt. Perbaikan atas laporan Boss Bayu: AI tetap mengulang "Niondon"
  // di balasan lanjutan walau persona sudah eksplisit melarangnya (lihat
  // lib/bogani-persona.ts) -- ini penegasan tambahan, bukan pengganti aturan
  // yg sudah ada di sana.
  // Penegasan resolusi konteks/ambiguitas JUGA ditaruh di sini (bukan cuma
  // di persona), sesuai prinsip yg sama: dekat titik-generate = lebih
  // dipatuhi. Insiden nyata yg jadi alasan ini: pertanyaan lanjutan yg
  // memakai rujukan ke giliran sebelumnya ("kalau bagitu siapa...") --
  // model WAJIB baca riwayat/ringkasan di atas & selesaikan rujukannya
  // dulu sebelum menjawab, bukan menjawab seolah pertanyaan berdiri sendiri.
  const turnStatus = isFirstTurn
    ? `[STATUS SESI: Ini pesan PERTAMA di sesi obrolan ini -- boleh buka dgn sapaan "Niondon"/"Dega Niondon" SEKALI saja sesuai aturan persona di atas.]`
    : `[STATUS SESI: Sesi obrolan ini SUDAH BERJALAN (bukan pesan pertama) -- JANGAN gunakan kata "Niondon" atau "Dega Niondon" sama sekali di balasan ini. Langsung tanggapi tanpa sapaan pembuka. WAJIB baca riwayat percakapan (& ringkasan, kalau ada) di atas dan selesaikan dulu rujukan/kata ganti apa pun di pertanyaan berikut sebelum menjawab -- kalau tetap ambigu setelah dibaca, tanya balik singkat drpd menebak.]`;

  if (isFirstTurn) return { prompt: `${personaHeader}${turnStatus}\n\n${fullPrompt}`, sources };

  const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);
  const historyText = recentHistory
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => `${m.role === 'user' ? 'User' : AI_NAME}: ${m.content}`)
    .join("\n\n");

  // Ringkasan (kalau ada) mewakili bagian percakapan yang LEBIH LAMA dari
  // recentHistory di atas -- jadi ditaruh SEBELUM histori mentah, spy urutan
  // waktunya tetap masuk akal buat AI (lama -> baru -> pertanyaan sekarang).
  const summaryBlock = compactSummary
    ? `\n\n--- RINGKASAN PERCAKAPAN SEBELUMNYA (lebih lama, sudah dipadatkan -- tetap relevan utk konteks) ---\n${compactSummary}\n--- AKHIR RINGKASAN ---\n`
    : "";

  return { prompt: `${personaHeader}${summaryBlock}${historyText}\n\n${turnStatus}\n\nUser: ${fullPrompt}`, sources };
}

/**
 * Nama file Knowledge Base (mis. "knowledge/arsip_download/hasil_ocr_123.md")
 * jadi label yg enak dibaca ("Hasil Ocr 123") -- ditampilkan APA ADANYA ke
 * user sbg sumber yg dipakai (lihat BoganiThinkingIndicator.tsx), jadi tidak
 * boleh menyisakan path teknis mentah.
 */
function prettifyKnowledgeSource(sourcePath: string): string {
  const base = sourcePath.split("/").pop() || sourcePath;
  const withoutExt = base.replace(/\.md$/i, "");
  return withoutExt
    .replace(/[_-]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ── Balasan instan (sapaan pendek, tanpa panggil AI apa pun) ──────────────
// Dikonfigurasi dari Admin Dashboard (Ai Master -> Balasan Instan) & tersimpan
// di tabel bogani_instant_replies. Di-cache di memori proses (per-instance
// serverless) supaya sapaan tetap kilat tanpa query DB tiap pesan; cache
// pendek (5 menit) supaya edit dari dashboard cukup cepat terasa.
let instantReplyCache: { rows: InstantReplyRow[]; fetchedAt: number } | null = null;
const INSTANT_REPLY_CACHE_TTL_MS = 5 * 60 * 1000;

async function getActiveInstantReplies(): Promise<InstantReplyRow[]> {
  const now = Date.now();
  if (instantReplyCache && now - instantReplyCache.fetchedAt < INSTANT_REPLY_CACHE_TTL_MS) {
    return instantReplyCache.rows;
  }
  try {
    const rows = await listInstantReplies({ activeOnly: true });
    instantReplyCache = { rows, fetchedAt: now };
    return rows;
  } catch (e) {
    console.warn("[homepage-chat] Failed loading instant replies:", e);
    return instantReplyCache?.rows ?? [];
  }
}

// Cuma cocok utk pesan PENDEK (maks 5 kata) yang persis atau diawali kata
// pemicu -- sengaja ketat supaya "halo, boleh tanya soal sejarah..." TETAP
// dijawab AI sungguhan, bukan template ini.
function matchInstantReply(prompt: string, rows: InstantReplyRow[]): string | null {
  const normalized = prompt.toLowerCase().trim().replace(/[!.,?;:]+$/g, "").replace(/\s+/g, " ").trim();
  if (!normalized) return null;
  if (normalized.split(" ").length > 5) return null;

  for (const row of rows) {
    for (const rawKeyword of row.trigger_keywords) {
      const keyword = rawKeyword.toLowerCase().trim();
      if (!keyword) continue;
      if (normalized === keyword || normalized.startsWith(keyword + " ")) {
        const variants = row.reply_variants.filter(Boolean);
        if (variants.length === 0) continue;
        return variants[Math.floor(Math.random() * variants.length)];
      }
    }
  }
  return null;
}

function simulateReply(prompt: string, lang: Language, isFirstMessage: boolean = true): string {
  const lower = prompt.toLowerCase();
  const variations = [
    "Niondon utat! ",
    "Dega Niondon tat! ",
    "Niondon... ",
    "Niondon Utat! ",
    "Dega Niondon Utat! ",
    "Niondon kon MongondowPedia, Utat! ",
    "Niondon Utat! Salam hangat kekeluargaan, "
  ];
  const greeting = isFirstMessage ? variations[Math.floor(Math.random() * variations.length)] : "";

  if (lang === 'en') {
    const enGreeting = isFirstMessage ? "Niondon! " : "";
    if (lower.includes("who are you") || lower.includes("bogani") || lower.includes("mongondowpedia")) {
      return `${enGreeting}I am **${AI_NAME}** (also known as Abo), your AI assistant and cultural companion for **${WEBSITE_NAME}** (*${PROJECT_NAME}*). I am here to help you explore Bolaang Mongondow's rich history, language, customs, and traditional Aksara script! How can I assist you today?`;
    }
    if (lower.includes("hi") || lower.includes("hello")) {
      return `${enGreeting}Hello and welcome to **${WEBSITE_NAME}**! I am **${AI_NAME}** (Abo), glad to accompany you. What would you like to explore together today?`;
    }
    // Giliran lanjutan (bukan sapaan pertama) yg sampai kesini artinya
    // Gateway MAUPUN provider langsung dua-duanya gagal total (bukan cuma
    // "belum dikonfigurasi") -- lihat versi Indonesia di bawah utk insiden
    // nyata yg jadi alasan perbedaan ini. Jujur ke user drpd pura2 basa-basi
    // kosong yg terlihat spt jawaban tapi tidak menjawab apa pun.
    if (!isFirstMessage) {
      return `Sorry Utat, I'm having trouble answering right now (a temporary connection issue on our end) -- I don't want to give you an empty non-answer pretending to help. Please try asking again in a moment.`;
    }
    return `${enGreeting}Thank you for reaching out to **${AI_NAME}** on **${WEBSITE_NAME}**! Regarding *"${prompt}"*, I am ready to help you explore, analyze, and learn more. How can I assist you further?`;
  }

  if (lower.includes("siapa kamu") || lower.includes("bogani") || lower.includes("mongondowpedia")) {
    return `${greeting}Aku'oy **${AI_NAME}** (sering dipanggil Abo), asisten kecerdasan buatan dan sahabat digital untuk **${WEBSITE_NAME}** (*${PROJECT_NAME}*) — pusat pengetahuan digital tentang Sejarah, Adat & Budaya, Bahasa/Kamus, dan Aksara Bolaang Mongondow Raya.\n\nNama "Bogani" diambil dari gelar pahlawan dan pimpinan adat Bolaang Mongondow yang dipilih karena keberanian, kebijaksanaan, dan kejujurannya mengayomi masyarakat. Ada hal seputar budaya atau sejarah yang ingin Utat pelajari bersama Abo hari ini?`;
  }
  if (lower.includes("halo") || lower.includes("hi") || lower.includes("hello")) {
    return `${greeting}Halo, senang sekali bisa menyapa Utat di **${WEBSITE_NAME}**. Aku'oy **${AI_NAME}** (Abo), siap menemani Utat belajar bahasa, sejarah, adat, dan Aksara Bolaang Mongondow Raya. Ada cerita atau pertanyaan menarik apa hari ini, Utat?`;
  }
  if (lower.includes("fitur") || lower.includes("suara") || lower.includes("voice")) {
    return `${greeting}**${AI_NAME}** mendukung mode **Teks Percakapan**, **Mode Suara Langsung**, dan **Unggah Dokumen/Gambar** untuk membantu penelitian dan pembelajaran kebudayaan Mongondow.`;
  }
  // PENTING -- insiden nyata (Boss Bayu, 17 Agt 2026): giliran lanjutan yg
  // sampai ke sini artinya Gateway DAN provider langsung dua-duanya gagal
  // total utk pertanyaan itu (bukan sekadar "belum dikonfigurasi", yg cuma
  // realistis di giliran PERTAMA sblm ada API key sama sekali). Versi lama
  // di sini membalas template basa-basi ("mari kita pelajari bersama...")
  // yg TERLIHAT spt jawaban tapi kosong isinya -- user sampai harus
  // bertanya "loh kenapa tak dijawab?" krn sistem sendiri tidak pernah
  // bilang jujur bahwa itu gagal. Utk giliran pertama (isFirstMessage),
  // template lama TETAP dipakai (skenario paling umum: belum ada API key
  // dikonfigurasi sama sekali di dev/testing, bukan kegagalan sesaat).
  if (!isFirstMessage) {
    return `Maaf Utat, Abo lagi ada kendala teknis sesaat untuk menjawab pertanyaan ini (bukan sengaja diabaikan) -- daripada kasih jawaban kosong yang pura-pura, lebih baik jujur: coba tanyakan lagi sebentar lagi ya.`;
  }
  return `${greeting}Terima kasih telah menghubungi **${AI_NAME}** di **${WEBSITE_NAME}**. Mengenai pertanyaan Utat tentang *"${prompt}"*, mari kita pelajari bersama informasi dan etimologinya secara mendalam. Ada topik spesifik yang ingin Utat tanyakan lebih lanjut?`;
}

/**
 * Preferred path: call Gateway AI (MYAI_OS_GATEWAY_URL or local /api/v1/chat/completions)
 */
type GatewayAttemptResult =
  | { kind: "success"; text: string; provider: string }
  | { kind: "vision_unavailable" }
  | { kind: "fatal" } // request itself is broken (400) -- retrying anywhere is pointless
  | { kind: "retryable" }; // network error, or a status worth trying again elsewhere

/**
 * Satu percobaan mentah ke satu URL Gateway. Diekstrak dari callGateway()
 * supaya bisa dipakai baik utk loop [primaryUrl, localUrl] normal MAUPUN
 * satu retry tambahan ke primaryUrl kalau keduanya gagal (lihat komentar di
 * callGateway) -- insiden nyata (giliran chat jatuh ke simulateReply() tanpa
 * AI sama sekali) menunjukkan kegagalan sesaat itu nyata, bukan teoretis.
 */
async function attemptGatewayCall(
  gatewayUrl: string,
  gatewayKey: string,
  fullPrompt: string,
  fileData?: string | null
): Promise<GatewayAttemptResult> {
  try {
    const res = await fetch(gatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${gatewayKey}`,
      },
      body: JSON.stringify({
        // Dulu voice mode dialihkan ke field "chatbot_general" -- artinya
        // persona Bogani AI (gaya Manado/Mongondow, aturan Niondon, dst)
        // TIDAK pernah dipakai sama sekali di mode suara, field itu punya
        // persona server-side sendiri yg beda. Disamakan ke GATEWAY_FIELD
        // spy mode suara benar2 Bogani AI, bukan AI generik lain.
        field: GATEWAY_FIELD,
        messages: [{ role: "user", content: fullPrompt }],
        file: fileData || undefined,
      }),
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS),
    });

    if (res.ok) {
      const data = await res.json();
      const providerUsed = data.provider_used || res.headers.get("x-provider-used") || "gpt";
      const replyText = typeof data.result === "string"
        ? data.result
        : typeof data.result === "object"
        ? JSON.stringify(data.result, null, 2)
        : null;

      if (replyText) return { kind: "success", text: replyText, provider: providerUsed };
      // 200 tapi tanpa teks yg bisa dipakai -- anggap sama spt kegagalan
      // retry-able (bukan fatal), Gateway-nya sendiri secara teknis
      // menjawab OK jadi bukan kesalahan bentuk request kita.
      console.warn(`[homepage-chat] Gateway (${gatewayUrl}) returned 200 tanpa teks terpakai. promptLen=${fullPrompt.length} body=${JSON.stringify(data).slice(0, 500)}`);
      return { kind: "retryable" };
    }

    const errBody = await res.json().catch(() => ({}));
    // Diagnostik lengkap (status + body mentah + panjang prompt) -- insiden
    // nyata sebelumnya butuh gali transkrip ekspor + query DB manual krn
    // log lama cuma nyimpen status+error singkat, tidak cukup utk tahu
    // apakah ini penolakan level-request atau kegagalan provider sungguhan.
    console.warn(`[homepage-chat] Gateway (${gatewayUrl}) failed (${res.status}). promptLen=${fullPrompt.length} body=${JSON.stringify(errBody).slice(0, 800)}`);

    if (res.status === 422) {
      // Gambar dikirim tapi Gateway tidak punya provider vision di pool
      // field ini saat ini -- bukan kegagalan yg bisa diperbaiki dgn coba
      // URL Gateway lain (pool-nya sama). Tandai supaya pemanggil bisa
      // kasih pesan jujur ke user kalau callProviderDirect (fallback
      // berikutnya, provider vision langsung) juga tidak berhasil --
      // bukan diam2 jatuh ke simulateReply() yg buta terhadap gambar.
      return { kind: "vision_unavailable" };
    }
    if (res.status === 400) {
      // Fatal -- request ini sendiri yg salah (mis. context terlalu
      // panjang), mengulang body yg PERSIS SAMA ke URL/percobaan lain cuma
      // akan gagal identik. Jangan retry di sini sama sekali.
      return { kind: "fatal" };
    }
    // 401/429/502/503 dll: genuinely retry-able atau setidaknya tidak rugi
    // dicoba lagi (mis. 401 di Gateway remote ≠ 401 di local clone, beda
    // auth store).
    return { kind: "retryable" };
  } catch (err) {
    console.warn(`[homepage-chat] Gateway (${gatewayUrl}) unreachable. promptLen=${fullPrompt.length}:`, err);
    return { kind: "retryable" };
  }
}

// Diekspor spy job cron ekstraksi pengetahuan harian
// (app/api/cron/extract-knowledge) bisa pakai jalur AI yg sama persis --
// bukan duplikat implementasi baru.
export async function callGateway(req: NextRequest, fullPrompt: string, fileData?: string | null): Promise<{ text: string; provider: string; visionUnavailable?: boolean } | null> {
  const gatewayKey = process.env.MYAI_OS_GATEWAY_API_KEY || process.env.HOMEPAGE_GATEWAY_API_KEY;
  if (!gatewayKey) return null;

  const primaryUrl = process.env.MYAI_OS_GATEWAY_URL || "https://console.myai.nexus/api/v1/chat/completions";
  const localUrl = `${req.nextUrl.origin}/api/v1/chat/completions`;

  for (const gatewayUrl of [primaryUrl, localUrl]) {
    const result = await attemptGatewayCall(gatewayUrl, gatewayKey, fullPrompt, fileData);
    if (result.kind === "success") return { text: result.text, provider: result.provider };
    if (result.kind === "vision_unavailable") return { text: "", provider: "", visionUnavailable: true };
    if (result.kind === "fatal") return null; // jangan lanjut coba apa pun lagi, termasuk retry di bawah
    // "retryable" -- lanjut ke URL berikutnya seperti biasa.
  }

  // Kedua URL gagal (retry-able, bukan fatal) -- satu percobaan ulang lagi
  // ke primaryUrl sebelum benar2 menyerah. Insiden nyata (satu giliran jatuh
  // total ke simulateReply() tanpa AI sama sekali, provider sebelum/sesudah
  // giliran itu TETAP SAMA -- bukan pergantian tier) menunjukkan kegagalan
  // sesaat spt ini genuinely terjadi, bukan cuma teori.
  const retryResult = await attemptGatewayCall(primaryUrl, gatewayKey, fullPrompt, fileData);
  if (retryResult.kind === "success") return { text: retryResult.text, provider: retryResult.provider };
  if (retryResult.kind === "vision_unavailable") return { text: "", provider: "", visionUnavailable: true };

  return null;
}

/**
 * Fallback path: call active Provider keys stored in database or environment.
 */
async function callProviderDirect(
  fullPrompt: string,
  systemPrompt: string,
  parsedFileData?: { mimeType: string; base64Data: string } | null
): Promise<{ text?: string; provider?: string; error?: string; status?: number; promptTokens?: number; completionTokens?: number }> {
  // Priority Fallback Order preferred by Ecosystem Owner (Boss Bayu):
  // 1. Deepseek -> 2. GLM -> 3. Grok -> 4. Gemini -> 5. GPT -> 6. Claude
  const PREFERRED_ORDER = ["deepseek", "glm", "grok", "gemini", "gpt", "claude"];

  if (supabaseAdmin) {
    const { data: providerKeys } = await supabaseAdmin
      .from("gw_provider_keys")
      .select("id, provider, label, key_encrypted, usage_count, last_used_at, priority, cooldown_until")
      .eq("status", "active")
      .order("priority", { ascending: false })
      .order("last_used_at", { ascending: true, nullsFirst: true })
      .order("usage_count", { ascending: true });

    if (providerKeys && providerKeys.length > 0) {
      // Sort DB keys using preferred provider sequence when priorities are equal
      const sortedKeys = [...providerKeys].sort((a, b) => {
        if ((b.priority ?? 0) !== (a.priority ?? 0)) {
          return (b.priority ?? 0) - (a.priority ?? 0);
        }
        const indexA = PREFERRED_ORDER.indexOf(a.provider);
        const indexB = PREFERRED_ORDER.indexOf(b.provider);
        return (indexA !== -1 ? indexA : 99) - (indexB !== -1 ? indexB : 99);
      });

      for (const selected of sortedKeys) {
        // Skip keys in active cooldown
        if (selected.cooldown_until && new Date(selected.cooldown_until) > new Date()) continue;

        const adapter = PROVIDER_REGISTRY[selected.provider];
        if (!adapter) continue;

        try {
          const apiKey = decryptKey(selected.key_encrypted);
          if (!apiKey || apiKey.includes("<") || apiKey.includes("placeholder")) continue;

          await supabaseAdmin
            .from("gw_provider_keys")
            .update({
              usage_count: (selected.usage_count ?? 0) + 1,
              last_used_at: new Date().toISOString(),
            })
            .eq("id", selected.id);

          const result = await adapter.call(
            apiKey,
            fullPrompt,
            systemPrompt,
            { temperature: 0.7 },
            parsedFileData ?? null,
            selected.id,
            selected.label || `${selected.provider} key`
          );

          if (result.success && result.aiResponseText) {
            return {
              text: result.aiResponseText,
              provider: selected.provider,
              promptTokens: result.promptTokens,
              completionTokens: result.completionTokens,
            };
          }
        } catch (err) {
          console.warn(`[homepage-chat] Provider call failed for ${selected.provider}:`, err);
        }
      }
    }
  }

  const envFallbacks: { provider: string; envVar: string }[] = [
    { provider: "deepseek", envVar: process.env.DEEPSEEK_API_KEY1 || process.env.DEEPSEEK_API_KEY || "" },
    { provider: "glm", envVar: process.env.GLM_API_KEY1 || process.env.GLM_API_KEY || "" },
    { provider: "grok", envVar: process.env.GROK_API_KEY1 || process.env.GROK_API_KEY || "" },
    { provider: "gemini", envVar: process.env.GEMINI_API_KEY1 || process.env.GEMINI_API_KEY || "" },
    { provider: "gpt", envVar: process.env.OPENAI_API_KEY1 || process.env.OPENAI_API_KEY || "" },
    { provider: "claude", envVar: process.env.CLAUDE_API_KEY1 || process.env.CLAUDE_API_KEY || "" },
  ];

  for (const item of envFallbacks) {
    const apiKey = item.envVar?.trim();
    if (!apiKey || apiKey.includes("<") || apiKey.includes("placeholder") || apiKey === "MY_GEMINI_API_KEY") continue;

    const adapter = PROVIDER_REGISTRY[item.provider];
    if (!adapter) continue;

    const result = await adapter.call(
      apiKey,
      fullPrompt,
      systemPrompt,
      { temperature: 0.7 },
      parsedFileData ?? null,
      null,
      `${item.provider} env key`
    );
    if (result.success && result.aiResponseText) {
      return {
        text: result.aiResponseText,
        provider: item.provider,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
      };
    }
  }

  return {};
}

/**
 * Catat riwayat percakapan + pemakaian token utk user yang sedang login, dan
 * catat pertanyaan ke metrics_events (buat panel Metrics "Pertanyaan
 * Terbanyak"). Selalu dipanggil non-blocking (fire-and-forget) supaya tidak
 * menambah latensi balasan ke pengguna. Chat anonim (belum login) tetap
 * boleh jalan seperti biasa — cuma dilewati bagian riwayat/token usage-nya.
 */
async function logChatTurn(opts: {
  profile: Profile | null;
  prompt: string;
  responseText: string;
  provider: string;
  history: HomeChatMessage[];
  promptTokens?: number;
  completionTokens?: number;
  guestId?: string | null;
  ip?: string;
  conversationId?: string | null;
}) {
  const { profile, prompt, responseText, provider, history, promptTokens, completionTokens, guestId, ip, conversationId } = opts;

  try {
    await logMetricEvent({ type: "ai_question", targetText: prompt, userId: profile?.id });
  } catch (e) {
    console.warn("[homepage-chat] Failed logging ai_question metric:", e);
  }

  // Chat anonim (belum login): tidak ada riwayat/token_usage buat disimpan,
  // tapi giliran ini TETAP dihitung ke jatah kuota tamu (lihat lib/ai-usage-quota.ts).
  if (!profile) {
    if (guestId) await incrementGuestQuota(guestId, ip ?? "unknown");
    return;
  }

  try {
    const now = new Date().toISOString();
    const messages = [
      ...history.map((m) => ({ role: m.role, content: m.content, timestamp: m.timestamp })),
      { role: "user", content: prompt, timestamp: now },
      { role: "assistant", content: responseText, timestamp: now },
    ];
    const title = prompt.slice(0, 60) + (prompt.length > 60 ? "..." : "");
    // conversationId dikirim client dari sesi yg sudah dibuat lewat
    // POST /api/public/conversations (lihat HomeApp.tsx) -- kalau dikirim,
    // ini meng-UPDATE baris yg sama tiap giliran (bukan bikin baris baru
    // tiap kali chat, yg sebelumnya jadi bug krn selalu undefined di sini).
    await saveConversation(profile.id, conversationId || undefined, title, messages);
  } catch (e) {
    console.warn("[homepage-chat] Failed saving conversation history:", e);
  }

  // Ekstraksi memori ringan (regex, bukan panggilan AI tambahan) -- non-blocking,
  // tidak menunda apa pun karena logChatTurn sendiri sudah dipanggil via `void`.
  try {
    const candidates = extractMemoryCandidates(prompt);
    for (const c of candidates) {
      void upsertUserMemory(profile.id, c.content, c.category).catch((e) =>
        console.warn("[homepage-chat] Failed saving memory candidate:", e)
      );
    }
  } catch (e) {
    console.warn("[homepage-chat] Failed extracting memory candidates:", e);
  }

  if (!supabaseAdmin) return;
  try {
    await supabaseAdmin.from("token_usage").insert({
      user_id: profile.id,
      provider,
      endpoint: "homepage_chat",
      tokens_used: (promptTokens ?? 0) + (completionTokens ?? 0),
    });
  } catch (e) {
    console.warn("[homepage-chat] Failed logging token_usage:", e);
  }
}

/**
 * Fase NYATA giliran chat, dikirim sbg event SSE `phase` SEBELUM teks
 * jawaban mulai mengalir -- dipakai components/homepage/BoganiThinkingIndicator.tsx
 * utk menampilkan kata Mongondow yang sesuai TAHAP SUNGGUHAN (bukan timer
 * kosmetik tetap 33/33/33 spt sebelumnya). "berpikir" = menyiapkan konteks
 * (kamus/pengetahuan/memori, termasuk compacting kalau lagi kena giliran itu
 * -- makin lama proses ini beneran, makin lama juga fase ini tampil, JUJUR).
 * "mencari_jawaban" = sedang menunggu Gateway/provider AI (bagian paling
 * lama). "menampilkan" cuma penanda transisi -- begitu event ini terkirim,
 * delta teks asli langsung menyusul, jadi indikator otomatis diganti teks
 * sungguhan (tidak perlu kata Mongondow tersendiri utk fase ini).
 */
type ChatPhase = "berpikir" | "mencari_jawaban" | "menampilkan";
type PhaseCallback = (phase: ChatPhase) => void;

/** Error terkontrol dari runChatPipeline() -- membawa status HTTP yg benar (dipakai jalur non-stream & jalur stream utk kirim event `error`). */
class ChatPipelineError extends Error {
  status: number;
  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
  }
}

function sendSseEvent(controller: ReadableStreamDefaultController, encoder: TextEncoder, event: string, data: unknown) {
  controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
}

/**
 * Emit teks yg SUDAH lengkap (upstream sudah selesai dipanggil dgn await)
 * sbg deretan event `delta`, kata per kata -- animasi "ketik" di client,
 * BUKAN streaming token asli dari provider (lihat catatan lebih lengkap di
 * git history commit sebelumnya). Total waktu animasi dibatasi
 * (ANIMATION_BUDGET_MS) apa pun panjang balasannya spy balasan panjang tidak
 * kena pajak waktu tambahan yg tidak perlu.
 */
async function streamTextAsDeltas(controller: ReadableStreamDefaultController, encoder: TextEncoder, fullText: string) {
  const words = fullText.match(/\S+|\s+/g) || [fullText];
  const ANIMATION_BUDGET_MS = 500;
  const perWordDelayMs = words.length > 0 ? Math.min(12, ANIMATION_BUDGET_MS / words.length) : 0;
  for (const word of words) {
    sendSseEvent(controller, encoder, "delta", { text: word });
    if (perWordDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, perWordDelayMs));
    }
  }
}

/** Dipakai jalur cepat (balasan instan) -- tidak ada fase nyata utk ditunggu, langsung delta+done. */
function createInstantStreamResponse(fullText: string, provider: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      await streamTextAsDeltas(controller, encoder, fullText);
      sendSseEvent(controller, encoder, "done", { provider });
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Provider-Used": provider,
    },
  });
}

interface ChatPipelineOpts {
  req: NextRequest;
  prompt: string;
  history: HomeChatMessage[];
  memoryRows: UserMemoryRow[];
  isVoiceMode: boolean;
  fileInput?: string;
  parsedFileData?: { mimeType: string; base64Data: string } | null;
  lang: Language;
  profile: Profile | null;
  guestId: string | null;
  ip: string;
  conversationId: string | null;
  existingSummary: string;
  summarizedThroughCount: number;
  onPhase?: PhaseCallback;
  /** Dipanggil SEKALI per giliran dgn daftar Kamus/Knowledge Base/kosakata yg benar2 dipakai menyusun prompt -- kosong kalau tidak ada yg cocok. */
  onSources?: (sources: string[]) => void;
}

interface ChatPipelineResult {
  text: string;
  provider: string;
  contextSummary: string;
  summarizedThroughCount: number;
  sources: string[];
}

/**
 * Logika INTI satu giliran chat: siapkan konteks (+ compacting kalau perlu)
 * -> coba Gateway -> coba provider langsung -> simulasi terakhir. Diekstrak
 * dari POST handler supaya SATU sumber kebenaran dipakai baik oleh jalur
 * streaming (createLiveChatStream, lewat onPhase utk event SSE `phase` nyata)
 * MAUPUN jalur JSON non-stream -- dua jalur itu dulu berisiko diverge kalau
 * ditulis terpisah.
 */
/**
 * Simpan SETIAP giliran chat (bukan cuma yg gagal total spt sebelumnya) ke
 * gw_data_center -- ini bahan mentah utk job ekstraksi pengetahuan harian
 * (lihat app/api/cron/extract-knowledge/route.ts). Sengaja SELALU jalan,
 * tamu maupun user login -- sebelumnya riwayat tamu tidak tersimpan sama
 * sekali di mana pun, jadi "bahan mentah"-nya cuma sebagian kecil trafik.
 * Non-blocking (fire-and-forget), tidak menunda balasan ke user.
 *
 * PERBAIKAN BUG: sebelumnya pakai source_type "chatbot_interaction" yg
 * TIDAK ADA di CHECK constraint tabel ini (cuma ocr_upload/url_scrape/
 * manual_document/chat_memory_fact) -- insert-nya kemungkinan besar diam2
 * gagal terus (dibungkus try/catch, cuma console.warn, tidak pernah
 * ketahuan). "chat_memory_fact" SUDAH ada di constraint & memang
 * dimaksudkan utk kasus persis ini.
 */
function syncToDataCenter(opts: {
  prompt: string;
  responseText: string;
  provider: string;
  isVoiceMode: boolean;
  lang: Language;
}) {
  if (!supabaseAdmin) return;
  const { prompt, responseText, provider, isVoiceMode, lang } = opts;
  (async () => {
    try {
      await supabaseAdmin.from("gw_data_center").insert({
        id: crypto.randomUUID(),
        // SEBELUMNYA hardcode UUID "MyAI Chat app id" yg TIDAK PERNAH ada di
        // tabel gw_client_apps proyek Supabase ini -- setiap insert selalu
        // gagal kena foreign key constraint (silently, dibungkus try/catch),
        // sejak tabel ini dibuat (20260717) sampai baru ketahuan hari ini
        // (2026-08-18) saat mengetes fitur ini. client_app_id NULLABLE
        // (ON DELETE SET NULL) -- MongondowPedia/Bogani AI memang tidak
        // terdaftar sbg client app terpisah di ekosistem gw_client_apps,
        // jadi null di sini benar, bukan tambal sulam.
        client_app_id: null,
        field_key: isVoiceMode ? "voice_chat_homepage" : GATEWAY_FIELD,
        source_type: "chat_memory_fact",
        document_type: isVoiceMode ? "voice_chat" : "text_chat",
        extracted_data: {
          source_app: "myai-chat",
          field_key: isVoiceMode ? "voice_chat_homepage" : GATEWAY_FIELD,
          provider_display: provider,
          user_message: prompt.substring(0, 1000),
          ai_response: responseText.substring(0, 2000),
          is_voice_mode: isVoiceMode,
          processed_at: new Date().toISOString(),
        },
        raw_text: `[${isVoiceMode ? "VOICE CHAT" : "HOMEPAGE CHAT"}] User: ${prompt}\n---\nAI: ${responseText.slice(0, 2000)}`,
        language: lang,
        tags: ["homepage", "myai-chat", isVoiceMode ? "voice_interaction" : "text_chat", lang],
        // false di sini, BUKAN diabaikan -- job cron harian
        // (app/api/cron/extract-knowledge) yg menyaring mana yg genuinely
        // menarik utk ditinjau verifikator (jadi true), drpd SEMUA giliran
        // chat langsung membanjiri antrean review dari menit pertama.
        manual_review_required: false,
        review_status: "pending",
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("[homepage-chat] Data Center sync warning:", e);
    }
  })();
}

async function runChatPipeline(opts: ChatPipelineOpts): Promise<ChatPipelineResult> {
  const { req, prompt, history, memoryRows, isVoiceMode, fileInput, parsedFileData, lang, profile, guestId, ip, conversationId } = opts;

  opts.onPhase?.("berpikir");
  const { summary: contextSummary, summarizedThroughCount } = await compactOverflowIfNeeded({
    history,
    existingSummary: opts.existingSummary,
    summarizedThroughCount: opts.summarizedThroughCount,
    req,
  });
  const { prompt: fullPrompt, sources } = await buildPromptWithHistory(history, prompt, formatMemoryContext(memoryRows), isVoiceMode, contextSummary);
  opts.onSources?.(sources);

  opts.onPhase?.("mencari_jawaban");

  // 1. Preferred: route through the AI Gateway (myai.nexus or local) as a registered client app.
  const gatewayResult = await callGateway(req, fullPrompt, fileInput);
  if (gatewayResult && gatewayResult.text) {
    void logChatTurn({ profile, prompt, responseText: gatewayResult.text, provider: gatewayResult.provider, history, guestId, ip, conversationId });
    syncToDataCenter({ prompt, responseText: gatewayResult.text, provider: gatewayResult.provider, isVoiceMode, lang });
    return { text: gatewayResult.text, provider: gatewayResult.provider, contextSummary, summarizedThroughCount, sources };
  }

  let systemPrompt = lang === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_ID;
  if (isVoiceMode) {
    systemPrompt += `\n\n--- INSTRUKSI KHUSUS MODE SUARA LANGSUNG (VOICE DIRECTIVE) ---
Jawab secara lisan dengan hangat, natural, dan ringkas (maksimal 2–3 kalimat). JANGAN PERNAH gunakan pemformatan markdown seperti cetak tebal (**), bullet points (-), tabel (|), atau header (#). Ucapkan nama tempat dan kosa kata Mongondow dengan fonetik yang jernih dan santun.`;
  }

  const direct = await callProviderDirect(fullPrompt, systemPrompt, parsedFileData);
  if (direct.error) {
    throw new ChatPipelineError(`MyAI OS AI Error: ${direct.error}`, direct.status || 500);
  }
  if (direct.text) {
    const provider = direct.provider || "gemini";
    void logChatTurn({
      profile, prompt, responseText: direct.text, provider, history,
      promptTokens: direct.promptTokens, completionTokens: direct.completionTokens,
      guestId, ip, conversationId,
    });
    syncToDataCenter({ prompt, responseText: direct.text, provider, isVoiceMode, lang });
    return { text: direct.text, provider, contextSummary, summarizedThroughCount, sources };
  }

  // 3. Fallback simulation if no API key is set
  const isFirstMsg = !history || history.length === 0;
  // simulateReply() buta terhadap gambar (murni pattern-match teks) -- kalau
  // ada file yg diupload dan sampai di sini artinya TIDAK ADA jalur (Gateway
  // maupun provider langsung) yg berhasil memprosesnya. Jujur ke user drpd
  // pura2 jawab teks generik yg tidak menyinggung gambarnya sama sekali.
  const simulatedText = parsedFileData
    ? "Mohon maaf Utat, saat ini belum ada AI dengan kemampuan membaca gambar yang tersedia untuk memproses file yang dikirim. Coba lagi beberapa saat lagi, atau kirim pertanyaannya dalam bentuk teks ya."
    : simulateReply(prompt, lang, isFirstMsg);
  void logChatTurn({ profile, prompt, responseText: simulatedText, provider: "simulated", history, guestId, ip, conversationId });
  syncToDataCenter({ prompt, responseText: simulatedText, provider: direct.provider || "gemini", isVoiceMode, lang });

  return { text: simulatedText, provider: "gemini", contextSummary, summarizedThroughCount, sources };
}

/** Jalur utama (Gateway/direct/simulated) -- fase SSE dikirim di titik cek nyata di runChatPipeline, bukan timer kosmetik. */
function createLiveChatStream(pipelineOpts: Omit<ChatPipelineOpts, "onPhase" | "onSources">): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await runChatPipeline({
          ...pipelineOpts,
          onPhase: (phase) => sendSseEvent(controller, encoder, "phase", { phase }),
          onSources: (sources) => {
            if (sources.length > 0) sendSseEvent(controller, encoder, "sources", { sources });
          },
        });
        const menampilkanPhase: ChatPhase = "menampilkan";
        sendSseEvent(controller, encoder, "phase", { phase: menampilkanPhase });
        await streamTextAsDeltas(controller, encoder, result.text);
        sendSseEvent(controller, encoder, "done", {
          provider: result.provider,
          contextSummary: result.contextSummary,
          summarizedThroughCount: result.summarizedThroughCount,
        });
      } catch (e) {
        const message = e instanceof ChatPipelineError ? e.message : (e instanceof Error ? e.message : "Gagal memproses balasan Bogani AI");
        // enqueue() bisa ikut melempar kalau controller sudah tertutup (mis.
        // klien memutus koneksi di tengah jalan) -- jangan biarkan itu jadi
        // unhandled rejection kedua, cukup diam saja krn tidak ada lagi yg
        // mendengarkan.
        try {
          sendSseEvent(controller, encoder, "error", { message });
        } catch { /* koneksi klien sudah putus, tidak ada yg perlu dilakukan */ }
      }
      try {
        controller.close();
      } catch { /* sudah tertutup/error -- aman diabaikan */ }
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}

// Perlu diperpanjang dari default platform (Vercel: 10s di Hobby) supaya
// tidak mematikan function ini sebelum GATEWAY_TIMEOUT_MS di atas selesai
// menunggu jawaban Gateway yang nyata.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // Dimulai sedini mungkin, paralel dgn rate-limit check & body parsing di
  // bawah -- profile baru benar-benar dipakai nanti di logChatTurn(), bukan
  // sebelum panggilan AI dimulai, jadi tidak perlu menambah latensi berurutan
  // di jalur kritis (sebelumnya di-await tepat sebelum callGateway, padahal
  // tidak dipakai sama sekali oleh callGateway).
  const profilePromise = getCurrentUserProfile().catch(() => null);

  const rateCheck = await checkRateLimit(ip, RATE_LIMITS.HOMEPAGE_CHAT);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Batas limit request tercapai. Silakan coba lagi setelah ${rateCheck.resetAt.toLocaleTimeString("id-ID")}.` },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  let prompt: string = body.prompt || "";
  const history: HomeChatMessage[] = Array.isArray(body.history) ? body.history : [];
  const lang: Language = body.lang === 'en' ? 'en' : 'id';
  const wantStream: boolean = body.stream !== false;
  const fileInput: string | undefined = body.file || body.image;

  let parsedFileData: { mimeType: string; base64Data: string } | null = null;

  if (fileInput) {
    const parsedFile = await parseUploadedFile(fileInput);
    if (parsedFile.category === "unsupported") {
      return NextResponse.json({ error: parsedFile.error }, { status: 400 });
    }
    if (parsedFile.extractedText) {
      prompt = `--- KONTEN DOKUMEN (${parsedFile.originalMimeType}) ---\n${parsedFile.extractedText}\n--- AKHIR DOKUMEN ---\n\n${prompt}`;
    }
    if (parsedFile.imageData) {
      parsedFileData = parsedFile.imageData;
    }
  }

  if (!prompt && !parsedFileData) {
    return NextResponse.json({ error: "Prompt or file is required" }, { status: 400 });
  }

  const conversationId: string | null = typeof body.conversationId === "string" ? body.conversationId : null;
  const isVoiceMode = body.isVoiceMode || body.isVoiceInput || prompt.includes("[voice]");
  const profile = await profilePromise;

  // Balasan instan (sapaan pendek spt "halo"/"assalamualaikum"/"selamat
  // pagi") -- SEBELUM cek kuota & SEBELUM panggil Gateway/AI apa pun, supaya
  // benar2 instan (tanpa nunggu ~15-20 detik) dan TIDAK memakan jatah kuota
  // harian user/tamu. Tidak berlaku utk file/voice mode -- lihat
  // matchInstantReply() utk syarat pesan pendeknya.
  if (!parsedFileData && !isVoiceMode) {
    const instantReplyRows = await getActiveInstantReplies();
    const instantText = matchInstantReply(prompt, instantReplyRows);
    if (instantText) {
      if (profile) {
        const now = new Date().toISOString();
        const historyMessages = [
          ...history.map((m) => ({ role: m.role, content: m.content, timestamp: m.timestamp })),
          { role: "user", content: prompt, timestamp: now },
          { role: "assistant", content: instantText, timestamp: now },
        ];
        void saveConversation(profile.id, conversationId || undefined, prompt.slice(0, 60), historyMessages).catch((e) =>
          console.warn("[homepage-chat] Failed saving instant-reply conversation:", e)
        );
      }
      if (wantStream) {
        return createInstantStreamResponse(instantText, "instant");
      }
      return NextResponse.json({ text: instantText, provider_used: "instant" }, { headers: { "X-Provider-Used": "instant" } });
    }
  }

  // Kontrol pemakaian AI (lihat lib/ai-usage-quota.ts): tamu dapat jatah
  // kecil sekali-pakai (wajib login/daftar sesudahnya), User biasa dapat
  // jatah harian, verifikator & admin tanpa batas. Dicek SEBELUM memanggil
  // provider AI manapun supaya yg sudah habis jatah tidak membebani biaya.
  // Memori user (kalau login) di-fetch PARALEL dgn cek kuota -- dua-duanya
  // cuma butuh profile.id, tidak saling bergantung, jadi tidak menambah
  // latensi berurutan dibanding sebelumnya cuma cek kuota saja.
  const guestId = profile ? null : getOrCreateGuestId(req.headers.get("cookie")).guestId;
  const [quota, memoryRows] = await Promise.all([
    profile ? checkUserQuota(profile.id, profile.role) : checkGuestQuota(guestId!, ip),
    profile ? listUserMemory(profile.id).catch(() => []) : Promise.resolve([]),
  ]);

  if (!quota.allowed) {
    const blocked = NextResponse.json(
      { error: quota.message, quotaExceeded: true, requiresAuth: !profile },
      { status: 403 }
    );
    if (guestId) setGuestCookieHeader(blocked, guestId);
    return blocked;
  }

  // Ringkasan percakapan (compacting) dikirim balik client giliran
  // sebelumnya (lihat event/field `done` -> contextSummary/summarizedThroughCount)
  // -- lihat compactOverflowIfNeeded() & runChatPipeline().
  const existingSummary: string = typeof body.contextSummary === "string" ? body.contextSummary : "";
  const summarizedThroughCount: number = typeof body.summarizedThroughCount === "number" && body.summarizedThroughCount >= 0 ? body.summarizedThroughCount : 0;

  const pipelineOpts: Omit<ChatPipelineOpts, "onPhase" | "onSources"> = {
    req, prompt, history, memoryRows, isVoiceMode, fileInput, parsedFileData, lang,
    profile, guestId, ip, conversationId, existingSummary, summarizedThroughCount,
  };

  if (wantStream) {
    const res = createLiveChatStream(pipelineOpts);
    if (guestId) setGuestCookieHeader(res, guestId);
    return res;
  }

  try {
    const result = await runChatPipeline(pipelineOpts);
    const res = NextResponse.json(
      { text: result.text, provider_used: result.provider, contextSummary: result.contextSummary, summarizedThroughCount: result.summarizedThroughCount, sources: result.sources },
      { headers: { "X-Provider-Used": result.provider } }
    );
    if (guestId) setGuestCookieHeader(res, guestId);
    return res;
  } catch (e) {
    const status = e instanceof ChatPipelineError ? e.status : 500;
    const message = e instanceof Error ? e.message : "Gagal memproses balasan Bogani AI";
    const res = NextResponse.json({ error: message }, { status });
    if (guestId) setGuestCookieHeader(res, guestId);
    return res;
  }
}

