-- Feedback / Kuisioner sederhana selama masa percobaan -- diakses lewat
-- tombol di header (dekat Info), publik boleh kirim (termasuk tamu), hanya
-- admin yang bisa membaca lewat Admin Dashboard.
create table if not exists public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text,
  email text,
  category text not null default 'lainnya' check (
    category in ('bug', 'saran_fitur', 'kritik', 'kuisioner', 'lainnya')
  ),
  rating smallint check (rating between 1 and 5),
  message text not null,
  page_url text,
  status text not null default 'baru' check (
    status in ('baru', 'dibaca', 'ditindaklanjuti', 'diarsipkan')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_feedback_submissions_updated_at on public.feedback_submissions;
create trigger trg_feedback_submissions_updated_at
  before update on public.feedback_submissions
  for each row execute function public.set_updated_at();

create index if not exists idx_feedback_submissions_created on public.feedback_submissions (created_at desc);
create index if not exists idx_feedback_submissions_status on public.feedback_submissions (status);

alter table public.feedback_submissions enable row level security;

drop policy if exists "feedback_public_insert" on public.feedback_submissions;
create policy "feedback_public_insert" on public.feedback_submissions
  for insert with check (true);

drop policy if exists "feedback_admin_all" on public.feedback_submissions;
create policy "feedback_admin_all" on public.feedback_submissions
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
