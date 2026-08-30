-- =============================================================================
-- Vertiz — Migration 003: CRM (pipeline Kanban, leads, histórico, busca global)
-- =============================================================================
-- Entrada de leads na v1: criação MANUAL pela equipe. O clique em "Consultar
-- Disponibilidade" abre o WhatsApp (app externo) e não gera lead sozinho — isso
-- exigiria a API Oficial do WhatsApp (Meta). Por isso não existe policy de
-- INSERT para `anon` nesta tabela: nada entra em `leads` sem usuário autenticado.
-- =============================================================================

create extension if not exists pg_trgm;

create type public.etapa_lead as enum (
  'captacao',
  'qualificacao',
  'visita',
  'proposta',
  'documentacao',
  'fechamento',
  'pos_venda',
  'perdido'
);

create type public.origem_lead as enum (
  'site', 'whatsapp', 'instagram', 'indicacao', 'ligacao', 'outro'
);

create type public.tipo_evento_lead as enum ('etapa', 'nota', 'atribuicao', 'criacao');

create table if not exists public.leads (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- Contato
  nome                varchar(200) not null,
  telefone            varchar(20)  not null,
  -- Coluna gerada: normaliza o telefone para busca por dígitos.
  telefone_digitos    text generated always as (regexp_replace(telefone, '[^0-9]', '', 'g')) stored,
  email               varchar(255),

  -- Interesse
  imovel_interesse_id uuid references public.imoveis(id) on delete set null,
  origem              public.origem_lead not null default 'whatsapp',
  observacoes         text,

  -- Pipeline
  etapa               public.etapa_lead not null default 'captacao',
  corretor_id         uuid references auth.users(id) on delete set null,
  criado_por          uuid not null references auth.users(id) on delete restrict,

  -- Encerramento
  motivo_perda        text,
  fechado_em          timestamptz,

  -- Perdido exige motivo (o relatório de conversão depende disso).
  constraint chk_motivo_perda check (etapa <> 'perdido' or nullif(trim(motivo_perda), '') is not null),
  -- Fila aberta só existe em Captação: fora dela, o lead tem dono.
  constraint chk_fila_aberta   check (corretor_id is not null or etapa = 'captacao')
);

create index idx_leads_corretor  on public.leads(corretor_id);
create index idx_leads_etapa     on public.leads(etapa, created_at desc);
create index idx_leads_fila      on public.leads(created_at desc) where corretor_id is null;
create index idx_leads_criado    on public.leads(created_at desc);
create index idx_leads_telefone  on public.leads(telefone_digitos);
create index idx_leads_nome_trgm on public.leads using gin (public.sem_acento(nome) gin_trgm_ops);

create trigger trg_leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Histórico de movimentação
-- =============================================================================
create table if not exists public.lead_eventos (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads(id) on delete cascade,
  usuario_id  uuid references auth.users(id) on delete set null,
  tipo        public.tipo_evento_lead not null,
  etapa_de    public.etapa_lead,
  etapa_para  public.etapa_lead,
  descricao   text,
  created_at  timestamptz not null default now()
);

create index idx_lead_eventos_lead on public.lead_eventos(lead_id, created_at desc);

-- Registra automaticamente criação, mudança de etapa e reatribuição.
-- SECURITY DEFINER porque o histórico não pode depender das policies de INSERT
-- de lead_eventos (que só permitem notas manuais).
create or replace function public.registrar_evento_lead()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.lead_eventos (lead_id, usuario_id, tipo, etapa_para, descricao)
    values (new.id, (select auth.uid()), 'criacao', new.etapa, 'Lead criado');
    return new;
  end if;

  if new.etapa is distinct from old.etapa then
    insert into public.lead_eventos (lead_id, usuario_id, tipo, etapa_de, etapa_para, descricao)
    values (
      new.id, (select auth.uid()), 'etapa', old.etapa, new.etapa,
      case when new.etapa = 'perdido' then new.motivo_perda else null end
    );
  end if;

  if new.corretor_id is distinct from old.corretor_id then
    insert into public.lead_eventos (lead_id, usuario_id, tipo, descricao)
    values (
      new.id, (select auth.uid()), 'atribuicao',
      case when old.corretor_id is null then 'Lead assumido da fila aberta'
           else 'Lead reatribuído' end
    );
  end if;

  return new;
