-- =============================================================================
-- Vertiz — Migration 002: catálogo de imóveis (site público + CMS)
-- =============================================================================

create type public.tipo_imovel as enum (
  'apartamento', 'casa', 'cobertura', 'flat', 'sala_comercial',
  'loja', 'galpao', 'terreno', 'outro'
);

create type public.finalidade_imovel as enum ('venda', 'locacao', 'venda_locacao');

create type public.status_imovel as enum ('disponivel', 'reservado', 'vendido', 'alugado');

create table if not exists public.imoveis (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- Responsável
  corretor_id         uuid not null references auth.users(id) on delete restrict,

  -- Identificação
  nome_empreendimento varchar(200) not null,
  slug                varchar(255) not null unique,
  tipo_imovel         public.tipo_imovel not null,
  finalidade          public.finalidade_imovel not null default 'venda',

  -- Localização
  bairro              varchar(100) not null,
  cidade              varchar(100) not null default 'Recife',
  uf                  char(2)      not null default 'PE',
  endereco            text,
  cep                 varchar(9),

  -- Características
  area_m2             numeric(8,2)  check (area_m2 > 0),
  quartos             smallint      check (quartos   between 0 and 20),
  suites              smallint      check (suites    between 0 and 20),
  banheiros           smallint      check (banheiros between 0 and 20),
  vagas               smallint      check (vagas     between 0 and 20),
  andar               smallint,
  mobiliado           boolean not null default false,

  -- Valores (BRL)
  valor_venda         numeric(12,2) check (valor_venda   > 0),
  valor_aluguel       numeric(12,2) check (valor_aluguel > 0),
  valor_condominio    numeric(12,2) check (valor_condominio >= 0),
  valor_iptu          numeric(12,2) check (valor_iptu      >= 0),
  taxas_inclusas      boolean not null default false,

  -- Conteúdo
  descricao           text,
  diferenciais        text[] not null default '{}',
  proximidades        text[] not null default '{}',

  -- Publicação
  status              public.status_imovel not null default 'disponivel',
  publicado           boolean not null default false,
  destaque            boolean not null default false,
  publicado_em        timestamptz,

  -- Consistência: publicado exige valor coerente com a finalidade
  constraint chk_valor_por_finalidade check (
    not publicado
    or (finalidade = 'venda'         and valor_venda   is not null)
    or (finalidade = 'locacao'       and valor_aluguel is not null)
    or (finalidade = 'venda_locacao' and valor_venda is not null and valor_aluguel is not null)
  ),
  constraint chk_suites_ate_quartos check (
    suites is null or quartos is null or suites <= quartos
  )
);

create index idx_imoveis_corretor  on public.imoveis(corretor_id);
create index idx_imoveis_slug      on public.imoveis(slug);
create index idx_imoveis_vitrine   on public.imoveis(publicado, status, created_at desc);
create index idx_imoveis_bairro    on public.imoveis(bairro)      where publicado;
create index idx_imoveis_tipo      on public.imoveis(tipo_imovel) where publicado;
create index idx_imoveis_destaque  on public.imoveis(destaque)    where publicado and destaque;

create trigger trg_imoveis_updated_at
  before update on public.imoveis
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Slug amigável para SEO: apartamento-boa-viagem-3-quartos
-- Gerado no banco para que CMS, importação e API cheguem sempre no mesmo formato.
-- -----------------------------------------------------------------------------

-- Remoção de acentos sem depender da extensão unaccent (nem sempre habilitada
-- e não IMMUTABLE por padrão, o que impediria uso em índices/expressões).
create or replace function public.sem_acento(txt text)
returns text
language sql
immutable
set search_path = ''
as $$
  select translate(
    coalesce(txt, ''),
    'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
    'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN'
  );
$$;

