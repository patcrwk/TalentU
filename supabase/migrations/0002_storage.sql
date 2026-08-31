-- Storage bucket for uploaded resource files (PDFs, etc).
-- Run this after 0001_init.sql, once the Storage tab has been opened at
-- least once in the Supabase dashboard (provisions storage.buckets lazily
-- on brand new projects — see CLAUDE.md).

insert into storage.buckets (id, name, public)
values ('resource-files', 'resource-files', true)
on conflict (id) do nothing;

create policy "resource_files_public_read" on storage.objects
  for select using (bucket_id = 'resource-files');
create policy "resource_files_admin_write" on storage.objects
  for insert with check (bucket_id = 'resource-files' and public.is_admin());
create policy "resource_files_admin_update" on storage.objects
  for update using (bucket_id = 'resource-files' and public.is_admin());
create policy "resource_files_admin_delete" on storage.objects
  for delete using (bucket_id = 'resource-files' and public.is_admin());
