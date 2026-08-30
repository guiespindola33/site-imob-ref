import type {
  Database,
  EtapaLead,
  FinalidadeImovel,
  OrigemLead,
  StatusImovel,
  TipoImovel,
} from './database.types'

export type * from './database.types'

export type Imovel = Database['public']['Tables']['imoveis']['Row']
export type ImovelFoto = Database['public']['Tables']['imovel_fotos']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type LeadEvento = Database['public']['Tables']['lead_eventos']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Faceta = Database['public']['Views']['catalogo_facetas']['Row']

/** Imóvel com as fotos já resolvidas em URL pública — o que a UI consome. */
export interface ImovelComFotos extends Imovel {
  fotos: Array<Pick<ImovelFoto, 'id' | 'ordem' | 'legenda' | 'capa'> & { url: string }>
}

export interface LeadComRelacoes extends Lead {
  corretor: Pick<Profile, 'nome'> | null
  imovel: Pick<Imovel, 'id' | 'nome_empreendimento' | 'slug' | 'bairro'> | null
}

// -----------------------------------------------------------------------------
// Rótulos em português — fonte única para UI, <title> e slug de URL
// -----------------------------------------------------------------------------

export const TIPO_IMOVEL_LABEL: Record<TipoImovel, string> = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  cobertura: 'Cobertura',
  flat: 'Flat',
  sala_comercial: 'Sala comercial',
  loja: 'Loja',
  galpao: 'Galpão',
  terreno: 'Terreno',
  outro: 'Outro',
}

/** Plural — usado em títulos ("Apartamentos em Boa Viagem"), não em badges. */
export const TIPO_IMOVEL_LABEL_PLURAL: Record<TipoImovel, string> = {
  apartamento: 'Apartamentos',
  casa: 'Casas',
  cobertura: 'Coberturas',
  flat: 'Flats',
  sala_comercial: 'Salas comerciais',
  loja: 'Lojas',
  galpao: 'Galpões',
  terreno: 'Terrenos',
  outro: 'Imóveis',
}

export const FINALIDADE_LABEL: Record<FinalidadeImovel, string> = {
  venda: 'Venda',
  locacao: 'Locação',
  venda_locacao: 'Venda e locação',
}

export const STATUS_IMOVEL_LABEL: Record<StatusImovel, string> = {
  disponivel: 'Disponível',
  reservado: 'Reservado',
  vendido: 'Vendido',
  alugado: 'Alugado',
}

export const ORIGEM_LEAD_LABEL: Record<OrigemLead, string> = {
  site: 'Site',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  indicacao: 'Indicação',
  ligacao: 'Ligação',
  outro: 'Outro',
}

/** Ordem do pipeline Kanban. 'perdido' fica fora do fluxo (coluna lateral). */
export const ETAPAS_PIPELINE = [
  'captacao',
  'qualificacao',
  'visita',
  'proposta',
  'documentacao',
  'fechamento',
  'pos_venda',
] as const satisfies readonly EtapaLead[]

export const ETAPA_LEAD_LABEL: Record<EtapaLead, string> = {
  captacao: 'Captação',
  qualificacao: 'Qualificação',
  visita: 'Visita',
  proposta: 'Proposta',
  documentacao: 'Documentação',
  fechamento: 'Fechamento',
  pos_venda: 'Pós-venda',
  perdido: 'Perdido',
}

/** Segmento de URL público por finalidade: /imoveis/venda/... */
export const FINALIDADE_SLUG = {
  venda: 'venda',
  locacao: 'locacao',
} as const

export type FinalidadeSlug = (typeof FINALIDADE_SLUG)[keyof typeof FINALIDADE_SLUG]

export function isFinalidadeSlug(valor: string): valor is FinalidadeSlug {
  return valor === 'venda' || valor === 'locacao'
}

/** Finalidades do banco que atendem um segmento de URL. */
export function finalidadesPara(slug: FinalidadeSlug): FinalidadeImovel[] {
  return slug === 'venda' ? ['venda', 'venda_locacao'] : ['locacao', 'venda_locacao']
}

/** Segmento canônico de um imóvel — 'venda_locacao' resolve para /venda. */
export function slugFinalidade(finalidade: FinalidadeImovel): FinalidadeSlug {
  return finalidade === 'locacao' ? 'locacao' : 'venda'
}
