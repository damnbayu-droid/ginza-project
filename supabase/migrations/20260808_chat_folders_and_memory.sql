-- ═══════════════════════════════════════════════════════════════════════
-- Chat Folders (Project) + User Memory utk Bogani AI
-- Ditambahkan agar user bisa mengelompokkan obrolan (spt "Project" di
-- ChatGPT/Claude) dan agar Bogani AI punya memori fakta ringkas lintas-sesi
-- ttg tiap user (bukan cuma konteks dalam satu percakapan).
-- ═══════════════════════════════════════════════════════════════════════

-- ── 1. CHAT FOLDERS ───────────────────────────────────────────────────
create table if not exists public.chat_folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_chat_folders_updated_at on public.chat_folders;
create trigger trg_chat_folders_updated_at
  before update on public.chat_folders
  for each row execute function public.set_updated_at();

create index if not exists idx_chat_folders_user on public.chat_folders (user_id, created_at desc);

alter table public.chat_folders enable row level security;

drop policy if exists "chat_folders_owner_all" on public.chat_folders;
create policy "chat_folders_owner_all" on public.chat_folders
  for all using (auth.uid() = user_id);

-- ── 2. conversations.folder_id (nullable = "Tanpa Folder") ─────────────
alter table public.conversations
  add column if not exists folder_id uuid references public.chat_folders(id) on delete set null;

create index if not exists idx_conversations_folder on public.conversations (folder_id);
create index if not exists idx_conversations_user_updated on public.conversations (user_id, updated_at desc);

-- ── 3. USER MEMORY (fakta ringkas ttg user, dipakai lintas-sesi) ───────
create table if not exists public.user_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  category text not null default 'general' check (
    category in ('general', 'preference', 'fact', 'goal')
  ),
  source_conversation_id uuid references public.conversations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_user_memory_updated_at on public.user_memory;
create trigger trg_user_memory_updated_at
  before update on public.user_memory
  for each row execute function public.set_updated_at();

create index if not exists idx_user_memory_user on public.user_memory (user_id, created_at desc);

alter table public.user_memory enable row level security;

drop policy if exists "user_memory_owner_all" on public.user_memory;
create policy "user_memory_owner_all" on public.user_memory
  for all using (auth.uid() = user_id);

drop policy if exists "user_memory_admin_read" on public.user_memory;
create policy "user_memory_admin_read" on public.user_memory
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
