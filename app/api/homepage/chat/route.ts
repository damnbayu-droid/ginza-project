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

function getKamusContext(userPrompt: string): string {
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
    if (matchedWords.size === 0) return "";

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
    return ctx;
  } catch (e) {
    console.warn("[homepage-chat] Failed retrieving kamus context:", e);
  }
  return "";
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
function getLanguageMixContext(userPrompt: string): string {
  try {
    const manadoMatches = searchManadoPhrases(userPrompt, 6);
    const manado = manadoMatches.length > 0 ? manadoMatches : getFeaturedManadoPhrases().slice(0, 4);

    const mongondowMatches = searchMongondowVerifiedWords(userPrompt, 8);
    const mongondow = mongondowMatches.length > 0 ? mongondowMatches : getFeaturedMongondowWords().slice(0, 4);

    if (manado.length === 0 && mongondow.length === 0) return "";

    let ctx = `\n\n--- KOSAKATA MANADO & MONGONDOW UNTUK CAMPURAN BAHASA (boleh dipakai apa adanya, JANGAN dikarang di luar daftar ini) ---\n`;
    if (manado.length > 0) {
      ctx += `Manado:\n${manado.map((m) => `- "${m.indonesia}" → ${m.manado}`).join("\n")}\n`;
    }
    if (mongondow.length > 0) {
      ctx += `Mongondow ✔:\n${mongondow.map((w) => `- ${w.mongondow} = ${w.meaning}${w.example ? ` (${w.example})` : ""}`).join("\n")}\n`;
    }
    ctx += `--- AKHIR KOSAKATA CAMPURAN BAHASA ---`;
    return ctx;
  } catch (e) {
    console.warn("[homepage-chat] Failed retrieving language-mix context:", e);
  }
  return "";
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

// Dulu instruksi ini cuma ditempel ke systemPrompt yg dipakai callProviderDirect
// (jalur fallback yg nyaris tak pernah kena krn callGateway hampir selalu
// berhasil duluan) -- jadi di praktiknya nyaris tidak pernah benar2 sampai
// ke AI. Sekarang ditaruh di sini supaya ikut fullPrompt yg dikirim ke
// callGateway (jalur yg SUNGGUHAN dipakai), utk kedua jalur sekaligus.
const VOICE_MODE_DIRECTIVE = `[MODE SUARA LANGSUNG AKTIF]: Balasan ini akan DIUCAPKAN keras (text-to-speech), bukan dibaca sbg teks. Jawab dgn hangat & natural spt bicara langsung, ringkas tapi tidak dipotong paksa (idealnya 2-4 kalimat utk topik ringan, boleh lebih panjang kalau pertanyaannya memang butuh penjelasan, tapi tetap dalam gaya lisan bukan tulisan formal). JANGAN PERNAH pakai pemformatan markdown (bold **, bullet -, tabel |, header #) krn semua itu akan diucapkan literal & terdengar aneh. Ucapkan nama tempat & kosa kata Mongondow dgn fonetik yg jernih.`;

function buildPromptWithHistory(history: HomeChatMessage[], prompt: string, memoryCtx: string = "", isVoiceMode: boolean = false): string {
  const kamusCtx = getKamusContext(prompt);
  const languageMixCtx = getLanguageMixContext(prompt);
  let knowledgeCtx = "";
  try {
    knowledgeCtx = getKnowledgeContext(prompt);
  } catch (e) {
    console.warn("[homepage-chat] Failed retrieving knowledge context:", e);
  }

  const personaHeader = `[SYSTEM INSTRUCTION BOGANI AI]:\n${SYSTEM_PROMPT_ID}${isVoiceMode ? `\n\n${VOICE_MODE_DIRECTIVE}` : ""}\n\n`;
  const fullPrompt = prompt + kamusCtx + languageMixCtx + memoryCtx + knowledgeCtx;
  const isFirstTurn = !Array.isArray(history) || history.length === 0;

  // Sinyal eksplisit & terstruktur ttg posisi giliran ini -- diletakkan
  // SEDEKAT MUNGKIN ke titik AI mulai menjawab (bukan cuma disebut sekali di
  // persona yg panjang di atas), krn instruksi dekat titik-generate jauh
  // lebih dipatuhi LLM drpd instruksi yg terkubur jauh di awal system
  // prompt. Perbaikan atas laporan Boss Bayu: AI tetap mengulang "Niondon"
  // di balasan lanjutan walau persona sudah eksplisit melarangnya (lihat
  // lib/bogani-persona.ts) -- ini penegasan tambahan, bukan pengganti aturan
  // yg sudah ada di sana.
  const turnStatus = isFirstTurn
    ? `[STATUS SESI: Ini pesan PERTAMA di sesi obrolan ini -- boleh buka dgn sapaan "Niondon"/"Dega Niondon" SEKALI saja sesuai aturan persona di atas.]`
    : `[STATUS SESI: Sesi obrolan ini SUDAH BERJALAN (bukan pesan pertama) -- JANGAN gunakan kata "Niondon" atau "Dega Niondon" sama sekali di balasan ini. Langsung tanggapi tanpa sapaan pembuka.]`;

  if (isFirstTurn) return `${personaHeader}${turnStatus}\n\n${fullPrompt}`;

  const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);
  const historyText = recentHistory
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => `${m.role === 'user' ? 'User' : AI_NAME}: ${m.content}`)
    .join("\n\n");

  return `${personaHeader}${historyText}\n\n${turnStatus}\n\nUser: ${fullPrompt}`;
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
  return `${greeting}Terima kasih telah menghubungi **${AI_NAME}** di **${WEBSITE_NAME}**. Mengenai pertanyaan Utat tentang *"${prompt}"*, mari kita pelajari bersama informasi dan etimologinya secara mendalam. Ada topik spesifik yang ingin Utat tanyakan lebih lanjut?`;
}

