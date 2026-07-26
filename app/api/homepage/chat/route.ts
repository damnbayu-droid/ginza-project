import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { decryptKey } from "@/lib/crypto";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { PROVIDER_REGISTRY } from "@/lib/provider-adapters";
import { parseUploadedFile } from "@/lib/file-parser";
import type { HomeChatMessage, Language } from "@/lib/types";

const SYSTEM_PROMPT_ID = `Anda adalah MyAI Operating System (MyAI OS) dari domain myai.nexus.
Asisten AI generasi terbaru yang sangat responsif, cerdas, bersahabat, profesional, dan serbaguna.
Berikan jawaban yang rapi dengan format Markdown (gunakan bold, list, dan code block yang bersih).
Selalu gunakan Bahasa Indonesia kecuali pengguna bertanya dalam bahasa lain.`;

const SYSTEM_PROMPT_EN = `You are MyAI Operating System (MyAI OS) from the myai.nexus domain.
A next-generation AI assistant that is highly responsive, intelligent, friendly, professional, and versatile.
Reply with clean Markdown formatting (bold, lists, and clean code blocks).
Default to English since the user is asking in English.`;

const GATEWAY_FIELD = "chatbot_myai_home";

function buildPromptWithHistory(history: HomeChatMessage[], prompt: string): string {
  if (!Array.isArray(history) || history.length === 0) return prompt;

  const historyText = history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => `${m.role === 'user' ? 'User' : 'MyAI OS'}: ${m.content}`)
    .join("\n\n");

  return `${historyText}\n\nUser: ${prompt}`;
}

function simulateReply(prompt: string, lang: Language): string {
  const lower = prompt.toLowerCase();
  if (lang === 'en') {
    if (lower.includes("who are you") || lower.includes("myai")) {
      return "I'm **MyAI Operating System (MyAI OS)** from `myai.nexus`. A fast, intelligent AI assistant built to help with productivity, analysis, coding, and everyday conversation.";
    }
    if (lower.includes("hi") || lower.includes("hello")) {
      return "Hello! How can **MyAI OS** help you today?";
    }
    return `Thanks for reaching out to **MyAI OS**! Your question about *"${prompt}"* has been received. I'm ready to help you analyze, design ideas, or build technical solutions in detail. Anything else you'd like to add?`;
  }

  if (lower.includes("siapa kamu") || lower.includes("myai")) {
    return "Saya adalah **MyAI Operating System (MyAI OS)** dari `myai.nexus`. Asisten AI cerdas berkecepatan tinggi yang dirancang untuk membantu Anda menyelesaikan berbagai tugas produktivitas, analisis, koding, dan percakapan harian secara efisien.";
  }
  if (lower.includes("halo") || lower.includes("hi") || lower.includes("hello")) {
    return "Halo! Ada yang bisa **MyAI OS** bantu untuk Anda hari ini?";
  }
  if (lower.includes("fitur") || lower.includes("voice") || lower.includes("suara")) {
    return "Saat ini **MyAI OS** mendukung mode **Teks**, **Suara**, dan **Unggah Dokumen/Gambar**. Fitur video sedang disiapkan untuk pembaruan berikutnya di `myai.nexus`.";
  }
  return `Terima kasih telah menghubungi **MyAI OS**! Pertanyaan Anda tentang *"${prompt}"* telah diproses. Saya siap membantu Anda menganalisis, merancang ide, atau membuat solusi teknis secara detail. Ada hal spesifik lain yang ingin ditambahkan?`;
}

/**
 * Preferred path: call Gateway AI (/api/v1/chat/completions)
 */
