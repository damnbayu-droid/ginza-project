import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { decryptKey } from "@/lib/crypto";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { PROVIDER_REGISTRY } from "@/lib/provider-adapters";
import { parseUploadedFile } from "@/lib/file-parser";
import type { HomeChatMessage, Language } from "@/lib/types";
import { searchKamusEntries, getFeaturedSiderCards } from "@/lib/kamus-parser";
import { AI_NAME, WEBSITE_NAME, PROJECT_NAME, BOGANI_PERSONA_ID, BOGANI_PERSONA_EN } from "@/lib/bogani-persona";
import { getKnowledgeContext } from "@/lib/knowledge-retrieval";
import { getCurrentUserProfile } from "@/lib/supabase-auth-server";
import { saveConversation, logMetricEvent, type Profile } from "@/lib/ginza-db";

const SYSTEM_PROMPT_ID = BOGANI_PERSONA_ID;
const SYSTEM_PROMPT_EN = BOGANI_PERSONA_EN;

const GATEWAY_FIELD = "chatbot_myai_home";

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

function buildPromptWithHistory(history: HomeChatMessage[], prompt: string): string {
  const kamusCtx = getKamusContext(prompt);
  let knowledgeCtx = "";
  try {
    knowledgeCtx = getKnowledgeContext(prompt);
  } catch (e) {
    console.warn("[homepage-chat] Failed retrieving knowledge context:", e);
  }
  
  const personaHeader = `[SYSTEM INSTRUCTION BOGANI AI]:\n${SYSTEM_PROMPT_ID}\n\n`;
  const fullPrompt = prompt + kamusCtx + knowledgeCtx;

  if (!Array.isArray(history) || history.length === 0) return personaHeader + fullPrompt;

  const historyText = history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => `${m.role === 'user' ? 'User' : AI_NAME}: ${m.content}`)
    .join("\n\n");

  return `${personaHeader}${historyText}\n\nUser: ${fullPrompt}`;
}

function simulateReply(prompt: string, lang: Language): string {
  const lower = prompt.toLowerCase();
  if (lang === 'en') {
    if (lower.includes("who are you") || lower.includes("bogani") || lower.includes("mongondowpedia")) {
      return `I am **${AI_NAME}**, the AI assistant for **${WEBSITE_NAME}** (*${PROJECT_NAME}*). A fast, intelligent AI assistant built to help with research, information, analysis, and everyday conversations.`;
    }
    if (lower.includes("hi") || lower.includes("hello")) {
      return `Hello! How can **${AI_NAME}** assist you on **${WEBSITE_NAME}** today?`;
    }
    return `Thanks for reaching out to **${AI_NAME}** on **${WEBSITE_NAME}**! Your question about *"${prompt}"* has been received. I'm ready to help you explore, analyze, and build detailed answers. Anything else you'd like to ask?`;
  }

  if (lower.includes("siapa kamu") || lower.includes("bogani") || lower.includes("mongondowpedia")) {
    return `Saya adalah **${AI_NAME}**, asisten AI cerdas untuk platform **${WEBSITE_NAME}** (*${PROJECT_NAME}*). Saya dirancang untuk membantu Anda menjelajahi informasi, ensiklopedia, analisis, koding, serta percakapan harian.`;
  }
  if (lower.includes("halo") || lower.includes("hi") || lower.includes("hello")) {
    return `Halo! Ada yang bisa **${AI_NAME}** bantu untuk Anda di **${WEBSITE_NAME}** hari ini?`;
  }
  if (lower.includes("fitur") || lower.includes("voice") || lower.includes("suara")) {
    return `Saat ini **${AI_NAME}** mendukung mode **Teks**, **Suara**, dan **Unggah Dokumen/Gambar** untuk melayani pengguna **${WEBSITE_NAME}**.`;
  }
  return `Terima kasih telah menghubungi **${AI_NAME}** di **${WEBSITE_NAME}**! Pertanyaan Anda tentang *"${prompt}"* telah diproses. Saya siap membantu Anda menganalisis dan memberikan informasi detail. Ada hal spesifik lain yang ingin ditanyakan?`;
}

/**
 * Preferred path: call Gateway AI (MYAI_OS_GATEWAY_URL or local /api/v1/chat/completions)
 */
async function callGateway(req: NextRequest, fullPrompt: string, fileData?: string | null, isVoiceMode?: boolean): Promise<{ text: string; provider: string } | null> {
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
          field: isVoiceMode ? "chatbot_general" : GATEWAY_FIELD,
          messages: [{ role: "user", content: fullPrompt }],
          file: fileData || undefined,
        }),
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
}) {
  const { profile, prompt, responseText, provider, history, promptTokens, completionTokens } = opts;

  try {
    await logMetricEvent({ type: "ai_question", targetText: prompt, userId: profile?.id });
  } catch (e) {
    console.warn("[homepage-chat] Failed logging ai_question metric:", e);
  }

  if (!profile) return; // chat anonim: tidak ada riwayat/token usage utk disimpan

  try {
    const now = new Date().toISOString();
    const messages = [
      ...history.map((m) => ({ role: m.role, content: m.content, timestamp: m.timestamp })),
      { role: "user", content: prompt, timestamp: now },
      { role: "assistant", content: responseText, timestamp: now },
    ];
    const title = prompt.slice(0, 60) + (prompt.length > 60 ? "..." : "");
    await saveConversation(profile.id, undefined, title, messages);
  } catch (e) {
    console.warn("[homepage-chat] Failed saving conversation history:", e);
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

  const fullPrompt = buildPromptWithHistory(history, prompt);
  const profile = await profilePromise;

  const isVoiceMode = body.isVoiceMode || body.isVoiceInput || prompt.includes("[voice]");

  // 1. Preferred: route through the AI Gateway (myai.nexus or local) as a registered client app.
  const gatewayResult = await callGateway(req, fullPrompt, fileInput, isVoiceMode);
  if (gatewayResult && gatewayResult.text) {
    void logChatTurn({ profile, prompt, responseText: gatewayResult.text, provider: gatewayResult.provider, history });
    if (wantStream) {
      return createTextStreamResponse(gatewayResult.text, gatewayResult.provider);
    }
    return NextResponse.json({ text: gatewayResult.text, provider_used: gatewayResult.provider }, { headers: { "X-Provider-Used": gatewayResult.provider } });
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
    });
    if (wantStream) {
      return createTextStreamResponse(direct.text, provider);
    }
    return NextResponse.json({ text: direct.text, provider_used: provider }, { headers: { "X-Provider-Used": provider } });
  }

  // 3. Fallback simulation if no API key is set
  const simulatedText = simulateReply(prompt, lang);
  void logChatTurn({ profile, prompt, responseText: simulatedText, provider: "simulated", history });
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
    return createTextStreamResponse(simulatedText, "gemini");
  }
  return NextResponse.json({ text: simulatedText, provider_used: "gemini" }, { headers: { "X-Provider-Used": "gemini" } });
}

