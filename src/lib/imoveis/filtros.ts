import { z } from 'zod'
import type { FinalidadeSlug, TipoImovel } from '@/types'

/**
 * Filtros do catálogo, validados com Zod.
 *
 * Os valores vêm da query string (input não confiável) e viram cláusulas de
 * banco — validar aqui é o que impede um `tipo=<qualquer coisa>` de chegar ao
 * Postgres e derrubar a página com erro de enum inválido.
 */

const TIPOS = [
  'apartamento',
  'casa',
  'cobertura',
  'flat',
  'sala_comercial',
  'loja',
  'galpao',
  'terreno',
  'outro',
] as const satisfies readonly TipoImovel[]

const numeroOpcional = z.coerce.number().int().positive().optional().catch(undefined)

export const filtrosSchema = z.object({
  finalidade: z.enum(['venda', 'locacao']).optional().catch(undefined),
  tipo: z.enum(TIPOS).optional().catch(undefined),
  bairro: z.string().trim().min(1).max(100).optional().catch(undefined),
  quartos: numeroOpcional,
  valor_min: z.coerce.number().nonnegative().optional().catch(undefined),
  valor_max: z.coerce.number().positive().optional().catch(undefined),
  ordem: z.enum(['recentes', 'menor_valor', 'maior_valor']).default('recentes').catch('recentes'),
  pagina: z.coerce.number().int().min(1).max(200).default(1).catch(1),
})

export type FiltrosCatalogo = z.infer<typeof filtrosSchema>

export const POR_PAGINA = 12

type ParamsEntrada = Record<string, string | string[] | undefined>

export function parseFiltros(
  searchParams: ParamsEntrada,
  finalidadePadrao?: FinalidadeSlug
): FiltrosCatalogo {
  const primeiro = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

  const bruto = {
    finalidade: primeiro(searchParams.finalidade) ?? finalidadePadrao,
    tipo: primeiro(searchParams.tipo),
    bairro: primeiro(searchParams.bairro),
    quartos: primeiro(searchParams.quartos),
    valor_min: primeiro(searchParams.valor_min),
    valor_max: primeiro(searchParams.valor_max),
    ordem: primeiro(searchParams.ordem),
    pagina: primeiro(searchParams.pagina),
  }

  const parsed = filtrosSchema.parse(bruto)

  // Faixa invertida (min > max) é erro de digitação, não motivo para lista vazia.
  if (parsed.valor_min && parsed.valor_max && parsed.valor_min > parsed.valor_max) {
    return { ...parsed, valor_min: parsed.valor_max, valor_max: parsed.valor_min }
  }
  return parsed
}

/** Serializa filtros de volta para query string, omitindo o que é padrão. */
export function filtrosParaQuery(filtros: Partial<FiltrosCatalogo>): string {
  const params = new URLSearchParams()
  for (const [chave, valor] of Object.entries(filtros)) {
    if (valor === undefined || valor === null || valor === '') continue
    if (chave === 'ordem' && valor === 'recentes') continue
    if (chave === 'pagina' && valor === 1) continue
    params.set(chave, String(valor))
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function temFiltroAtivo(filtros: FiltrosCatalogo): boolean {
  return Boolean(
    filtros.tipo || filtros.bairro || filtros.quartos || filtros.valor_min || filtros.valor_max
  )
}
