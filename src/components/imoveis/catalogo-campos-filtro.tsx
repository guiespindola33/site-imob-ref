'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { FiltroChip } from './filtro-chip'
import { FaixaPreco } from './faixa-preco'
import { useAplicarFiltro } from '@/lib/imoveis/use-aplicar-filtro'
import { type FiltrosCatalogo } from '@/lib/imoveis/filtros'
import type { OpcoesFiltro } from '@/services/imoveis'
import { TIPO_IMOVEL_LABEL, type TipoImovel } from '@/types'

const ROTULO_MONO = 'kicker text-[0.625rem] text-navy-400'

/**
 * Conjunto completo de campos do catálogo — usado dentro da sidebar desktop
 * e da folha de filtros mobile. Um único lugar de verdade para não duplicar
 * a lógica de aplicar/limpar em dois componentes visuais diferentes.
 */
export function CatalogoCamposFiltro({
  filtros,
  opcoes,
}: {
  filtros: FiltrosCatalogo
  opcoes: OpcoesFiltro
}) {
  const { aplicar, alternar } = useAplicarFiltro()
  const [buscaBairro, setBuscaBairro] = useState('')

  const bairrosFiltrados = buscaBairro.trim()
    ? opcoes.bairros.filter((b) => b.valor.toLowerCase().includes(buscaBairro.trim().toLowerCase()))
    : opcoes.bairros

  return (
    <div className="space-y-6">
      {/* Busca por bairro — filtra a lista de bairros abaixo em tempo real. */}
      <div>
        <div className="flex items-center gap-2 rounded-xl border border-navy-200 bg-white px-3.5 py-2.5">
          <Search size={15} className="shrink-0 text-navy-400" aria-hidden />
          <input
            type="search"
            value={buscaBairro}
            onChange={(e) => setBuscaBairro(e.target.value)}
            placeholder="Buscar bairro (Boa Viagem, Setúbal...)"
            className="w-full bg-transparent text-sm text-navy-800 placeholder:text-navy-400 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <p className={ROTULO_MONO}>Finalidade</p>
        <div className="mt-2.5 flex gap-2">
          <FiltroChip
            ativo={filtros.finalidade === 'venda'}
            onClick={() => alternar('finalidade', 'venda')}
            className="flex-1"
          >
            Venda
          </FiltroChip>
          <FiltroChip
            ativo={filtros.finalidade === 'locacao'}
            onClick={() => alternar('finalidade', 'locacao')}
            className="flex-1"
          >
            Locação
          </FiltroChip>
        </div>
      </div>

      <div>
        <p className={ROTULO_MONO}>Bairro</p>
        <div className="mt-2.5 flex flex-col">
          {bairrosFiltrados.length === 0 && (
            <p className="py-2 text-sm text-navy-400">Nenhum bairro encontrado.</p>
          )}
          {bairrosFiltrados.map((b) => (
            <button
              key={b.valor}
              type="button"
              onClick={() => alternar('bairro', b.valor)}
              className={`flex min-h-10 cursor-pointer items-center justify-between border-b border-navy-50 text-left text-sm transition-colors ${
                filtros.bairro === b.valor ? 'font-medium text-accent-600' : 'text-navy-700 hover:text-navy-900'
              }`}
            >
              <span>{b.valor}</span>
              <span className="tabular font-mono text-xs text-navy-400">{b.total}</span>
            </button>
          ))}
        </div>
      </div>

      {opcoes.valorMin !== null && opcoes.valorMax !== null && opcoes.valorMin < opcoes.valorMax && (
        <div>
          <p className={ROTULO_MONO}>Faixa de preço</p>
          <div className="mt-3">
            <FaixaPreco
              minAbsoluto={Math.floor(opcoes.valorMin / 1000) * 1000}
              maxAbsoluto={Math.ceil(opcoes.valorMax / 1000) * 1000}
              valorMin={filtros.valor_min}
              valorMax={filtros.valor_max}
              onCommit={(min, max) => aplicar({ valor_min: min, valor_max: max })}
            />
          </div>
        </div>
      )}

      {opcoes.quartosMax > 0 && (
        <div>
          <p className={ROTULO_MONO}>Quartos</p>
          <div className="mt-2.5 flex gap-2">
            {Array.from({ length: Math.min(opcoes.quartosMax, 3) }, (_, i) => i + 1).map((n) => (
              <FiltroChip
                key={n}
                ativo={filtros.quartos === n}
                onClick={() => alternar('quartos', n)}
                className="w-11"
              >
                {n === 3 ? '3+' : n}
              </FiltroChip>
            ))}
          </div>
        </div>
      )}

      {opcoes.tipos.length > 0 && (
        <div>
          <p className={ROTULO_MONO}>Tipo</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {opcoes.tipos.map((t) => (
              <FiltroChip
                key={t.valor}
                ativo={filtros.tipo === t.valor}
                onClick={() => alternar('tipo', t.valor)}
              >
                {TIPO_IMOVEL_LABEL[t.valor as TipoImovel]}
              </FiltroChip>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
