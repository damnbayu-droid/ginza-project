-- ════════════════════════════════════════════════════════════════════════
-- Migration: chatbot_myai_home field for the MyAI OS public homepage
-- (myai.nexus consumer chat, registered as its own Gateway client app —
--  separate field key so its routing/persona never touches chatbot_general,
--  which Indonesian Visas already relies on.)
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. Register the field ─────────────────────────────────────────────────
INSERT INTO public.gw_ai_fields (field_key, display_name, description, auto_mode) VALUES
  ('chatbot_myai_home', 'MyAI OS Homepage Chatbot', 'Chat konsumen publik di myai.nexus (ChatGPT-style homepage)', true)
ON CONFLICT (field_key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  auto_mode = EXCLUDED.auto_mode;

-- ── 2. Pool assignment: all 5 providers in the failover chain, strongest
--       reasoning models first (per Boss Bayu: not Gemini-only — needs every
--       provider available so replies stay strong at reasoning) ───────────
DELETE FROM public.gw_field_pool_assignments WHERE field_key = 'chatbot_myai_home';

INSERT INTO public.gw_field_pool_assignments (field_key, provider, pool_tier) VALUES
  ('chatbot_myai_home', 'claude',   1),
  ('chatbot_myai_home', 'gpt',      2),
  ('chatbot_myai_home', 'gemini',   3),
  ('chatbot_myai_home', 'grok',     4),
  ('chatbot_myai_home', 'deepseek', 5);

-- ── 3. Field spec: MyAI OS persona system prompt (no output schema — free text chat) ──
DELETE FROM public.gw_field_specs WHERE field_key = 'chatbot_myai_home';
INSERT INTO public.gw_field_specs (field_key, system_prompt, output_schema)
VALUES (
  'chatbot_myai_home',
  'Anda adalah MyAI Operating System (MyAI OS) dari domain myai.nexus. Asisten AI generasi terbaru yang sangat responsif, cerdas, bersahabat, profesional, dan serbaguna. Berikan jawaban yang rapi dengan format Markdown (gunakan bold, list, dan code block yang bersih). Selalu gunakan Bahasa Indonesia kecuali pengguna bertanya dalam bahasa lain.',
  NULL
);
