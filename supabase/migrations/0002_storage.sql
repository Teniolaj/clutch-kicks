-- Public bucket for product photos; only admins can write.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
        array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

create policy "product-images admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "product-images admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

create policy "product-images admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
-- Reads are served via the public bucket URL, so no select policy is needed.