async function callGateway(req: NextRequest, fullPrompt: string, fileData?: string | null): Promise<string | null> {
  const gatewayKey = process.env.HOMEPAGE_GATEWAY_API_KEY;
  if (!gatewayKey) return null;

  try {
    const res = await fetch(`${req.nextUrl.origin}/api/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${gatewayKey}`,
      },
      body: JSON.stringify({
        field: GATEWAY_FIELD,
        messages: [{ role: "user", content: fullPrompt }],
        file: fileData || undefined,
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.warn(`[homepage-chat] Gateway call failed (${res.status}): ${errBody.error}. Falling back to direct provider pool.`);
      return null;
    }

    const data = await res.json();
    return typeof data.result === "string"
      ? data.result
      : typeof data.result === "object"
      ? JSON.stringify(data.result, null, 2)
      : null;
  } catch (err) {
    console.warn("[homepage-chat] Gateway unreachable, falling back to direct provider call:", err);
    return null;
  }
}

/**
 * Fallback path: call active Provider keys stored in database or environment.
 */
async function callProviderDirect(
  fullPrompt: string,
  systemPrompt: string,
  parsedFileData?: { mimeType: string; base64Data: string } | null
): Promise<{ text?: string; provider?: string; error?: string; status?: number }> {
  if (supabaseAdmin) {
    const { data: providerKeys } = await supabaseAdmin
      .from("gw_provider_keys")
      .select("id, provider, label, key_encrypted, usage_count, last_used_at, priority")
      .eq("status", "active")
      .order("priority", { ascending: false })
      .order("last_used_at", { ascending: true, nullsFirst: true })
      .order("usage_count", { ascending: true });

    if (providerKeys && providerKeys.length > 0) {
      for (const selected of providerKeys) {
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
            return { text: result.aiResponseText, provider: selected.provider };
          }
        } catch (err) {
          console.warn(`[homepage-chat] Provider call failed for ${selected.provider}:`, err);
        }
      }
    }
  }

  const envFallbacks: { provider: string; envVar: string }[] = [
    { provider: "gemini", envVar: process.env.GEMINI_API_KEY1 || process.env.GEMINI_API_KEY || "" },
    { provider: "gpt", envVar: process.env.OPENAI_API_KEY1 || "" },
    { provider: "claude", envVar: process.env.CLAUDE_API_KEY1 || "" },
    { provider: "grok", envVar: process.env.GROK_API_KEY1 || "" },
    { provider: "deepseek", envVar: process.env.DEEPSEEK_API_KEY1 || "" },
    { provider: "glm", envVar: process.env.GLM_API_KEY1 || "" },
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
      return { text: result.aiResponseText, provider: item.provider };
    }
  }

  return {};
}

/** Helper function to create real-time streaming response */
function createTextStreamResponse(fullText: string, provider: string = "gemini"): Response {
  const encoder = new TextEncoder();
  const words = fullText.match(/\S+|\s+/g) || [fullText];

  const stream = new ReadableStream({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(word));
        await new Promise((resolve) => setTimeout(resolve, 12));
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

  // 1. Preferred: route through the AI Gateway as a registered client app.
  const gatewayText = await callGateway(req, fullPrompt, fileInput);
  if (gatewayText) {
    if (wantStream) {
      return createTextStreamResponse(gatewayText, "gemini");
    }
    return NextResponse.json({ text: gatewayText, provider_used: "gemini" }, { headers: { "X-Provider-Used": "gemini" } });
  }

  // 2. Fallback: call registered Tier 1 & Tier 2 Provider Pool directly.
  const systemPrompt = lang === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_ID;
  const direct = await callProviderDirect(fullPrompt, systemPrompt, parsedFileData);

  if (direct.error) {
    return NextResponse.json({ error: `MyAI OS AI Error: ${direct.error}` }, { status: direct.status || 500 });
  }
  if (direct.text) {
    const provider = direct.provider || "gemini";
    if (wantStream) {
      return createTextStreamResponse(direct.text, provider);
    }
    return NextResponse.json({ text: direct.text, provider_used: provider }, { headers: { "X-Provider-Used": provider } });
  }

  // 3. Fallback simulation if no API key is set
  const simulatedText = simulateReply(prompt, lang);
  // Non-blocking sync to MyAI OS Master Data Center
  (async () => {
    try {
      if (supabaseAdmin) {
        const isVoice = body.isVoiceMode || prompt.includes("[voice]");
        const recordId = crypto.randomUUID();
        const responseText = gatewayText || direct.text || simulatedText || "";

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