end;
$$;

create trigger trg_leads_eventos
  after insert or update on public.leads
  for each row execute function public.registrar_evento_lead();

-- Carimba a data de fechamento quando o lead chega em Fechamento.
create or replace function public.marcar_fechamento_lead()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.etapa in ('fechamento', 'pos_venda') and new.fechado_em is null then
    new.fechado_em := now();
  end if;
  return new;
end;
$$;

create trigger trg_leads_fechado_em
  before insert or update on public.leads
  for each row execute function public.marcar_fechamento_lead();

-- =============================================================================
-- RLS: leads
-- =============================================================================
alter table public.leads enable row level security;

-- Corretor vê os seus + a fila aberta de Captação. Gestor vê tudo.
create policy "leads: corretor le os seus e a fila"
  on public.leads for select
  to authenticated
  using (
    public.is_gestor()
    or (
      public.is_equipe()
      and (corretor_id = (select auth.uid()) or corretor_id is null)
    )
  );

-- Criação manual ("Adicionar Lead"): qualquer membro ativo da equipe.
create policy "leads: equipe cria"
  on public.leads for insert
  to authenticated
  with check (
    public.is_equipe()
    and criado_por = (select auth.uid())
    and (corretor_id is null or corretor_id = (select auth.uid()) or public.is_gestor())
  );

-- Corretor move os seus e pode assumir um lead da fila aberta (self-assign).
-- O WITH CHECK impede que ele "empurre" um lead para outro corretor.
create policy "leads: corretor move os seus e assume da fila"
  on public.leads for update
  to authenticated
  using (
    public.is_equipe()
    and (corretor_id = (select auth.uid()) or corretor_id is null)
  )
  with check (corretor_id = (select auth.uid()));

create policy "leads: gestor gerencia todos"
  on public.leads for all
  to authenticated
  using      (public.is_gestor())
  with check (public.is_gestor());

-- =============================================================================
-- RLS: lead_eventos
-- =============================================================================
alter table public.lead_eventos enable row level security;

create policy "eventos: le os do lead visivel"
  on public.lead_eventos for select
  to authenticated
  using (
    exists (
      select 1 from public.leads l
      where l.id = lead_id
        and (
          public.is_gestor()
          or (public.is_equipe() and (l.corretor_id = (select auth.uid()) or l.corretor_id is null))
        )
    )
  );

-- Notas manuais; o histórico automático vem do trigger (SECURITY DEFINER).
create policy "eventos: equipe registra nota no lead visivel"
  on public.lead_eventos for insert
  to authenticated
  with check (
    usuario_id = (select auth.uid())
    and tipo = 'nota'
    and exists (
      select 1 from public.leads l
      where l.id = lead_id
        and (public.is_gestor() or l.corretor_id = (select auth.uid()))
    )
  );

-- =============================================================================
-- Busca global do CRM (nome ou telefone), respeitando a visibilidade do usuário.
-- STABLE + sem SECURITY DEFINER: roda sob o RLS de quem chama.
-- =============================================================================
create or replace function public.buscar_leads(termo text)
returns setof public.leads
language sql
stable
set search_path = ''
as $$
  select l.*
  from public.leads l
  where
    case
      when regexp_replace(coalesce(termo, ''), '[^0-9]', '', 'g') <> ''
        then l.telefone_digitos like '%' || regexp_replace(termo, '[^0-9]', '', 'g') || '%'
      else false
    end
    or public.sem_acento(l.nome) ilike '%' || public.sem_acento(coalesce(termo, '')) || '%'
  order by l.updated_at desc
  limit 30;
$$;

grant execute on function public.buscar_leads(text) to authenticated;
