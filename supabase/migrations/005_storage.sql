-- =============================================================================
-- Vertiz — Migration 005: Storage das fotos de imóveis
-- =============================================================================
-- Bucket público de LEITURA (as fotos aparecem no site sem autenticação), mas
-- ESCRITA restrita à equipe. Sem isso qualquer visitante com a anon key poderia
-- subir arquivos para o bucket.
--
-- Convenção de caminho: imoveis/<imovel_id>/<uuid>.webp
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'imoveis',
  'imoveis',
  true,
  5242880, -- 5 MB por arquivo (a compressão no cliente entrega bem abaixo disso)
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Leitura pública
create policy "storage imoveis: leitura publica"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'imoveis');

-- Upload apenas por membro ativo da equipe
create policy "storage imoveis: equipe envia"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'imoveis' and public.is_equipe());

create policy "storage imoveis: equipe atualiza"
  on storage.objects for update
  to authenticated
  using      (bucket_id = 'imoveis' and public.is_equipe())
  with check (bucket_id = 'imoveis' and public.is_equipe());

create policy "storage imoveis: equipe remove"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'imoveis' and public.is_equipe());
