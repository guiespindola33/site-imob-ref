'use client'

import { useEffect, useState } from 'react'
import { formatMoeda } from '@/lib/utils/format'

interface Props {
  minAbsoluto: number
  maxAbsoluto: number
  valorMin?: number
  valorMax?: number
  onCommit: (min: number | undefined, max: number | undefined) => void
}

/** Formata valores grandes de forma compacta: R$ 1,6 mi / R$ 400 mil. */
function formatoCompacto(valor: number): string {
  if (valor >= 1_000_000) return `R$ ${(valor / 1_000_000).toFixed(valor % 1_000_000 === 0 ? 0 : 1)} mi`
  if (valor >= 1_000) return `R$ ${Math.round(valor / 1000)} mil`
  return formatMoeda(valor) ?? `R$ ${valor}`
}

/**
 * Slider de faixa de preço com dois cabos.
 *
 * Dois <input type="range"> sobrepostos — padrão leve para dual-range sem
 * biblioteca. Arrastar atualiza a posição visual a cada tick (estado local);
 * a navegação (URL/filtro real) só é confirmada ao soltar o cabo, para não
 * disparar uma busca a cada pixel arrastado.
 */
export function FaixaPreco({ minAbsoluto, maxAbsoluto, valorMin, valorMax, onCommit }: Props) {
  const [min, setMin] = useState(valorMin ?? minAbsoluto)
  const [max, setMax] = useState(valorMax ?? maxAbsoluto)

  // Sincroniza quando os filtros mudam por outra via (ex.: "Limpar tudo").
  useEffect(() => setMin(valorMin ?? minAbsoluto), [valorMin, minAbsoluto])
  useEffect(() => setMax(valorMax ?? maxAbsoluto), [valorMax, maxAbsoluto])

  if (maxAbsoluto <= minAbsoluto) return null

  const passo = Math.max(1, Math.round((maxAbsoluto - minAbsoluto) / 100))
  const pctMin = ((min - minAbsoluto) / (maxAbsoluto - minAbsoluto)) * 100
  const pctMax = ((max - minAbsoluto) / (maxAbsoluto - minAbsoluto)) * 100

  function commit(novoMin: number, novoMax: number) {
    onCommit(
      novoMin <= minAbsoluto ? undefined : novoMin,
      novoMax >= maxAbsoluto ? undefined : novoMax
    )
  }

  return (
    <div>
      <div className="relative h-3.5">
        <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-navy-200" />
        <div
          className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-accent-500"
          style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
        />
        <input
          type="range"
          aria-label="Valor mínimo"
          min={minAbsoluto}
          max={maxAbsoluto}
          step={passo}
          value={min}
          onChange={(e) => setMin(Math.min(Number(e.target.value), max))}
          onMouseUp={() => commit(min, max)}
          onTouchEnd={() => commit(min, max)}
          onKeyUp={() => commit(min, max)}
          className="range-thumb pointer-events-none absolute inset-x-0 top-1/2 h-3.5 w-full -translate-y-1/2 appearance-none bg-transparent"
          style={{ zIndex: pctMin > 90 ? 5 : 3 }}
        />
        <input
          type="range"
          aria-label="Valor máximo"
          min={minAbsoluto}
          max={maxAbsoluto}
          step={passo}
          value={max}
          onChange={(e) => setMax(Math.max(Number(e.target.value), min))}
          onMouseUp={() => commit(min, max)}
          onTouchEnd={() => commit(min, max)}
          onKeyUp={() => commit(min, max)}
          className="range-thumb pointer-events-none absolute inset-x-0 top-1/2 h-3.5 w-full -translate-y-1/2 appearance-none bg-transparent"
          style={{ zIndex: 4 }}
        />
      </div>
      <div className="tabular mt-2.5 flex justify-between text-[0.6875rem] text-navy-500">
        <span>{formatoCompacto(min)}</span>
        <span>{formatoCompacto(max)}</span>
      </div>
    </div>
  )
}