/**
 * Preferred path: call Gateway AI (MYAI_OS_GATEWAY_URL or local /api/v1/chat/completions)
 */
async function callGateway(req: NextRequest, fullPrompt: string, fileData?: string | null): Promise<{ text: string; provider: string; visionUnavailable?: boolean } | null> {
  const gatewayKey = process.env.MYAI_OS_GATEWAY_API_KEY || process.env.HOMEPAGE_GATEWAY_API_KEY;
  if (!gatewayKey) return null;

  const primaryUrl = process.env.MYAI_OS_GATEWAY_URL || "https://console.myai.nexus/api/v1/chat/completions";
  const localUrl = `${req.nextUrl.origin}/api/v1/chat/completions`;

  const urlsToTry = [primaryUrl, localUrl];

  for (const gatewayUrl of urlsToTry) {
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

        if (replyText) {
          return { text: replyText, provider: providerUsed };
        }
      } else {
        const errBody = await res.json().catch(() => ({}));
        console.warn(`[homepage-chat] Gateway (${gatewayUrl}) failed (${res.status}): ${errBody.error || "Unknown"}`);

        if (res.status === 422) {
          // Gambar dikirim tapi Gateway tidak punya provider vision di pool
          // field ini saat ini -- bukan kegagalan yg bisa diperbaiki dgn coba
          // URL Gateway lain (pool-nya sama). Tandai supaya pemanggil bisa
          // kasih pesan jujur ke user kalau callProviderDirect (fallback
          // berikutnya, provider vision langsung) juga tidak berhasil --
          // bukan diam2 jatuh ke simulateReply() yg buta terhadap gambar.
          return { text: "", provider: "", visionUnavailable: true };
        }
        if (res.status === 400) {
          // Fatal -- request ini sendiri yg salah (bukan soal server/provider
          // sedang down), mengulang body yg PERSIS SAMA ke URL fallback
          // (lokal) cuma akan gagal identik. Hentikan loop di sini, bukan
          // buang waktu retry sia-sia.
          break;
        }
        // 401/429/502/503 dll: lanjut coba URL berikutnya seperti biasa --
        // ini genuinely retry-able atau setidaknya tidak rugi dicoba di
        // endpoint lain (mis. 401 di Gateway remote ≠ 401 di local clone,
        // beda auth store).
      }
    } catch (err) {
      console.warn(`[homepage-chat] Gateway (${gatewayUrl}) unreachable:`, err);
    }
  }

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
 * Helper function utk animasi "ketik" di client. CATATAN JUJUR: ini BUKAN
 * streaming token asli dari provider AI -- teks yang masuk ke sini (fullText)
 * SUDAH lengkap (upstream sudah selesai dipanggil dgn await). Ini cuma
 * memutar ulang string yang sudah jadi, kata per kata, ke client.
 *
 * Sebelumnya delay antar-kata tetap 12ms terlepas dari panjang teks --
 * untuk balasan panjang (misal 300 kata) itu nambah ~3.6 detik LATENSI
 * MURNI di atas waktu tunggu provider AI, padahal teksnya sudah selesai
 * dan cuma menunggu jadwal setTimeout. Sekarang total waktu animasi
 * dibatasi (ANIMATION_BUDGET_MS) apa pun panjang balasannya -- balasan
 * pendek tetap terasa "diketik", balasan panjang tidak kena pajak waktu
 * tambahan yang tidak perlu.
 *
 * Perbaikan yang SEBENARNYA (streaming token asli dari provider, lewat
 * `stream: true` + SSE per-provider di lib/provider-adapters/) belum
 * dikerjakan di sini -- itu perubahan lebih besar & butuh diuji langsung
 * di browser/deploy nyata (sandbox ini tak punya API key provider utk
 * dites live), jadi sengaja belum disentuh biar tidak dikirim buta.
 */
