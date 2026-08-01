import { NextRequest, NextResponse } from "next/server";
import { PROVIDER_REGISTRY } from "@/lib/provider-adapters";
import { searchKamusEntries } from "@/lib/kamus-parser";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const word: string = (body.word || "").trim();

    if (!word) {
      return NextResponse.json({ error: "Kata tidak boleh kosong" }, { status: 400 });
    }

    // 1. Search local indexed kamus entries
    const searchRes = searchKamusEntries({ query: word, limit: 10 });
    const isIndexed = searchRes.total > 0;
    const matchedList = searchRes.items.map(i => i.word).join(", ");

    // 2. Call Gemini / Bogani AI provider to generate detailed Sider-style dictionary definition JSON
    const apiKey = (process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY1 || "").trim();
    const adapter = PROVIDER_REGISTRY["gemini"];

    let aiResultData: any = null;

    if (apiKey && !apiKey.includes("<") && apiKey !== "AIzaSy_your_gemini_api_key" && adapter) {
      const systemPrompt = `Anda adalah Bogani AI — Pakar Bahasa, Fonetik, Aksara, dan Etimologi Bahasa Bolaang Mongondow.
Tugas Anda: Berikan analisis kamus lengkap bergaya Sider AI Dictionary untuk kata yang diberikan pengguna.

Format keluaran HARUS dalam JSON valid persis seperti skema berikut (tanpa markdown wrapper tambahan):
{
  "word": "${word}",
  "phonetic": "/fonetik-kata/",
  "origin": "Asal-usul atau etimologi kata",
  "meaning": "Definisi dan arti dalam Bahasa Indonesia",
  "example": "Contoh kalimat frasa bahasa Mongondow beserta terjemahannya",
  "aksara": "Ejaan/transliterasi aksara Mongondow (misal: bo-ga-ni)",
  "quote": "Kutipan filosofis atau kesan makna ringkas dari kata ini",
  "emoji": "emoji_terkait"
}`;

      const prompt = `Berikan analisis kamus terperinci untuk kata Mongondow/Indonesia: "${word}". Referensi kata terindeks lokal: [${matchedList}]. Jawab hanya dalam JSON murni.`;

      const res = await adapter.call(apiKey, prompt, systemPrompt, { temperature: 0.3 });

      if (res.success && res.aiResponseText) {
        try {
          const cleanedText = res.aiResponseText.replace(/```json/g, "").replace(/```/g, "").trim();
          aiResultData = JSON.parse(cleanedText);
        } catch {
          console.warn("[kamus-ai-define] Failed parsing JSON from AI, falling back to structured layout.");
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
    }

    return NextResponse.json({
      success: true,
      data: aiResultData,
      isIndexed,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memproses definisi kata" }, { status: 500 });
  }
}
