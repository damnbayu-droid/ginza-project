-- Fix 10 Security Advisor warnings terlihat di dashboard Supabase:
-- 1) 5 tabel legacy "MyAI OS Gateway" (api_keys, business_profile,
--    client_apps, knowledge_documents, usage_logs) punya policy bernama
--    "...for authenticated admin" tapi isinya USING(true)/WITH CHECK(true)
--    -- artinya SEMUA user authenticated (bukan cuma admin) bisa baca/ubah/
--    hapus SEMUA baris, termasuk tabel api_keys. Tidak dipakai di codebase
--    Next.js manapun saat ini, jadi aman dikunci ke admin saja.
-- 2) Extension pgvector dipindah keluar dari schema public ke schema
--    "extensions" (non-destruktif, ALTER EXTENSION SET SCHEMA).
-- (contact_messages_public_insert & handle_new_user_sync SECURITY DEFINER
--  sudah dibereskan di migration 20260808_rls_policies_missing_tables_and_lock_trigger_fn.sql)

drop policy if exists "Allow all actions for authenticated admin on api_keys" on public.api_keys;
create policy "api_keys_admin_all" on public.api_keys
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "Allow all actions for authenticated admin on business_profile" on public.business_profile;
create policy "business_profile_admin_all" on public.business_profile
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "Allow all actions for authenticated admin on client_apps" on public.client_apps;
create policy "client_apps_admin_all" on public.client_apps
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "Allow all actions for authenticated admin on knowledge_document" on public.knowledge_documents;
create policy "knowledge_documents_admin_all" on public.knowledge_documents
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "Allow all actions for authenticated admin on usage_logs" on public.usage_logs;
create policy "usage_logs_admin_all" on public.usage_logs
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

alter extension vector set schema extensions;
