import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Read .env.local manually for test script
const envPath = path.join(process.cwd(), ".env.local");
let envVars: Record<string, string> = {};

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...vals] = trimmed.split("=");
      if (key) {
        envVars[key.trim()] = vals.join("=").trim().replace(/^["']|["']$/g, '');
      }
    }
  });
}

console.log("=================================================");
console.log("🔍 MONGONDOWPEDIA / BOGANI AI — CONNECTION TEST");
console.log("=================================================");
console.log(`Project Name: ${envVars["NEXT_PUBLIC_PROJECT_NAME"] || "Ginza Project"}`);
console.log(`Website Name: ${envVars["NEXT_PUBLIC_WEBSITE_NAME"] || "MongondowPedia"}`);
console.log(`AI Assistant: ${envVars["NEXT_PUBLIC_AI_NAME"] || "Bogani AI"}\n`);

// 1. Supabase Test
const supabaseUrl = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseServiceKey = envVars["SUPABASE_SERVICE_ROLE_KEY"];

console.log("1️⃣ Testing Supabase Connection...");
if (supabaseUrl && supabaseServiceKey && !supabaseUrl.includes("<project-ref>") && !supabaseUrl.includes("your-project")) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });
    supabase.from("gw_provider_keys").select("id").limit(1).then(({ error }) => {
      if (error) {
        console.log(`   ❌ Supabase Connection Failed: ${error.message}`);
      } else {
        console.log(`   ✅ Supabase Connected Successfully! (${supabaseUrl})`);
      }
    });
  } catch (err: any) {
    console.log(`   ❌ Supabase Error: ${err.message}`);
  }
} else {
  console.log("   ⚠️  Supabase URL/Key still placeholder in .env.local (Needs real Supabase credentials).");
}

// 2. Gemini AI / MyAI OS Gateway Test
const geminiKey = envVars["GEMINI_API_KEY"];
console.log("\n2️⃣ Testing MyAI OS / Gemini AI Connection...");
if (geminiKey && !geminiKey.includes("your_gemini_api_key") && !geminiKey.includes("<your-")) {
  fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`)
    .then(res => res.json())
    .then(data => {
      if (data.models && data.models.length > 0) {
        console.log(`   ✅ Gemini AI / MyAI OS Gateway API Connected! Available models: ${data.models.length}`);
      } else if (data.error) {
        console.log(`   ❌ Gemini API Key Error: ${data.error.message}`);
      } else {
        console.log("   ⚠️  Gemini API response received.");
      }
    })
    .catch(err => {
      console.log(`   ❌ Gemini API Network Error: ${err.message}`);
    });
} else {
  console.log("   ⚠️  GEMINI_API_KEY contains placeholder in .env.local (Add your Google AI Studio API Key to test live AI responses).");
}

console.log("\n=================================================");
