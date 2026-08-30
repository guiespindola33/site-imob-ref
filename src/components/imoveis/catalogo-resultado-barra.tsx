'use client'

import { useAplicarFiltro } from '@/lib/imoveis/use-aplicar-filtro'
import type { FiltrosCatalogo } from '@/lib/imoveis/filtros'
import { temFiltroAtivo } from '@/lib/imoveis/filtros'

export function CatalogoResultadoBarra({
  filtros,
  total,
}: {
  filtros: FiltrosCatalogo
  total: number
}) {
  const { aplicar, limpar, pendente } = useAplicarFiltro()

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 border-t border-navy-100 pt-4 lg:border-t-0 lg:pt-0"
      aria-busy={pendente}
    >
      <p className="text-sm text-navy-500" role="status" aria-live="polite">
        <span className="tabular font-semibold text-navy-800">{total}</span>{' '}
        {total === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
        {temFiltroAtivo(filtros) && (
          <button
            type="button"
            onClick={limpar}
            className="ml-3 cursor-pointer text-accent-600 underline-offset-4 hover:underline"
          >
            limpar filtros
          </button>
        )}
      </p>

      <label className="flex items-center gap-1.5 text-sm text-navy-600">
        Ordenar:
        <select
          value={filtros.ordem}
          onChange={(e) => aplicar({ ordem: e.target.value as never })}
          className="cursor-pointer bg-transparent font-medium text-navy-800 underline decoration-navy-300 decoration-1 underline-offset-4 focus:outline-none"
        >
          <option value="recentes">recentes</option>
          <option value="menor_valor">menor valor</option>
          <option value="maior_valor">maior valor</option>
        </select>
      </label>
    </div>
  )
}