function createTextStreamResponse(fullText: string, provider: string = "gemini"): Response {
  const encoder = new TextEncoder();
  const words = fullText.match(/\S+|\s+/g) || [fullText];
  const ANIMATION_BUDGET_MS = 500;
  const perWordDelayMs = words.length > 0 ? Math.min(12, ANIMATION_BUDGET_MS / words.length) : 0;

  const stream = new ReadableStream({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(word));
        if (perWordDelayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, perWordDelayMs));
        }
      }
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
        return createTextStreamResponse(instantText, "instant");
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

  const fullPrompt = buildPromptWithHistory(history, prompt, formatMemoryContext(memoryRows), isVoiceMode);

  if (!quota.allowed) {
    const blocked = NextResponse.json(
      { error: quota.message, quotaExceeded: true, requiresAuth: !profile },
      { status: 403 }
    );
    if (guestId) setGuestCookieHeader(blocked, guestId);
    return blocked;
  }

  // 1. Preferred: route through the AI Gateway (myai.nexus or local) as a registered client app.
  const gatewayResult = await callGateway(req, fullPrompt, fileInput);
  if (gatewayResult && gatewayResult.text) {
    void logChatTurn({ profile, prompt, responseText: gatewayResult.text, provider: gatewayResult.provider, history, guestId, ip, conversationId });
    if (wantStream) {
      const res = createTextStreamResponse(gatewayResult.text, gatewayResult.provider);
      if (guestId) setGuestCookieHeader(res, guestId);
      return res;
    }
    const res = NextResponse.json({ text: gatewayResult.text, provider_used: gatewayResult.provider }, { headers: { "X-Provider-Used": gatewayResult.provider } });
    if (guestId) setGuestCookieHeader(res, guestId);
    return res;
  }

  let systemPrompt = lang === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_ID;

  if (isVoiceMode) {
    systemPrompt += `\n\n--- INSTRUKSI KHUSUS MODE SUARA LANGSUNG (VOICE DIRECTIVE) ---
Jawab secara lisan dengan hangat, natural, dan ringkas (maksimal 2–3 kalimat). JANGAN PERNAH gunakan pemformatan markdown seperti cetak tebal (**), bullet points (-), tabel (|), atau header (#). Ucapkan nama tempat dan kosa kata Mongondow dengan fonetik yang jernih dan santun.`;
  }

  const direct = await callProviderDirect(fullPrompt, systemPrompt, parsedFileData);

  if (direct.error) {
    return NextResponse.json({ error: `MyAI OS AI Error: ${direct.error}` }, { status: direct.status || 500 });
  }
  if (direct.text) {
    const provider = direct.provider || "gemini";
    void logChatTurn({
      profile,
      prompt,
      responseText: direct.text,
      provider,
      history,
      promptTokens: direct.promptTokens,
      completionTokens: direct.completionTokens,
      guestId,
      ip,
      conversationId,
    });
    if (wantStream) {
      const res = createTextStreamResponse(direct.text, provider);
      if (guestId) setGuestCookieHeader(res, guestId);
      return res;
    }
    const res = NextResponse.json({ text: direct.text, provider_used: provider }, { headers: { "X-Provider-Used": provider } });
    if (guestId) setGuestCookieHeader(res, guestId);
    return res;
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
  // Non-blocking sync to MyAI OS Master Data Center
  (async () => {
    try {
      if (supabaseAdmin) {
        const isVoice = body.isVoiceMode || prompt.includes("[voice]");
        const recordId = crypto.randomUUID();
        const responseText = gatewayResult?.text || direct.text || simulatedText || "";

        await supabaseAdmin.from("gw_data_center").insert({
          id: recordId,
          client_app_id: "c4fa9b89-8cf6-4d9c-a68f-3134664536fd", // MyAI Chat app id
          field_key: isVoice ? "voice_chat_homepage" : GATEWAY_FIELD,
          source_type: "chatbot_interaction",
          document_type: isVoice ? "voice_chat" : "text_chat",
          extracted_data: {
            source_app: "myai-chat",
            field_key: isVoice ? "voice_chat_homepage" : GATEWAY_FIELD,
            provider_display: direct.provider || "Gemini",
            user_message: prompt.substring(0, 1000),
            ai_response: responseText.substring(0, 2000),
            is_voice_mode: isVoice,
            messages: [
              ...history.map((m) => ({ role: m.role, content: m.content })),
              { role: "user", content: prompt },
              { role: "assistant", content: responseText },
            ],
            processed_at: new Date().toISOString(),
          },
          raw_text: `[${isVoice ? "VOICE CHAT" : "HOMEPAGE CHAT"}] User: ${prompt}\n---\nAI: ${responseText.slice(0, 500)}`,
          language: lang,
          tags: ["homepage", "myai-chat", isVoice ? "voice_interaction" : "text_chat", lang],
          created_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn("[homepage-chat] Ingestion to Data Center warning:", e);
    }
  })();

  if (wantStream) {
    const res = createTextStreamResponse(simulatedText, "gemini");
    if (guestId) setGuestCookieHeader(res, guestId);
    return res;
  }
  const res = NextResponse.json({ text: simulatedText, provider_used: "gemini" }, { headers: { "X-Provider-Used": "gemini" } });
  if (guestId) setGuestCookieHeader(res, guestId);
  return res;
}

