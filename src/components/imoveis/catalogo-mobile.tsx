'use client'

import { useState } from 'react'
import { MessageCircle, SlidersHorizontal, X } from 'lucide-react'
import { FiltroChip } from './filtro-chip'
import { CatalogoCamposFiltro } from './catalogo-campos-filtro'
import { CatalogoResultadoBarra } from './catalogo-resultado-barra'
import { useAplicarFiltro } from '@/lib/imoveis/use-aplicar-filtro'
import { linkWhatsApp } from '@/lib/vertiz'
import type { FiltrosCatalogo } from '@/lib/imoveis/filtros'
import type { OpcoesFiltro } from '@/services/imoveis'

interface Props {
  filtros: FiltrosCatalogo
  opcoes: OpcoesFiltro
  total: number
  mensagemWhatsapp: string
}

/**
 * Controles do catálogo no mobile: linha de chips rápidos + barra fixa no
 * rodapé com "Filtrar" (abre a folha com todos os campos) e WhatsApp.
 *
 * A barra fica fixa porque quase todo o tráfego vem do Instagram/Linktree —
 * ver a mesma decisão na ficha do imóvel (`CtaConsultar`).
 */
export function CatalogoMobile({ filtros, opcoes, total, mensagemWhatsapp }: Props) {
  const { alternar } = useAplicarFiltro()
  const [folhaAberta, setFolhaAberta] = useState(false)

  const topBairros = opcoes.bairros.slice(0, 2)
  const ativosNaFolha =
    Boolean(filtros.tipo) || Boolean(filtros.valor_min) || Boolean(filtros.valor_max)

  return (
    <div className="lg:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <FiltroChip ativo={filtros.finalidade === 'venda'} onClick={() => alternar('finalidade', 'venda')}>
          Venda
        </FiltroChip>
        <FiltroChip ativo={filtros.finalidade === 'locacao'} onClick={() => alternar('finalidade', 'locacao')}>
          Locação
        </FiltroChip>
        {topBairros.map((b) => (
          <FiltroChip key={b.valor} ativo={filtros.bairro === b.valor} onClick={() => alternar('bairro', b.valor)}>
            {b.valor}
          </FiltroChip>
        ))}
        {opcoes.quartosMax >= 3 && (
          <FiltroChip ativo={filtros.quartos === 3} onClick={() => alternar('quartos', 3)}>
            3+ quartos
          </FiltroChip>
        )}
      </div>

      <div className="mt-4">
        <CatalogoResultadoBarra filtros={filtros} total={total} />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 bg-offwhite/95 backdrop-blur-md shadow-sticky safe-bottom">
        <div className="container-app flex gap-2.5 py-3">
          <button
            type="button"
            onClick={() => setFolhaAberta(true)}
            className="relative flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-navy-300 text-sm font-medium text-navy-800"
          >
            <SlidersHorizontal size={16} aria-hidden />
            Filtrar
            {ativosNaFolha && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent-500" aria-hidden />
            )}
          </button>

          <a
            href={linkWhatsApp(mensagemWhatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex min-h-12 flex-[1.6] animate-[vzPulse_3.4s_ease-out_infinite] items-center justify-center gap-2 overflow-hidden rounded-xl bg-whatsapp text-sm font-medium text-whatsapp-ink"
          >
            <MessageCircle size={17} aria-hidden />
            Falar no WhatsApp
          </a>
        </div>
      </div>

      {folhaAberta && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Filtros">
          <div
            className="absolute inset-0 bg-navy-950/50"
            onClick={() => setFolhaAberta(false)}
          />
          <div className="safe-bottom absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[1.75rem] bg-offwhite p-5 shadow-2xl">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-navy-200" />
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-navy-800">Filtros</h2>
              <button
                type="button"
                onClick={() => setFolhaAberta(false)}
                aria-label="Fechar filtros"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-navy-500 hover:bg-navy-100"
              >
                <X size={18} aria-hidden />
              </button>
            </div>

            <div className="mt-5">
              <CatalogoCamposFiltro filtros={filtros} opcoes={opcoes} />
            </div>

            <button
              type="button"
              onClick={() => setFolhaAberta(false)}
              className="mt-6 flex min-h-12 w-full cursor-pointer items-center justify-center rounded-pill bg-navy-800 text-sm font-medium text-white"
            >
              Ver resultados
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
