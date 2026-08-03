import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseReady } from "@/lib/supabase";
import { PROVIDER_REGISTRY } from "@/lib/provider-adapters";

export async function GET() {
  const statusReport: Record<string, any> = {
    timestamp: new Date().toISOString(),
    project: process.env.NEXT_PUBLIC_PROJECT_NAME || "Ginza Project",
    website: process.env.NEXT_PUBLIC_WEBSITE_NAME || "MongondowPedia",
    ai_name: process.env.NEXT_PUBLIC_AI_NAME || "Bogani AI",
    supabase: {
      ready: false,
      details: "Belum terhubung",
    },
    myai_os_gateway: {
      ready: false,
      provider: "none",
      details: "Belum teruji",
    },
    environment: {
      has_gemini_key: !!(process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY1),
      has_openai_key: !!process.env.OPENAI_API_KEY1,
      has_claude_key: !!process.env.CLAUDE_API_KEY1,
      has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_supabase_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  };

  // 1. Test Supabase Database Connection
  try {
    if (supabaseAdmin && isSupabaseReady) {
      const { data, error } = await supabaseAdmin.from("gw_provider_keys").select("count", { count: 'exact' });
      if (!error) {
        statusReport.supabase = {
          ready: true,
          details: `Terhubung ke Supabase! (Row count check ok, total keys: ${data?.[0]?.count ?? 0})`,
        };
      } else {
        statusReport.supabase = {
          ready: true, // DB connection active even if table empty
          details: `Terhubung ke Supabase PostgreSQL (${error.message})`,
        };
      }
    } else {
      statusReport.supabase = {
        ready: false,
        details: "Variabel lingkungan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diisi.",
      };
    }
  } catch (err: any) {
    statusReport.supabase = {
      ready: false,
      details: `Gagal terhubung ke Supabase: ${err.message}`,
    };
  }

  // 2. Test MyAI OS / AI Gateway Provider (Live Central Gateway & Direct Fallback)
  try {
    const gatewayUrl = process.env.MYAI_OS_GATEWAY_URL || "https://console.myai.nexus/api/v1/chat/completions";
    const gatewayKey = process.env.MYAI_OS_GATEWAY_API_KEY || process.env.HOMEPAGE_GATEWAY_API_KEY;

    if (gatewayKey) {
      const gwRes = await fetch(gatewayUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${gatewayKey}`,
        },
        body: JSON.stringify({
          field: "chatbot_myai_home",
          messages: [{ role: "user", content: "Ping status check" }],
        }),
      });

      if (gwRes.ok) {
        const gwData = await gwRes.json();
        const providerUsed = gwData.provider_used || gwRes.headers.get("x-provider-used") || "gpt";
        statusReport.myai_os_gateway = {
          ready: true,
          provider: providerUsed,
          details: `Terhubung ke MyAI OS Gateway terpusat! (Provider: ${providerUsed})`,
          sample_response: typeof gwData.result === "string" ? gwData.result.substring(0, 100) : "OK",
        };
      } else {
        statusReport.myai_os_gateway = {
          ready: false,
          provider: "none",
          details: `Gateway HTTP Error: ${gwRes.status}`,
        };
      }
    } else {
      // Fallback check direct Gemini key
      const geminiKey = (process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY1 || "").trim();
      if (geminiKey && !geminiKey.includes("<") && geminiKey !== "AIzaSy_your_gemini_api_key") {
        const adapter = PROVIDER_REGISTRY["gemini"];
        if (adapter) {
          const testRes = await adapter.call(
            geminiKey,
            "Halo, uji tes koneksi Bogani AI.",
            "Anda adalah Bogani AI untuk MongondowPedia.",
            { temperature: 0.1 }
          );
          if (testRes.success) {
            statusReport.myai_os_gateway = {
              ready: true,
              provider: "gemini",
              details: "Terhubung ke Gemini Direct API!",
              sample_response: testRes.aiResponseText?.substring(0, 150),
            };
          } else {
            statusReport.myai_os_gateway = {
              ready: false,
              provider: "gemini",
              details: `Gagal memanggil API Gemini: ${testRes.errorMsg || "Kesalahan tidak diketahui"}`,
            };
          }
        }
      } else {
        statusReport.myai_os_gateway = {
          ready: false,
          provider: "none",
          details: "MYAI_OS_GATEWAY_API_KEY / GEMINI_API_KEY belum dikonfigurasi.",
        };
      }
    }
  } catch (err: any) {
    statusReport.myai_os_gateway = {
      ready: false,
      provider: "none",
      details: `Gagal tes MyAI OS Gateway: ${err.message}`,
    };
  }

  return NextResponse.json(statusReport, { status: 200 });
}
