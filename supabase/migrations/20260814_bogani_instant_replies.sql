-- ═══════════════════════════════════════════════════════════════════════
-- Balasan Instan Bogani AI (sapaan singkat dijawab tanpa panggil AI apa pun)
-- Ditambahkan krn Gateway butuh ~15-20 detik/jawaban tanpa streaming --
-- sapaan singkat ("halo", "assalamualaikum", "selamat pagi", dst) tidak
-- perlu menunggu itu sama sekali. Dikelompokkan per JENIS sapaan (bukan 1
-- kumpulan generik) supaya balasan tetap nyambung konteksnya (mis. salam
-- islami dibalas "Waalaikumsalam", bukan template sapaan umum).
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.bogani_instant_replies (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  trigger_keywords text[] not null default '{}',
  reply_variants text[] not null default '{}',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_bogani_instant_replies_updated_at on public.bogani_instant_replies;
create trigger trg_bogani_instant_replies_updated_at
  before update on public.bogani_instant_replies
  for each row execute function public.set_updated_at();

create index if not exists idx_bogani_instant_replies_active on public.bogani_instant_replies (is_active, sort_order);

alter table public.bogani_instant_replies enable row level security;

-- Tidak ada policy publik: tabel ini HANYA dibaca/ditulis lewat
-- supabaseAdmin (service role, bypass RLS) di app/api/admin/instant-replies
-- (requireAdmin, dashboard) dan app/api/homepage/chat/route.ts (read-only,
-- server-side, sebelum panggil Gateway/AI apa pun).

insert into public.bogani_instant_replies (label, trigger_keywords, reply_variants, sort_order) values
(
  'Sapaan Umum',
  array['hai','hi','halo','hallo','hello','hey','hei'],
  array[
    'Niondon Utat! Aku''oy Bogani AI, siap menemani Utat belajar bahasa, sejarah, adat, dan Aksara Bolaang Mongondow Raya. Ada cerita atau pertanyaan menarik hari ini?',
    'Dega Niondon Utat! Bogani AI di sini, siap bantu soal sejarah, bahasa, atau adat Mongondow. Mau mulai dari mana, Utat?',
    'Halo Utat! Senang sekali bisa disapa. Aku Bogani AI, sahabat digital MongondowPedia. Ada yang mau ditanyakan?',
    'Niondon kon MongondowPedia, Utat! Bogani AI siap menemani perjalanan belajarmu hari ini.',
    'Hai Utat! Salam hangat kekeluargaan dari Bogani AI. Ada topik budaya Mongondow yang menarik buat dibahas?'
  ],
  1
),
(
  'Salam Islami',
  array['assalamualaikum','assalamu alaikum','asalamualaikum','assalammualaikum','askum'],
  array[
    'Waalaikumsalam warahmatullahi wabarakatuh, Utat! Bogani AI siap membantu hari ini.',
    'Waalaikumsalam, Utat! Senang disapa dengan salam sehangat ini. Ada yang bisa Abo bantu?',
    'Waalaikumsalam warahmatullah, Utat! Yuk, ada topik sejarah atau budaya Mongondow yang mau dibahas?',
    'Waalaikumsalam warahmatullahi wabarakatuh. Niondon juga, Utat! Ada yang bisa dibantu Bogani AI?',
    'Waalaikumsalam, Utat! Bogani AI di sini, siap menemani belajar budaya Bolaang Mongondow.'
  ],
  2
),
(
  'Sapaan Pagi',
  array['selamat pagi','met pagi'],
  array[
    'Selamat pagi juga, Utat! Semoga harinya cerah. Ada yang mau dipelajari bareng Bogani AI pagi ini?',
    'Pagi, Utat! Niondon di MongondowPedia. Mau mulai hari dengan cerita budaya Mongondow?',
    'Selamat pagi, Utat! Bogani AI siap menemani, mau tanya soal apa hari ini?',
    'Pagi yang baik, Utat! Semangat mengawali hari, ada yang bisa Abo bantu?',
    'Selamat pagi, Utat! Yuk mulai hari ini dengan belajar sesuatu yang baru soal Bolaang Mongondow.'
  ],
  3
),
(
  'Sapaan Siang',
  array['selamat siang','met siang'],
  array[
    'Selamat siang, Utat! Sudah istirahat makan siang? Ada yang bisa Bogani AI bantu?',
    'Siang, Utat! Niondon di MongondowPedia, semoga harinya lancar. Mau tanya apa hari ini?',
    'Selamat siang, Utat! Bogani AI siap menemani di tengah kesibukan hari ini.',
    'Siang yang baik, Utat! Ada topik budaya atau bahasa Mongondow yang ingin dibahas?',
    'Selamat siang, Utat! Yuk lanjut belajar bareng Abo.'
  ],
  4
),
(
  'Sapaan Sore',
  array['selamat sore','met sore'],
  array[
    'Selamat sore, Utat! Ada yang bisa Bogani AI bantu menjelang malam ini?',
    'Sore, Utat! Niondon di MongondowPedia. Mau ngobrol soal apa sore ini?',
    'Selamat sore, Utat! Bogani AI siap menemani sisa hari ini.',
    'Sore yang baik, Utat! Ada cerita adat atau sejarah yang menarik buat dibahas?',
    'Selamat sore, Utat! Yuk tutup hari ini dengan belajar sesuatu yang baru.'
  ],
  5
),
(
  'Sapaan Malam',
  array['selamat malam','met malam'],
  array[
    'Selamat malam, Utat! Ada yang bisa Bogani AI bantu sebelum istirahat?',
    'Malam, Utat! Niondon di MongondowPedia. Mau tanya sesuatu sebelum tidur?',
    'Selamat malam, Utat! Bogani AI masih siap menemani meski sudah malam.',
    'Malam yang tenang, Utat! Ada topik budaya Mongondow yang mau dibahas sebelum istirahat?',
    'Selamat malam, Utat! Yuk sempatkan belajar sedikit sebelum tidur.'
  ],
  6
)
on conflict (label) do nothing;
