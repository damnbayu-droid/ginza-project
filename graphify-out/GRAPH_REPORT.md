# Graph Report - ginza-project  (2026-08-08)

## Corpus Check
- 246 files · ~537,242 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1203 nodes · 2080 edges · 147 communities (72 shown, 75 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `85c3687c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ginza-db.ts
- aksara-export.ts
- chat/route.ts
- VerificatorDashboard.tsx
- decryptKey
- devDependencies
- 20260803_ginza_platform_schema.sql
- supabase.ts
- compilerOptions
- ui.tsx
- Isi Lengkap (per adegan)
- index.ts
- forgot-password/route.ts
- requireProfile
- [article]/page.tsx
- auth.ts
- supabase-auth-server.ts
- MyAIChat.tsx
- MASTER ECOSYSTEM REPORT: MYAI OS CONSOLE
- import-knowledge-to-db.ts
- Dashboard.tsx
- LoginScreen.tsx
- login/route.ts
- 2. PRODUCTION HARDENING PROGRESS & CHECKLIST
- data-center/route.ts
- 📜 RENCONTA (PLANNING): BMR CIVIC LEADERSHIP & ADAT HONORIFIC ENGINE
- getSession
- 20260717_new_gateway_project.sql
- 1.1 The Origin
- Aksara Bolaang Mongondow
- BUMERANG — Sejarah perjuangan kampung DOUP (PANANG)
- Sejarah Bolaang Mongondow
- apply/route.ts
- Bahasa dan Sastra Mongondow (Linguistik)
- Sejarah Bolaang Mongondow Timur (Boltim) — Persebaran Penduduk & Asal-usul Kotabunan
- 20260716_gateway_console.sql
- Adat dan Budaya Mongondow
- Graphify Pengetahuan: Naskah Teater "Panang Lipu' Ku" & Aksi HAM Masyarakat Adat Panang
- game/page.tsx
- ContactModal.tsx
- app/layout.tsx
- dependencies
- AiMasterPanel.tsx
- AksaraPanel.tsx
- DatabaseKamusPanel.tsx
- Sejarah Kotabunan
- 🛠️ Quick Start
- migrate_data_across_projects.ts
- seed_json_job_routing.ts
- routing/route.ts
- specs/route.ts
- Graphify Pengetahuan: Etimologi, Morfologi, & Rumpun Istilah Bahasa Mongondow
- Graphify Pengetahuan: Pemetaan Konsep Adat, Falsafah, & Ritual Mongondow
- Graphify Pengetahuan: Silsilah Raja-Raja & Dinasti Bolaang Mongondow
- Katalog & Rekomendasi Prioritas — Folder "drive-download-20260727..."
- 20260807_google_oauth_and_users_sync.sql
- 20260713220141_init.sql
- 20260804_aksara_glyphs.sql
- vercel.json
- artikel/page.tsx
- DatabaseKnowledgePanel.tsx
- seed_supabase_routing.ts
- public.gw_data_center
- generate_auth_cookie.ts
- test_routing.ts
- 20260802_aksara_mongondow.sql
- public.article_comments
- [slug]/page.tsx
- dokumentasi/page.tsx
- ecosystem/page.tsx
- info/layout.tsx
- panduan/page.tsx
- privacy/page.tsx
- proposal/layout.tsx
- terms/page.tsx
- Folder Data Kamus (MongondowPedia / Bogani AI)
- Folder Knowledge Base (MongondowPedia / Bogani AI)
- Indeks Bahasa Mongondow
- Bahasa Mongondow Kuno: Induk Bahasa Kelompok Austronesia di Semenanjung Utara Pulau Sulawesi
- PIDATO BAHASA MONGONDOW "PERAN PKK KON PEMBANGUNAN"
- public.gw_field_specs
- test_connections.ts
- supabase_job_routing.sql
- public.gw_chat_personas
- 20260809_verificator_actions.sql
- docx
- @google/genai
- jose
- jspdf
- kamus/README.md
- 01_wh_questions_mongondow.md
- 02_distribusi_konsonan_pendahuluan.md
- 03_adat_istiadat_bolaang_mongondow.md
- 04_kisah_raja_raja_bolaang_mongondow.md
- 05_mengenal_bolaang_mongondow.md
- 06_ungkapan_dan_peribahasa_mongondow.md
- 07_knowladge_mongondow.md
- 08_bahan_ajar_mulok_kelas_3.md
- 09_morfologi_dan_sintaksis_bahasa_bolmong.md
- 10_sastra_lisan_bolaang_mongondow.md
- 11_analisis_pemekaran_daerah_bappenas.md
- 12_migrasi_kisah_raja_raja_bolango.md
- 13_tumbuhnya_nasionalisme_gorontalo.md
- 14_minahasa_wanua_dan_kawanua.md
- Pidato_Peran_Masyarakat_Kon_Pombanganan_Lipu.md
- knowledge/README.md
- lightningcss
- lightningcss-darwin-arm64
- lucide-react
- mammoth
- motion
- next
- next.config.ts
- pdf-parse
- pg
- postgres
- puppeteer-core
- react
- react-dom
- recharts
- remark-gfm
- resend
- sharp
- @supabase/ssr
- @supabase/supabase-js
- @types/pg
- postcss.config.mjs
- generate-password-hash.ts
- 20260718_audit_logs.sql
- 20260806_ai_usage_quota.sql
- 20260807_contact_messages.sql
- tailwind.config.ts
- kamus_entries
- knowledge_articles
- public.aksara_glyphs
- public.gw_provider_keys
- public.verificator_applications
- public.gw_usage_logs
- public.gw_usage_logs
- public.gw_usage_logs

## God Nodes (most connected - your core abstractions)
1. `supabaseAdmin` - 61 edges
2. `assertDb()` - 41 edges
3. `requireAdmin()` - 34 edges
4. `requireProfile()` - 32 edges
5. `writeAuditLog()` - 31 edges
6. `getSession()` - 23 edges
7. `decryptKey()` - 22 edges
8. `getCurrentUserProfile()` - 18 edges
9. `compilerOptions` - 16 edges
10. `isSupabaseReady` - 15 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `getSession()`  [EXTRACTED]
  app/api/data-center/route.ts → lib/auth.ts
- `GET()` --calls--> `requireProfile()`  [EXTRACTED]
  app/api/public/profile/route.ts → lib/supabase-auth-server.ts
- `GET()` --calls--> `requireProfile()`  [EXTRACTED]
  app/api/public/verificator/apply/route.ts → lib/supabase-auth-server.ts
- `UserDashboardPage()` --calls--> `getCurrentUserProfile()`  [EXTRACTED]
  app/u/page.tsx → lib/supabase-auth-server.ts
- `VerificatorDashboardPage()` --calls--> `getCurrentUserProfile()`  [EXTRACTED]
  app/verifikator/page.tsx → lib/supabase-auth-server.ts

## Import Cycles
- None detected.

## Communities (147 total, 75 thin omitted)

### Community 0 - "ginza-db.ts"
Cohesion: 0.05
Nodes (79): AksaraMongondowPage(), GET(), PATCH(), POST(), GET(), PATCH(), GET(), PATCH() (+71 more)

### Community 1 - "aksara-export.ts"
Cohesion: 0.06
Nodes (62): KamusEntry, KamusPage(), KamusStats, SiderWordCard, AksaraMongondow(), AksaraMongondowProps, CONFIDENCE_LABEL, CONFIDENCE_STYLE (+54 more)

### Community 2 - "chat/route.ts"
Cohesion: 0.09
Nodes (47): buildPromptWithHistory(), callGateway(), callProviderDirect(), createTextStreamResponse(), getKamusContext(), logChatTurn(), POST(), simulateReply() (+39 more)

### Community 3 - "VerificatorDashboard.tsx"
Cohesion: 0.05
Nodes (17): dynamic, UserDashboardPage(), dynamic, VerificatorDashboardPage(), ChatSidebar(), LoginScreen(), TrendingUser, TrendingUsersWidget() (+9 more)

### Community 4 - "decryptKey"
Cohesion: 0.09
Nodes (29): dbJsonPath, POST(), GET(), POST(), GET(), POST(), attemptCall(), POST() (+21 more)

### Community 5 - "devDependencies"
Cohesion: 0.05
Nodes (37): autoprefixer, eslint, eslint-config-next, devDependencies, autoprefixer, eslint, eslint-config-next, postcss (+29 more)

### Community 6 - "20260803_ginza_platform_schema.sql"
Cohesion: 0.11
Nodes (28): public.check_contribution_quorum, public.handle_new_user, public.prevent_audit_log_mutation, public.audit_logs, public.check_contribution_quorum(), public.contribution_votes, public.contributions, public.conversations (+20 more)

### Community 7 - "supabase.ts"
Cohesion: 0.10
Nodes (4): extractStoragePath(), GET(), STATIC_ROUTES, supabaseAdmin

### Community 8 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 9 - "ui.tsx"
Cohesion: 0.21
Nodes (16): AdminArticle, ContributionRow, LogRow, OverviewData, ProfileRow, AI_CHECK_LABEL, AppRow, VerificatorManagementPanel() (+8 more)

### Community 10 - "Isi Lengkap (per adegan)"
Cohesion: 0.08
Nodes (23): Act 1 — KEDATANGAN, Act 1 — Seq 1: Tiba di suatu tempat dan menetap, Act 2 — Seq 4: Mengenal Emas, Act 2 — SUMBER DAYA DAN PERADABAN, Act 3 — MODERNISASI PENJAJAHAN, Act 3 — Seq 10: Gairah Emas dan Penambang Asing, Arsip Verbatim — Naskah Teater "Panang Lipu' Ku", Aset dan Properti (dicantumkan naskah) (+15 more)

### Community 11 - "index.ts"
Cohesion: 0.18
Nodes (9): claudeAdapter, deepseekAdapter, geminiAdapter, glmAdapter, gptAdapter, grokAdapter, AttemptCallResult, FileData (+1 more)

### Community 12 - "forgot-password/route.ts"
Cohesion: 0.19
Nodes (14): ADMIN_EMAIL, ALLOWED_RESET_EMAILS, GENERIC_RESPONSE, POST(), POST(), POST(), POST(), EmailTemplateOptions (+6 more)

### Community 13 - "requireProfile"
Cohesion: 0.16
Nodes (13): GET(), POST(), GET(), GET(), GET(), POST(), GET(), GET() (+5 more)

### Community 14 - "[article]/page.tsx"
Cohesion: 0.13
Nodes (13): KnowledgeArticlePage(), Props, STATIC_ARTICLES, stripLeadingH1Title(), metadata, ContributeCTA(), ADAT_NODES, ETIMOLOGI_NODES (+5 more)

### Community 15 - "auth.ts"
Cohesion: 0.19
Nodes (13): GET(), PATCH(), POST(), DashboardPage(), LoginPage(), Dashboard(), BYPASS_SESSION, destroySession() (+5 more)

### Community 16 - "supabase-auth-server.ts"
Cohesion: 0.21
Nodes (10): generateArticleSlug(), MEMORY_ARTICLES, POST(), POST(), GET(), GET(), GET(), createSupabaseServerClient() (+2 more)

### Community 17 - "MyAIChat.tsx"
Cohesion: 0.25
Nodes (11): ChatSidebarProps, HomeApp(), AttachedFile, MyAIChatProps, SettingsModal(), SettingsModalProps, TabType, HomeChatMessage (+3 more)

### Community 18 - "MASTER ECOSYSTEM REPORT: MYAI OS CONSOLE"
Cohesion: 0.11
Nodes (17): 1. Overview Tab (`OverviewTab.tsx`), 1. PHILOSOPHICAL FOUNDATION: THE CALLING OF MYBUSINESS, 2. Applications Tab (`AppsTab.tsx`), 2. SYSTEM ARCHITECTURE, 3. CORE FEATURES & UPSTREAM AI INTEGRATION, 3. Knowledge Tab (`KnowledgeTab.tsx`), 4. ADVANCED GATEWAY UPGRADES & SECURITY MECHANISMS, 4. Settings Tab (`SettingsTab.tsx`) (+9 more)

### Community 19 - "import-knowledge-to-db.ts"
Cohesion: 0.16
Nodes (9): Syllable, ARSIP_MAP, CURATED_FILES, EXTRA_CATEGORIES, main(), parseMarkdown(), slugify(), loadEnvLocal() (+1 more)

### Community 20 - "Dashboard.tsx"
Cohesion: 0.14
Nodes (12): DashboardProps, ArtikelManagementPanel(), KontribusiPanel(), LogsPanel(), MessagesPanel(), MetricEntry, MetricsData, MetricsPanel() (+4 more)

### Community 21 - "LoginScreen.tsx"
Cohesion: 0.17
Nodes (9): AdminPanelKey, AuthMode, LoginModal(), LoginModalProps, NAV_ITEMS, Sidebar(), SidebarProps, translations (+1 more)

### Community 22 - "login/route.ts"
Cohesion: 0.23
Nodes (9): POST(), ADMIN_EMAIL, POST(), POST(), POST(), uuid(), logAudit(), IMPORTANT: Never pass raw secret/key values in `detail`. (+1 more)

### Community 23 - "2. PRODUCTION HARDENING PROGRESS & CHECKLIST"
Cohesion: 0.13
Nodes (14): 1. INTRODUCTION & CURRENT STATUS, 2. PRODUCTION HARDENING PROGRESS & CHECKLIST, 3. FUTURE EXPANSION ROADMAP: DATA CENTER & MOBILE INTEGRATION, 4. HOW TO RUN, COMPILE, AND DEPLOY, A. Authentication & Credentials Security (COMPLETED & HARDENED), B. Relational Storage & Supabase Migration (COMPLETED & HARDENED), C. Provider Key Management & Active Failover (COMPLETED & HARDENED), CONTINUOUS UPDATES & PRODUCTION HARDENING ROADMAP (+6 more)

### Community 24 - "data-center/route.ts"
Cohesion: 0.21
Nodes (10): dbJsonPath, GET(), POST(), projectRoot, POST(), DataCenterRecordInput, dbJsonPath, getSignedUrl() (+2 more)

### Community 25 - "📜 RENCONTA (PLANNING): BMR CIVIC LEADERSHIP & ADAT HONORIFIC ENGINE"
Cohesion: 0.15
Nodes (12): 📌 1. Ringkasan Eksekutif (Executive Summary), 🎭 2. Matriks Sapaan Kehormatan Adat & Struktural (Honorific Matrix), 3.1 Skema Tabel `bmr_officials`, 🗄️ 3. Arsitektur Database & Skema Tabel Data Pejabat BMR, 🔄 4. Engine Pembaruan Data Otomatis 3-Bulanan (Automated 3-Month Sync Engine), 🧠 5. Integrasi Prompt Injection pada Bogani AI (Abo'), 💼 6. Nilai Tawar Strategic untuk Sponsorship 5 Pemkab BMR, 🗺️ 7. Tahapan Rencana Eksekusi (Execution Roadmap) (+4 more)

### Community 26 - "getSession"
Cohesion: 0.29
Nodes (8): DELETE(), PUT(), GET(), POST(), getSession(), config, proxy(), PUBLIC_PATHS

### Community 27 - "20260717_new_gateway_project.sql"
Cohesion: 0.25
Nodes (10): public.gw_ai_fields, public.gw_api_keys, public.gw_business_profile, public.gw_client_apps, public.gw_field_pool_assignments, public.gw_knowledge_documents, public.gw_provider_keys, public.gw_rate_limit_buckets (+2 more)

### Community 28 - "1.1 The Origin"
Cohesion: 0.18
Nodes (10): 1.1 The Origin, 1.2 The Question, 1.4 The Realization, 1.5 The Responsibility, 1.6 The Commitment, 1.7 Constitution Summary, Chapter 1, The Calling (+2 more)

### Community 29 - "Aksara Bolaang Mongondow"
Cohesion: 0.20
Nodes (9): 1. Apa itu Aksara Bolaang Mongondow?, 2. Struktur Penulisan (cara kerja aksara ini), 3. Contoh Kata & Frasa, 4. Tokoh Sejarah Terkait, 5. Kredit & Sumber, 6. Aset & Data Terkait, Aksara Bolaang Mongondow, Status akademik — penting untuk disampaikan apa adanya (+1 more)

### Community 30 - "BUMERANG — Sejarah perjuangan kampung DOUP (PANANG)"
Cohesion: 0.20
Nodes (9): 1901 — KonTAMBUNAN dibuka menjadi kampung; lahirnya Kotabunan, Buyat, Tutuyan, Arsip Verbatim — Blog "Sejarah Bolmong Timur (Kotabunan)", BUMERANG — Sejarah perjuangan kampung DOUP (PANANG), Catatan penting untuk pembaca/AI, Daftar Nara Sumber Cerita (dicantumkan penulis blog), Kisah Dontu Damopolii, Bai' Lansong Sugeha, dan tujuh Kokasi Emas, Migrasi penduduk Mongondow ke arah timur (awal 1800-an), Sejarah pertambangan Panang/Doup abad ke-20 (konteks ekonomi, bukan asal-usul penduduk) (+1 more)

### Community 31 - "Sejarah Bolaang Mongondow"
Cohesion: 0.20
Nodes (9): 1. Asal-usul Nama, 2. Letak Geografis, 3. Dari Bogani ke Punu' hingga Raja, 4. Pemekaran Wilayah (Era Modern), 5. Masuknya Islam (catatan berbeda antar sumber), 6. Rujukan Arsip Lengkap, Konteks abad ke-16 (dari naskah terpisah), Kronologi Punu' & Raja (menurut arsip yang tersedia) (+1 more)

### Community 32 - "apply/route.ts"
Cohesion: 0.36
Nodes (7): GET(), POST(), urlToDataUrl(), checkFaceCaptureSet(), checkHumanFacePhoto(), FaceCheckResult, parseVerdict()

### Community 33 - "Bahasa dan Sastra Mongondow (Linguistik)"
Cohesion: 0.22
Nodes (8): 1. Fonologi: Distribusi Konsonan, 2. Morfologi & Sintaksis, 3. Kata Tanya (WH-Questions), 4. Sastra Lisan, 5. Materi Ajar Bahasa Mongondow (Sekolah Dasar), 6. Kosakata & Peribahasa, 7. Rujukan Arsip Lengkap, Bahasa dan Sastra Mongondow (Linguistik)

### Community 34 - "Sejarah Bolaang Mongondow Timur (Boltim) — Persebaran Penduduk & Asal-usul Kotabunan"
Cohesion: 0.22
Nodes (8): 1. Migrasi awal penduduk Mongondow ke wilayah timur (awal abad ke-19), 2. Kisah Dontu Damopolii, tujuh Kokasi Emas, dan pembukaan Doup/Panang, 3. Pertemuan dua arus migrasi: pedalaman Mongondow bertemu pesisir Bugis-Bone-Buton, 4. 1901 — KonTAMBUNAN dibuka menjadi kampung: lahirnya Kotabunan, Buyat, Tutuyan, 5. Ringkasan konteks: sejarah pertambangan Panang/Doup (abad ke-20, terpisah dari sejarah pemukiman), 6. Yang BELUM terjawab dari sumber ini — perlu digali lebih lanjut, Sejarah Bolaang Mongondow Timur (Boltim) — Persebaran Penduduk & Asal-usul Kotabunan, Sumber

### Community 35 - "20260716_gateway_console.sql"
Cohesion: 0.31
Nodes (8): public.gw_api_keys, public.gw_business_profile, public.gw_client_apps, public.gw_knowledge_documents, public.gw_provider_keys, public.gw_rate_limit_buckets, public.gw_usage_logs, public.gw_users

### Community 36 - "Adat dan Budaya Mongondow"
Cohesion: 0.25
Nodes (7): 1. Struktur Sosial Tradisional, 2. Adat Perkawinan (Ringkasan), 3. Masuknya Agama, 4. Sastra Lisan, 5. Kosakata Terkait Adat & Budaya, 6. Rujukan Arsip Lengkap, Adat dan Budaya Mongondow

### Community 37 - "Graphify Pengetahuan: Naskah Teater "Panang Lipu' Ku" & Aksi HAM Masyarakat Adat Panang"
Cohesion: 0.25
Nodes (7): 1. Node Tokoh (Naskah Teater), 2. Node Lokasi, 3. Node Peristiwa (Timeline Naskah, urutan babak), 4. Node Dokumentasi Kontemporer — Aksi Hari HAM Sedunia 2022, Dusun 5 Panang, 5. Perbandingan dengan Sumber Sejarah Lain, 6. Graph Structure Overview (Edgelist), Graphify Pengetahuan: Naskah Teater "Panang Lipu' Ku" & Aksi HAM Masyarakat Adat Panang

### Community 38 - "game/page.tsx"
Cohesion: 0.33
Nodes (6): GAME_PACKS, GamePack, GamePage(), Level, Question, TopUser

### Community 40 - "app/layout.tsx"
Cohesion: 0.33
Nodes (4): metadata, organizationJsonLd, websiteJsonLd, GlobalClickFeedback()

### Community 41 - "dependencies"
Cohesion: 0.29
Nodes (7): bcryptjs, cookie, dependencies, bcryptjs, cookie, react-markdown, react-markdown

### Community 42 - "AiMasterPanel.tsx"
Cohesion: 0.29
Nodes (6): AdminRule, AiMasterPanel(), AiMemoryItem, ChatMessage, DEFAULT_ADMIN_RULES, DEFAULT_AI_MEMORIES

### Community 43 - "AksaraPanel.tsx"
Cohesion: 0.33
Nodes (6): AksaraPanel(), GlyphRow, NEW_LETTER_BRIEFS, Point, Stroke, TYPE_LABEL

### Community 44 - "DatabaseKamusPanel.tsx"
Cohesion: 0.29
Nodes (6): DatabaseKamusPanel(), DEFAULT_FEATURED_CARDS, DEFAULT_SHORT_SENTENCES, FeaturedCardRow, KamusEntryRow, ShortSentenceRow

### Community 45 - "Sejarah Kotabunan"
Cohesion: 0.29
Nodes (6): Fase 1 — Sejarah Awal: Migrasi dan Lahirnya Permukiman (± abad ke-19 – 1901), Fase 2 — Zaman Penjajahan: Emas, Kolonialisme, dan Perlawanan, Fase 3 — Sejarah Modern Pasca Belanda: Dari Orde Baru hingga Perjuangan Tanah Adat Kini, Sari Pati / Makna: Tiga Benang Merah Sejarah Kotabunan, Sejarah Kotabunan, Sumber

### Community 46 - "🛠️ Quick Start"
Cohesion: 0.29
Nodes (6): 1. Installation, 2. Environment Setup, 3. Run Development Server, Ginza Project — MongondowPedia & Bogani AI, 🚀 Overview, 🛠️ Quick Start

### Community 47 - "migrate_data_across_projects.ts"
Cohesion: 0.33
Nodes (6): envPath, migrateTable(), projectRoot, run(), sourceClient, targetClient

### Community 48 - "seed_json_job_routing.ts"
Cohesion: 0.29
Nodes (6): assignmentsToSeed, db, dbJsonPath, fieldsToSeed, projectRoot, specsToSeed

### Community 49 - "routing/route.ts"
Cohesion: 0.53
Nodes (5): dbPath, GET(), POST(), readLocalDb(), writeLocalDb()

### Community 50 - "specs/route.ts"
Cohesion: 0.53
Nodes (5): dbPath, GET(), POST(), readLocalDb(), writeLocalDb()

### Community 51 - "Graphify Pengetahuan: Etimologi, Morfologi, & Rumpun Istilah Bahasa Mongondow"
Cohesion: 0.33
Nodes (5): 1. Node Etimologi Utama Nama Wilayah & Bahasa, 2. Node Morfologi Imbuhan (Prefix System Graph), 3. Node Kosakata Lingkungan Alam & Kehidupan, 4. Graph Relasi Morfologi (Network Graph), Graphify Pengetahuan: Etimologi, Morfologi, & Rumpun Istilah Bahasa Mongondow

### Community 52 - "Graphify Pengetahuan: Pemetaan Konsep Adat, Falsafah, & Ritual Mongondow"
Cohesion: 0.33
Nodes (5): 1. Node Tri-Motto Falsafah Kebudayaan Mongondow, 2. Node Hierarki Kemasyarakatan Adat (Stratifikasi Adat), 3. Node Siklus Ritual Adat Kehidupan (Life-Cycle Rituals), 4. Graph Relasi Sistemik Adat (Flow Matrix), Graphify Pengetahuan: Pemetaan Konsep Adat, Falsafah, & Ritual Mongondow

### Community 53 - "Graphify Pengetahuan: Silsilah Raja-Raja & Dinasti Bolaang Mongondow"
Cohesion: 0.33
Nodes (5): 1. Node Leluhur Asal-Usul & Masa Bogani, 2. Node & Relasi Silsilah Punu' (Raja Pertama - Abad 15–17), 3. Node Dinasti Manoppo & Era Kedatuan (1695 – 1950), 4. Graph Structure Overview (Edgelist), Graphify Pengetahuan: Silsilah Raja-Raja & Dinasti Bolaang Mongondow

### Community 54 - "Katalog & Rekomendasi Prioritas — Folder "drive-download-20260727...""
Cohesion: 0.33
Nodes (5): Katalog & Rekomendasi Prioritas — Folder "drive-download-20260727...", Kendala teknis yang perlu diketahui, Prioritas Rendah — Nusantara umum / di luar Sulawesi Utara, Prioritas Sedang — konteks Sulawesi Utara/Gorontalo (tetangga), Prioritas Tinggi — spesifik Bolaang Mongondow

### Community 55 - "20260807_google_oauth_and_users_sync.sql"
Cohesion: 0.33
Nodes (4): public.handle_new_user_sync, on_auth_user_created_sync, public.profiles, auth.users

### Community 56 - "20260713220141_init.sql"
Cohesion: 0.53
Nodes (5): public.api_keys, public.business_profile, public.client_apps, public.knowledge_documents, public.usage_logs

### Community 57 - "20260804_aksara_glyphs.sql"
Cohesion: 0.47
Nodes (5): public.aksara_glyph_verifications, public.aksara_glyphs, public.profiles, public.set_updated_at, trg_aksara_glyphs_updated_at

### Community 58 - "vercel.json"
Cohesion: 0.33
Nodes (5): buildCommand, framework, headers, installCommand, $schema

### Community 59 - "artikel/page.tsx"
Cohesion: 0.40
Nodes (3): Article, CATEGORY_TABS, REGIONS

### Community 60 - "DatabaseKnowledgePanel.tsx"
Cohesion: 0.50
Nodes (4): ArticleRow, CategoryRow, convertImageToWebP(), DatabaseKnowledgePanel()

### Community 61 - "seed_supabase_routing.ts"
Cohesion: 0.40
Nodes (3): envPath, projectRoot, supabaseAdmin

### Community 62 - "public.gw_data_center"
Cohesion: 0.50
Nodes (3): public, public.gw_data_center, public.gw_client_apps

### Community 64 - "test_routing.ts"
Cohesion: 0.83
Nodes (3): run(), test400Error(), testField()

### Community 65 - "20260802_aksara_mongondow.sql"
Cohesion: 0.50
Nodes (3): public.mongondow_aksara_examples, public.mongondow_aksara_info, public.mongondow_aksara_syllables

### Community 66 - "public.article_comments"
Cohesion: 0.83
Nodes (3): public.article_comments, public.user_articles, public.profiles

## Knowledge Gaps
- **408 isolated node(s):** `ADMIN_EMAIL`, `GENERIC_RESPONSE`, `ADMIN_EMAIL`, `projectRoot`, `dbJsonPath` (+403 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **75 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabaseAdmin` connect `supabase.ts` to `ginza-db.ts`, `apply/route.ts`, `chat/route.ts`, `decryptKey`, `index.ts`, `forgot-password/route.ts`, `requireProfile`, `[article]/page.tsx`, `supabase-auth-server.ts`, `routing/route.ts`, `specs/route.ts`, `login/route.ts`, `data-center/route.ts`, `getSession`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `Language` connect `MyAIChat.tsx` to `chat/route.ts`, `Dashboard.tsx`, `LoginScreen.tsx`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **What connects `ADMIN_EMAIL`, `GENERIC_RESPONSE`, `ADMIN_EMAIL` to the rest of the system?**
  _408 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ginza-db.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.052277227722772275 - nodes in this community are weakly interconnected._
- **Should `aksara-export.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0567287784679089 - nodes in this community are weakly interconnected._
- **Should `chat/route.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09025974025974026 - nodes in this community are weakly interconnected._
- **Should `VerificatorDashboard.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05272895467160037 - nodes in this community are weakly interconnected._