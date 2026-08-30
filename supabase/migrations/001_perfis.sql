-- =============================================================================
-- Vertiz — Migration 001: perfis de usuário, papéis e helpers de autorização
-- =============================================================================
-- Papéis do escopo: corretor e gestor (Guilherme = gestor, acesso pleno).
-- =============================================================================

create type public.user_role as enum ('corretor', 'gestor');

create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users(id) on delete cascade,
  nome        varchar(200) not null,
  email       varchar(255) not null,
  telefone    varchar(20),
  avatar_url  text,
  role        public.user_role not null default 'corretor',
  ativo       boolean not null default true,
  creci       varchar(20),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_profiles_user_id on public.profiles(user_id);
create index idx_profiles_role    on public.profiles(role) where ativo;

-- -----------------------------------------------------------------------------
-- Trigger genérico de updated_at
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Cria profile automaticamente ao criar usuário no Auth.
-- O papel NUNCA vem do metadata do usuário (o cliente controla esse campo no
-- signup) — todo mundo entra como 'corretor' e a promoção a gestor é manual.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, nome, email)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'nome'), ''), split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Helpers de autorização.
--
-- SECURITY DEFINER de propósito: ler `profiles` de dentro de uma policy DE
-- `profiles` causaria recursão infinita ("infinite recursion detected in policy").
-- Estas funções rodam fora do RLS e são o único ponto que consulta o papel.
-- -----------------------------------------------------------------------------
create or replace function public.is_gestor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = (select auth.uid())
      and p.role = 'gestor'
      and p.ativo
  );
$$;

create or replace function public.is_equipe()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = (select auth.uid())
      and p.ativo
  );
$$;

revoke execute on function public.is_gestor()  from public;
revoke execute on function public.is_equipe()  from public;
grant  execute on function public.is_gestor()  to authenticated;
grant  execute on function public.is_equipe()  to authenticated;

-- =============================================================================
-- RLS: profiles
-- =============================================================================
alter table public.profiles enable row level security;

create policy "profiles: equipe lê a equipe"
  on public.profiles for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_equipe());

-- Usuário edita o próprio perfil, mas não pode se autopromover nem se reativar.
create policy "profiles: edição própria sem escalar papel"
  on public.profiles for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and role  = (select p.role  from public.profiles p where p.user_id = (select auth.uid()))
    and ativo = (select p.ativo from public.profiles p where p.user_id = (select auth.uid()))
  );

create policy "profiles: gestor gerencia todos"
  on public.profiles for all
  to authenticated
  using (public.is_gestor())
  with check (public.is_gestor());