create or replace function public.slugify(txt text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(both '-' from
    regexp_replace(lower(public.sem_acento(txt)), '[^a-z0-9]+', '-', 'g')
  );
$$;

create or replace function public.gerar_slug_imovel()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  base   text;
  cand   text;
  sufixo int := 1;
begin
  -- Só (re)gera quando não há slug ou quando os campos-fonte mudaram.
  if tg_op = 'UPDATE'
     and new.slug is not null and new.slug <> ''
     and new.nome_empreendimento is not distinct from old.nome_empreendimento
     and new.tipo_imovel         is not distinct from old.tipo_imovel
     and new.bairro              is not distinct from old.bairro
     and new.quartos             is not distinct from old.quartos then
    return new;
  end if;

  base := public.slugify(
    new.tipo_imovel::text || '-' || new.bairro ||
    coalesce('-' || nullif(new.quartos, 0)::text || '-quartos', '') ||
    '-' || new.nome_empreendimento
  );

  cand := base;
  while exists (select 1 from public.imoveis i where i.slug = cand and i.id <> new.id) loop
    sufixo := sufixo + 1;
    cand := base || '-' || sufixo::text;
  end loop;

  new.slug := cand;
  return new;
end;
$$;

create trigger trg_imoveis_slug
  before insert or update on public.imoveis
  for each row execute function public.gerar_slug_imovel();

-- Carimba a data da primeira publicação (usada para ordenar a vitrine).
create or replace function public.marcar_publicacao()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.publicado and new.publicado_em is null then
    new.publicado_em := now();
  end if;
  return new;
end;
$$;

create trigger trg_imoveis_publicado_em
  before insert or update on public.imoveis
  for each row execute function public.marcar_publicacao();

-- =============================================================================
-- Fotos
-- =============================================================================
create table if not exists public.imovel_fotos (
  id           uuid primary key default gen_random_uuid(),
  imovel_id    uuid not null references public.imoveis(id) on delete cascade,
  storage_path text not null,
  largura      int,
  altura       int,
  ordem        smallint not null default 1,
  legenda      varchar(200),
  capa         boolean not null default false,
  created_at   timestamptz not null default now()
);

create index idx_fotos_imovel on public.imovel_fotos(imovel_id, ordem);
create unique index idx_fotos_capa_unica on public.imovel_fotos(imovel_id) where capa;

-- =============================================================================
-- RLS: imoveis
-- =============================================================================
alter table public.imoveis enable row level security;

-- Site público: só o que está publicado.
create policy "imoveis: publico le publicados"
  on public.imoveis for select
  to anon, authenticated
  using (publicado);

create policy "imoveis: equipe le tudo"
  on public.imoveis for select
  to authenticated
  using (public.is_equipe());

-- Corretor cadastra em seu próprio nome; gestor cadastra para qualquer um.
create policy "imoveis: equipe insere"
  on public.imoveis for insert
  to authenticated
  with check (
    (public.is_equipe() and corretor_id = (select auth.uid()))
    or public.is_gestor()
  );

create policy "imoveis: corretor edita os seus"
  on public.imoveis for update
  to authenticated
  using      (public.is_equipe() and corretor_id = (select auth.uid()))
  with check (corretor_id = (select auth.uid()));

create policy "imoveis: gestor edita todos"
  on public.imoveis for update
  to authenticated
  using      (public.is_gestor())
  with check (public.is_gestor());

-- Exclusão apenas do gestor — corretor despublica, não apaga.
create policy "imoveis: gestor exclui"
  on public.imoveis for delete
  to authenticated
  using (public.is_gestor());

-- =============================================================================
-- RLS: imovel_fotos
-- =============================================================================
alter table public.imovel_fotos enable row level security;

create policy "fotos: publico le de imovel publicado"
  on public.imovel_fotos for select
  to anon, authenticated
  using (
    exists (select 1 from public.imoveis i where i.id = imovel_id and i.publicado)
  );

create policy "fotos: equipe le todas"
  on public.imovel_fotos for select
  to authenticated
  using (public.is_equipe());

create policy "fotos: dono do imovel ou gestor gerencia"
  on public.imovel_fotos for all
  to authenticated
  using (
    exists (
      select 1 from public.imoveis i
      where i.id = imovel_id
        and (i.corretor_id = (select auth.uid()) or public.is_gestor())
    )
  )
  with check (
    exists (
      select 1 from public.imoveis i
      where i.id = imovel_id
        and (i.corretor_id = (select auth.uid()) or public.is_gestor())
    )
  );

-- =============================================================================
-- Filtros inteligentes: facetas só com estoque ativo.
-- security_invoker = on faz a view respeitar o RLS de quem consulta, em vez de
-- rodar com os privilégios do dono (padrão do Postgres) — o que vazaria imóveis
-- despublicados para visitantes anônimos.
-- =============================================================================
create or replace view public.catalogo_facetas
with (security_invoker = on) as
select
  i.finalidade,
  i.tipo_imovel,
  i.bairro,
  count(*)::int                                 as total,
  min(coalesce(i.valor_venda, i.valor_aluguel)) as valor_min,
  max(coalesce(i.valor_venda, i.valor_aluguel)) as valor_max,
  max(coalesce(i.quartos, 0))::int              as quartos_max
from public.imoveis i
where i.publicado
  and i.status in ('disponivel', 'reservado')
group by i.finalidade, i.tipo_imovel, i.bairro;

grant select on public.catalogo_facetas to anon, authenticated;
