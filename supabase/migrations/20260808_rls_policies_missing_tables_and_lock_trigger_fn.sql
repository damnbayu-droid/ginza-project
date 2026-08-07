-- Fix pre-deploy security advisor findings: 4 tabel RLS enabled tanpa policy
-- (default fail-closed utk akses client langsung), + lock search_path fungsi
-- trigger handle_new_user_sync (mutable search_path + bisa dieksekusi manual
-- lewat RPC oleh anon/authenticated).

-- 1. aksara_submissions
drop policy if exists "aksara_submissions_owner_all" on public.aksara_submissions;
create policy "aksara_submissions_owner_all" on public.aksara_submissions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "aksara_submissions_staff_all" on public.aksara_submissions;
create policy "aksara_submissions_staff_all" on public.aksara_submissions
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','verificator'))
  );

-- 2. article_comments
drop policy if exists "article_comments_public_read" on public.article_comments;
create policy "article_comments_public_read" on public.article_comments
  for select using (true);

drop policy if exists "article_comments_owner_write" on public.article_comments;
create policy "article_comments_owner_write" on public.article_comments
  for insert with check (auth.uid() = user_id);

drop policy if exists "article_comments_owner_modify" on public.article_comments;
create policy "article_comments_owner_modify" on public.article_comments
  for update using (auth.uid() = user_id);

drop policy if exists "article_comments_owner_delete" on public.article_comments;
create policy "article_comments_owner_delete" on public.article_comments
  for delete using (auth.uid() = user_id);

drop policy if exists "article_comments_admin_all" on public.article_comments;
create policy "article_comments_admin_all" on public.article_comments
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- 3. user_articles
drop policy if exists "user_articles_public_read" on public.user_articles;
create policy "user_articles_public_read" on public.user_articles
  for select using (status = 'published');

drop policy if exists "user_articles_owner_all" on public.user_articles;
create policy "user_articles_owner_all" on public.user_articles
  for all using (auth.uid() = author_id) with check (auth.uid() = author_id);

drop policy if exists "user_articles_admin_all" on public.user_articles;
create policy "user_articles_admin_all" on public.user_articles
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- 4. verificator_actions (log audit internal)
drop policy if exists "verificator_actions_self_read" on public.verificator_actions;
create policy "verificator_actions_self_read" on public.verificator_actions
  for select using (auth.uid() = verificator_id);

drop policy if exists "verificator_actions_admin_all" on public.verificator_actions;
create policy "verificator_actions_admin_all" on public.verificator_actions
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- 5. Lock search_path + cabut EXECUTE publik dari trigger function
alter function public.handle_new_user_sync() set search_path = public, pg_temp;
revoke execute on function public.handle_new_user_sync() from public;
revoke execute on function public.handle_new_user_sync() from anon;
revoke execute on function public.handle_new_user_sync() from authenticated;
