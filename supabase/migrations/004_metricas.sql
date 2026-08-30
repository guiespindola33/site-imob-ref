-- =============================================================================
-- Vertiz — Migration 004: métricas do MVP (3 indicadores do escopo)
-- =============================================================================
-- Todas as views usam security_invoker = on: rodam sob o RLS de quem consulta.
-- Consequência desejada: o gestor vê os números da equipe inteira; o corretor vê
-- apenas o recorte dos leads dele. Não há caminho para vazar dados agregados.
-- =============================================================================

-- 1) Volume total de leads gerados (por mês e por semana)
create or replace view public.vw_leads_por_periodo
with (security_invoker = on) as
select
  date_trunc('month', l.created_at)::date as mes,
  date_trunc('week',  l.created_at)::date as semana,
  count(*)::int                           as total
from public.leads l
group by 1, 2;

-- 2) Taxa de conversão: fechados vs perdidos
create or replace view public.vw_conversao
with (security_invoker = on) as
select
  date_trunc('month', l.created_at)::date as mes,
  count(*) filter (where l.etapa in ('fechamento', 'pos_venda'))::int as fechados,
  count(*) filter (where l.etapa = 'perdido')::int                    as perdidos,
  count(*) filter (where l.etapa not in ('fechamento', 'pos_venda', 'perdido'))::int as em_andamento,
  count(*)::int as total,
  -- Denominador = decididos (fechados + perdidos). Leads ainda em andamento não
  -- entram na taxa: incluí-los faria a conversão parecer artificialmente baixa.
  round(
    100.0 * count(*) filter (where l.etapa in ('fechamento', 'pos_venda'))
    / nullif(count(*) filter (where l.etapa in ('fechamento', 'pos_venda', 'perdido')), 0),
    1
  ) as taxa_conversao_pct
from public.leads l
group by 1;

-- 3) Leads por corretor
create or replace view public.vw_leads_por_corretor
with (security_invoker = on) as
select
  l.corretor_id,
  p.nome as corretor_nome,
  count(*)::int                                                       as total,
  count(*) filter (where l.etapa in ('fechamento', 'pos_venda'))::int  as fechados,
  count(*) filter (where l.etapa = 'perdido')::int                     as perdidos,
  count(*) filter (where l.etapa not in ('fechamento', 'pos_venda', 'perdido'))::int as em_andamento
from public.leads l
left join public.profiles p on p.user_id = l.corretor_id
group by l.corretor_id, p.nome;

grant select on public.vw_leads_por_periodo   to authenticated;
grant select on public.vw_conversao           to authenticated;
grant select on public.vw_leads_por_corretor  to authenticated;
