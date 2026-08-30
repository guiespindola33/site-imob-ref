import { supabaseConfigurado } from '@/lib/supabase/server'
import { createPublicClient } from '@/lib/supabase/public'
import { POR_PAGINA, type FiltrosCatalogo } from '@/lib/imoveis/filtros'
import type { Faceta, Imovel, ImovelComFotos } from '@/types'
import { finalidadesPara } from '@/types'

/**
 * Este arquivo inteiro usa `createPublicClient()` (anônimo, sem cookies), não
 * o client de sessão de `lib/supabase/server.ts`. Toda leitura aqui já filtra
 * `publicado = true` explicitamente na query — não depende do RLS distinguir
 * visitante de equipe — então o resultado é idêntico com ou sem sessão. Usar
 * o client sem cookies mantém Home, catálogo e ficha do imóvel elegíveis para
 * ISR (`export const revalidate`); o client de sessão força a rota inteira a
 * renderizar dinamicamente a cada request, mesmo sem nenhum dado por usuário.
 */
const BUCKET = 'imoveis'

const CAMPOS_CARD = `
  id, slug, nome_empreendimento, tipo_imovel, finalidade, bairro, cidade,
  area_m2, quartos, suites, vagas, valor_venda, valor_aluguel,
  valor_condominio, status, destaque, created_at
`

type FotoBruta = { id: string; storage_path: string; ordem: number; legenda: string | null; capa: boolean }

/** storage_path -> URL pública do bucket (o bucket é público para leitura). */
export function urlFoto(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return `${base}/storage/v1/object/public/${BUCKET}/${storagePath}`
}

function comFotos<T extends Imovel>(
  imovel: T & { imovel_fotos?: FotoBruta[] | null }
): ImovelComFotos {
  const { imovel_fotos, ...resto } = imovel
  const fotos = (imovel_fotos ?? [])
    .slice()
    .sort((a, b) => Number(b.capa) - Number(a.capa) || a.ordem - b.ordem)
    .map((f) => ({
      id: f.id,
      ordem: f.ordem,
      legenda: f.legenda,
      capa: f.capa,
      url: urlFoto(f.storage_path),
    }))

  return { ...(resto as unknown as Imovel), fotos }
}

/**
 * Vitrine da home. Traz destaques e completa com os mais recentes quando ainda
 * não há destaques marcados — a home nunca fica vazia por falta de curadoria.
 */
export async function listarDestaques(limite = 6): Promise<ImovelComFotos[]> {
  if (!supabaseConfigurado()) return []
  const supabase = createPublicClient()

  const { data, error } = await supabase
    .from('imoveis')
    .select(`${CAMPOS_CARD}, imovel_fotos(id, storage_path, ordem, legenda, capa)`)
    .eq('publicado', true)
    .in('status', ['disponivel', 'reservado'])
    .order('destaque', { ascending: false })
    .order('publicado_em', { ascending: false, nullsFirst: false })
    .limit(limite)

  if (error) throw new Error(`Falha ao carregar destaques: ${error.message}`)
  return (data ?? []).map((i) => comFotos(i as never))
}

export interface ResultadoCatalogo {
  imoveis: ImovelComFotos[]
  total: number
  pagina: number
  totalPaginas: number
}

export async function listarCatalogo(filtros: FiltrosCatalogo): Promise<ResultadoCatalogo> {
  if (!supabaseConfigurado()) {
    return { imoveis: [], total: 0, pagina: 1, totalPaginas: 1 }
  }
  const supabase = createPublicClient()

  let query = supabase
    .from('imoveis')
    .select(`${CAMPOS_CARD}, imovel_fotos(id, storage_path, ordem, legenda, capa)`, {
      count: 'exact',
    })
    .eq('publicado', true)
    .in('status', ['disponivel', 'reservado'])

  if (filtros.finalidade) {
    query = query.in('finalidade', finalidadesPara(filtros.finalidade))
  }
  if (filtros.tipo) query = query.eq('tipo_imovel', filtros.tipo)
  if (filtros.bairro) query = query.eq('bairro', filtros.bairro)
  if (filtros.quartos) query = query.gte('quartos', filtros.quartos)

  // A coluna de preço depende da finalidade consultada.
  const colunaValor = filtros.finalidade === 'locacao' ? 'valor_aluguel' : 'valor_venda'
  if (filtros.valor_min) query = query.gte(colunaValor, filtros.valor_min)
  if (filtros.valor_max) query = query.lte(colunaValor, filtros.valor_max)

  if (filtros.ordem === 'menor_valor') {
    query = query.order(colunaValor, { ascending: true, nullsFirst: false })
  } else if (filtros.ordem === 'maior_valor') {
    query = query.order(colunaValor, { ascending: false, nullsFirst: false })
  } else {
    query = query.order('publicado_em', { ascending: false, nullsFirst: false })
  }

  const de = (filtros.pagina - 1) * POR_PAGINA
  query = query.range(de, de + POR_PAGINA - 1)

  const { data, error, count } = await query
  if (error) throw new Error(`Falha ao carregar catálogo: ${error.message}`)

  const total = count ?? 0
  return {
    imoveis: (data ?? []).map((i) => comFotos(i as never)),
    total,
    pagina: filtros.pagina,
    totalPaginas: Math.max(1, Math.ceil(total / POR_PAGINA)),
  }
}

