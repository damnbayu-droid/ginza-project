import { NextRequest, NextResponse } from "next/server";
import { PROVIDER_REGISTRY } from "@/lib/provider-adapters";
import { searchKamusEntries, getFeaturedSiderCards } from "@/lib/kamus-parser";
import { BOGANI_PERSONA_ID } from "@/lib/bogani-persona";
import { getKnowledgeContext } from "@/lib/knowledge-retrieval";
import { listKamusEntries, getVerificatorsForEntry, logMetricEvent } from "@/lib/ginza-db";
import { isSupabaseReady, supabaseAdmin } from "@/lib/supabase";
import { getCurrentUserProfile } from "@/lib/supabase-auth-server";
import {
  checkGuestQuota,
  checkUserQuota,
  incrementGuestQuota,
  getOrCreateGuestId,
  setGuestCookieHeader,
} from "@/lib/ai-usage-quota";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const body = await req.json().catch(() => ({}));
    const word: string = (body.word || "").trim();

    if (!word) {
      return NextResponse.json({ error: "Kata tidak boleh kosong" }, { status: 400 });
    }

    if (isSupabaseReady) {
      logMetricEvent({ type: "kamus_click", targetText: word }).catch(() => {});
    }

    // 0. Kartu kata unggulan (kurasi manual, definisi terverifikasi) — kalau
    //    kata cocok persis, pakai ini langsung tanpa panggil AI sama sekali,
    //    supaya tidak ada risiko tebakan salah untuk kata-kata inti ini.
    const featuredMatch = getFeaturedSiderCards().find(
      (c) => c.word.toLowerCase() === word.toLowerCase()
    );
    if (featuredMatch) {
      return NextResponse.json({ success: true, data: featuredMatch, isIndexed: true, source: "featured_card" });
    }

    // 0b. Kata yang sudah diverifikasi & tersimpan di Database Kamus (hasil
    //     kontribusi user yang di-approve, atau input admin) — pakai data ini
    //     langsung, tanpa perlu panggil AI, dan tampilkan verifikatornya.
    if (isSupabaseReady) {
      try {
        const dbMatches = await listKamusEntries({ search: word, status: "verified", limit: 5 });
        const exact = dbMatches.find(e => e.word.toLowerCase() === word.toLowerCase());
        if (exact) {
          const verificators = await getVerificatorsForEntry(exact.id).catch(() => []);
          return NextResponse.json({
            success: true,
            source: "database_verified",
            isIndexed: true,
            data: {
              word: exact.word,
              phonetic: exact.phonetic ?? "",
              origin: exact.origin ?? "",
              meaning: exact.meaning ?? "",
              example: exact.example ?? "",
              aksara: exact.aksara_breakdown ?? exact.word.toLowerCase(),
              quote: "",
              emoji: "📘",
              tag: exact.category ?? undefined,
            },
            verificators: verificators.map((v: any) => v.profiles?.display_name ?? "Verifikator"),
          });
        }
      } catch {
        // tabel skema baru mungkin belum ada — lanjut ke alur lama (file + AI)
      }
    }

    // 1. Search local indexed kamus entries
    const searchRes = searchKamusEntries({ query: word, limit: 10 });
    const isIndexed = searchRes.total > 0;
    const matchedList = searchRes.items.map(i => i.word).join(", ");

    // 1b. Tarik kutipan relevan dari Knowledge Base (Sejarah/Adat/Bahasa/Aksara
    //     + arsip mentah) supaya definisi digroundkan ke sumber sungguhan,
    //     bukan hanya tebakan model.
    let knowledgeCtx = "";
    try {
      knowledgeCtx = getKnowledgeContext(word, 4000, 5);
    } catch (e) {
      console.warn("[kamus-ai-define] Failed retrieving knowledge context:", e);
    }

    // Kontrol pemakaian AI (lihat lib/ai-usage-quota.ts): kartu unggulan &
    // entri kamus terverifikasi di atas GRATIS (bukan panggilan AI, sudah
    // return lebih dulu), tapi definisi hasil AI/simulasi di bawah ini
    // menarik dari pool kuota yg SAMA dgn chat Bogani AI (homepage/chat) --
    // dicek SEBELUM memanggil provider AI apa pun.
    const quotaProfile = await getCurrentUserProfile().catch(() => null);
    const guestId = quotaProfile ? null : getOrCreateGuestId(req.headers.get("cookie")).guestId;
    const quota = quotaProfile
      ? await checkUserQuota(quotaProfile.id, quotaProfile.role)
      : await checkGuestQuota(guestId!);

    if (!quota.allowed) {
      const blocked = NextResponse.json(
        { error: quota.message, quotaExceeded: true, requiresAuth: !quotaProfile },
        { status: 403 }
      );
      if (guestId) setGuestCookieHeader(blocked, guestId);
      return blocked;
    }

    // 2. Call Gemini / Bogani AI provider to generate detailed Sider-style dictionary definition JSON
    const apiKey = (process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY1 || "").trim();
    const adapter = PROVIDER_REGISTRY["gemini"];

    let aiResultData: any = null;

    if (apiKey && !apiKey.includes("<") && apiKey !== "AIzaSy_your_gemini_api_key" && adapter) {
      const systemPrompt = `${BOGANI_PERSONA_ID}

## Tugas Khusus untuk Panggilan Ini
Anda sedang menjawab lewat endpoint definisi kata terstruktur (bukan chat bebas). Berikan analisis kamus lengkap bergaya Sider AI Dictionary untuk kata yang diberikan pengguna.

Format keluaran HARUS berupa JSON valid persis seperti skema berikut, TANPA markdown wrapper, TANPA teks lain di luar JSON:
{
  "word": "${word}",
  "phonetic": "/fonetik-kata/",
  "origin": "Asal-usul atau etimologi kata — utamakan info dari KONTEKS KNOWLEDGE BASE di bawah kalau tersedia",
  "meaning": "Definisi dan arti dalam Bahasa Indonesia",
  "example": "Contoh kalimat/frasa bahasa Mongondow beserta terjemahannya",
  "aksara": "Pemenggalan suku kata fonetik kata ini (misal: bo-ga-ni) — ini BUKAN aksara resmi, hanya bantu ejaan",
  "quote": "Kutipan filosofis atau kesan makna ringkas dari kata ini",
  "emoji": "emoji_terkait"
}

Kalau kata ini tidak ada di KONTEKS KNOWLEDGE BASE maupun referensi kata terindeks, tetap isi JSON tapi buat field "meaning" jujur menyatakan bahwa arti pastinya belum terverifikasi di sumber MongondowPedia, dan field "origin" berisi dugaan etimologis yang jelas ditandai sebagai dugaan.`;

      const prompt = `Berikan analisis kamus terperinci untuk kata Mongondow/Indonesia: "${word}". Referensi kata terindeks lokal: [${matchedList}].${knowledgeCtx} Jawab hanya dalam JSON murni.`;

      const res = await adapter.call(apiKey, prompt, systemPrompt, { temperature: 0.3 });

      if (res.success && res.aiResponseText) {
        try {
          const cleanedText = res.aiResponseText.replace(/```json/g, "").replace(/```/g, "").trim();
          aiResultData = JSON.parse(cleanedText);
        } catch {
          console.warn("[kamus-ai-define] Failed parsing JSON from AI, falling back to structured layout.");
        }

        if (isSupabaseReady && supabaseAdmin && quotaProfile) {
          supabaseAdmin
            .from("token_usage")
            .insert({
              user_id: quotaProfile.id,
              provider: "gemini",
              endpoint: "kamus_ai_define",
              tokens_used: (res.promptTokens ?? 0) + (res.completionTokens ?? 0),
            })
            .then(() => {})
            .catch((e: unknown) => console.warn("[kamus-ai-define] Failed logging token_usage:", e));
        }
      }
    }

    // 3. Fallback structured definition if AI key is unavailable or parsing failed
    if (!aiResultData) {
      const lower = word.toLowerCase();
      let phonetic = `/${lower.replace(/a/g, "a-").replace(/i/g, "i-").replace(/-$/, "")}/`;
      let origin = "Berasal dari perbendaharaan kata asli Bolaang Mongondow.";
      let meaning = `Kata "${word}" terdaftar dalam indeks Kamus Bahasa MongondowPedia.`;
      let example = `'${word}' digunakan dalam percakapan dan literatur Mongondow.`;
      let quote = `Makna dan filosofi kata ${word} mewarnai tutur bahasa Mongondow.`;
      let emoji = "📘";
      let aksara = word.toLowerCase();

      if (lower.includes("bogani")) {
        phonetic = "/bo-ga-ni/";
        origin = "Dari Bahasa Mongondow kuno: Pemimpin, pahlawan, dan pelindung masyarakat.";
        meaning = "Pahlawan atau sosok pemimpin pemberani yang melindungi rakyat Bolaang Mongondow pada masa lampau.";
        example = "'Tua-tua imbui kon Bogani' — Rasa hormat kepada para pahlawan Bogani.";
        quote = "Bogani adalah simbol keberanian, kearifan, dan dedikasi bagi kebaikan bersama.";
        emoji = "🛡️";
        aksara = "bo-ga-ni";
      } else if (lower.includes("totabuan")) {
        phonetic = "/to-ta-bu-an/";
        origin = "Dari kata dasar 'tabu' (tempat berkumpul / tanah kelahiran).";
        meaning = "Tanah kelahiran atau wilayah tempat tinggal masyarakat Bolaang Mongondow.";
        example = "'Tanah Totabuan' — Negeri tempat lahir dan berbakti.";
        quote = "Totabuan adalah hangatnya tanah kelahiran dan identitas kebudayaan.";
        emoji = "⛰️";
        aksara = "to-ta-bu-a-n";
      }

      aiResultData = {
        word,
        phonetic,
        origin,
        meaning,
        example,
        aksara,
        quote,
        emoji,
      };

      // Jalur fallback (tanpa API key AI, atau parsing gagal) tetap memberi
      // definisi ke pengguna, jadi tetap dihitung ke kuota -- kalau tidak,
      // celah ini bisa "dimanfaatkan" utk melewati batas dgn memicu fallback.
      if (isSupabaseReady && supabaseAdmin && quotaProfile) {
        supabaseAdmin
          .from("token_usage")
          .insert({ user_id: quotaProfile.id, provider: "fallback", endpoint: "kamus_ai_define", tokens_used: 0 })
          .then(() => {})
          .catch((e: unknown) => console.warn("[kamus-ai-define] Failed logging fallback token_usage:", e));
      }
    }

    if (guestId) await incrementGuestQuota(guestId, ip);

    const response = NextResponse.json({
      success: true,
      data: aiResultData,
      isIndexed,
    });
    if (guestId) setGuestCookieHeader(response, guestId);
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memproses definisi kata" }, { status: 500 });
  }
}
