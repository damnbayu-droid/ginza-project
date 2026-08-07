-- ═══════════════════════════════════════════════════════════════════════
-- Tabel Contact Messages (Pesan Pengembang & Email Resend)
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  whatsapp text,
  message text not null,
  status text not null default 'unread' check (status in ('unread', 'read', 'replied', 'archived')),
  resend_id text,
  forwarded_to text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_contact_messages_status on public.contact_messages (status);
create index if not exists idx_contact_messages_created_at on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

create policy "contact_messages_public_insert" on public.contact_messages
  for insert with check (true);

create policy "contact_messages_admin_all" on public.contact_messages
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
