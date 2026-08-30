import { createClient, supabaseConfigurado } from '@/lib/supabase/server'
import type { EtapaLead, Lead, LeadComRelacoes, LeadEvento } from '@/types'

/**
 * `corretor` NÃO é embutido na query.
 *
 * `leads.corretor_id` referencia `auth.users(id)`, não `public.profiles` — não
 * existe FK entre as duas tabelas, então o PostgREST não conseguiria resolver
 * um embed. O nome do corretor vem de uma segunda consulta a `profiles` e é
 * casado em memória.
 */
const CAMPOS_CARD = `
  id, nome, telefone, email, origem, etapa, corretor_id, created_at, updated_at,
  imovel_interesse_id, motivo_perda, observacoes,
  imovel:imoveis(id, nome_empreendimento, slug, bairro)
`

type LeadSemCorretor = Omit<LeadComRelacoes, 'corretor'>

/** Mapa user_id -> nome, para preencher o corretor dos leads carregados. */
async function mapaCorretores(
  supabase: ReturnType<typeof createClient>,
  ids: Array<string | null>
): Promise<Map<string, string>> {
  const unicos = [...new Set(ids.filter((id): id is string => Boolean(id)))]
  if (unicos.length === 0) return new Map()

  const { data } = await supabase.from('profiles').select('user_id, nome').in('user_id', unicos)
  return new Map((data ?? []).map((p) => [p.user_id, p.nome]))
}

/**
 * Leads do pipeline agrupados por etapa.
 *
 * O RLS decide o que aparece: corretor recebe os próprios leads mais a fila
 * aberta de Captação; gestor recebe tudo. A consulta é a mesma para os dois.
 */
export async function listarPipeline(): Promise<Record<EtapaLead, LeadComRelacoes[]>> {
  const vazio = {
    captacao: [],
    qualificacao: [],
    visita: [],
    proposta: [],
    documentacao: [],
    fechamento: [],
    pos_venda: [],
    perdido: [],
  } as Record<EtapaLead, LeadComRelacoes[]>

  if (!supabaseConfigurado()) return vazio

  const supabase = createClient()
  const { data, error } = await supabase
    .from('leads')
    .select(CAMPOS_CARD)
    .order('updated_at', { ascending: false })

  if (error) throw new Error(`Falha ao carregar o pipeline: ${error.message}`)

  const leads = (data ?? []) as unknown as LeadSemCorretor[]
  const corretores = await mapaCorretores(
    supabase,
    leads.map((l) => l.corretor_id)
  )

  const agrupado = { ...vazio }
  for (const lead of leads) {
    const nome = lead.corretor_id ? corretores.get(lead.corretor_id) : undefined
    agrupado[lead.etapa] = [
      ...agrupado[lead.etapa],
      { ...lead, corretor: nome ? { nome } : null },
    ]
  }
  return agrupado
}

export async function buscarLead(
  id: string
): Promise<{ lead: LeadComRelacoes; eventos: LeadEvento[] } | null> {
  if (!supabaseConfigurado()) return null

  const supabase = createClient()

  const [{ data: lead, error }, { data: eventos }] = await Promise.all([
    supabase.from('leads').select(CAMPOS_CARD).eq('id', id).maybeSingle(),
    supabase
      .from('lead_eventos')
      .select('*')
      .eq('lead_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (error) throw new Error(`Falha ao carregar o lead: ${error.message}`)
  if (!lead) return null

  const semCorretor = lead as unknown as LeadSemCorretor
  const corretores = await mapaCorretores(supabase, [semCorretor.corretor_id])
  const nome = semCorretor.corretor_id ? corretores.get(semCorretor.corretor_id) : undefined

  return {
    lead: { ...semCorretor, corretor: nome ? { nome } : null },
    eventos: (eventos ?? []) as LeadEvento[],
  }
}

export interface MetricasMvp {
  porPeriodo: Array<{ mes: string; semana: string; total: number }>
  conversao: Array<{
    mes: string
    fechados: number
    perdidos: number
    em_andamento: number
    total: number
    taxa_conversao_pct: number | null
  }>
  porCorretor: Array<{
    corretor_id: string | null
    corretor_nome: string | null
    total: number
    fechados: number
    perdidos: number
    em_andamento: number
  }>
}

/** Os três indicadores do MVP. Nada além disso — o escopo é explícito. */
export async function carregarMetricas(): Promise<MetricasMvp> {
  if (!supabaseConfigurado()) {
    return { porPeriodo: [], conversao: [], porCorretor: [] }
  }

  const supabase = createClient()

  const [periodo, conversao, corretor] = await Promise.all([
    supabase.from('vw_leads_por_periodo').select('*').order('semana', { ascending: false }).limit(12),
    supabase.from('vw_conversao').select('*').order('mes', { ascending: false }).limit(6),
    supabase.from('vw_leads_por_corretor').select('*').order('total', { ascending: false }),
  ])

  return {
    porPeriodo: periodo.data ?? [],
    conversao: conversao.data ?? [],
    porCorretor: corretor.data ?? [],
  }
}

/** Imóveis publicados, para o seletor de "imóvel de interesse" ao criar lead. */
export async function listarImoveisParaSelecao(): Promise<
  Array<{ id: string; rotulo: string }>
> {
  if (!supabaseConfigurado()) return []

  const supabase = createClient()
  const { data } = await supabase
    .from('imoveis')
    .select('id, nome_empreendimento, bairro')
    .order('nome_empreendimento')
    .limit(200)

  return (data ?? []).map((i) => ({
    id: i.id,
    rotulo: `${i.nome_empreendimento} — ${i.bairro}`,
  }))
}