export async function buscarImovelPorSlug(slug: string): Promise<ImovelComFotos | null> {
  if (!supabaseConfigurado()) return null
  const supabase = createPublicClient()

  const { data, error } = await supabase
    .from('imoveis')
    .select('*, imovel_fotos(id, storage_path, ordem, legenda, capa)')
    .eq('slug', slug)
    .eq('publicado', true)
    .maybeSingle()

  if (error) throw new Error(`Falha ao carregar imóvel: ${error.message}`)
  if (!data) return null
  return comFotos(data as never)
}

/** Slugs publicados — alimenta generateStaticParams e o sitemap. */
export async function listarSlugsPublicados(): Promise<
  Array<Pick<Imovel, 'slug' | 'finalidade' | 'updated_at'>>
> {
  if (!supabaseConfigurado()) return []
  // Client sem cookies: esta função roda em generateStaticParams e no
  // sitemap, fora de um request — createClient() (cookie-based) derrubaria
  // o build com "cookies was called outside a request scope".
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('imoveis')
    .select('slug, finalidade, updated_at')
    .eq('publicado', true)

  if (error) throw new Error(`Falha ao listar slugs: ${error.message}`)
  return data ?? []
}

/**
 * Facetas dos filtros: apenas bairros/tipos COM estoque ativo.
 * É o que impede o usuário de escolher um filtro que retorna zero resultados.
 */
export async function carregarFacetas(finalidade?: 'venda' | 'locacao'): Promise<Faceta[]> {
  if (!supabaseConfigurado()) return []
  const supabase = createPublicClient()

  let query = supabase.from('catalogo_facetas').select('*')
  if (finalidade) query = query.in('finalidade', finalidadesPara(finalidade))

  const { data, error } = await query
  if (error) throw new Error(`Falha ao carregar filtros: ${error.message}`)
  return data ?? []
}

export interface OpcoesFiltro {
  bairros: Array<{ valor: string; total: number }>
  tipos: Array<{ valor: string; total: number }>
  quartosMax: number
  valorMin: number | null
  valorMax: number | null
}

/** Agrega as facetas no formato consumido pelos selects do catálogo. */
export function agregarOpcoes(facetas: Faceta[]): OpcoesFiltro {
  const bairros = new Map<string, number>()
  const tipos = new Map<string, number>()
  let quartosMax = 0
  let valorMin: number | null = null
  let valorMax: number | null = null

  for (const f of facetas) {
    bairros.set(f.bairro, (bairros.get(f.bairro) ?? 0) + f.total)
    tipos.set(f.tipo_imovel, (tipos.get(f.tipo_imovel) ?? 0) + f.total)
    quartosMax = Math.max(quartosMax, f.quartos_max)
    if (f.valor_min !== null) valorMin = valorMin === null ? f.valor_min : Math.min(valorMin, f.valor_min)
    if (f.valor_max !== null) valorMax = valorMax === null ? f.valor_max : Math.max(valorMax, f.valor_max)
  }

  const ordenar = (mapa: Map<string, number>) =>
    [...mapa.entries()]
      .map(([valor, total]) => ({ valor, total }))
      .sort((a, b) => b.total - a.total || a.valor.localeCompare(b.valor, 'pt-BR'))

  return { bairros: ordenar(bairros), tipos: ordenar(tipos), quartosMax, valorMin, valorMax }
}
