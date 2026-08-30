'use client'

import { useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { filtrosParaQuery, type FiltrosCatalogo } from '@/lib/imoveis/filtros'

/**
 * Aplica uma mudança de filtro navegando para a nova URL do catálogo.
 *
 * Centralizado aqui porque os controles de filtro estão espalhados em vários
 * componentes (chips mobile, sidebar desktop, folha de filtros, ordenação) que
 * precisam do mesmo comportamento: mesclar com o que já está na URL, resetar a
 * paginação e navegar sem rolar a página para o topo.
 */
export function useAplicarFiltro() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pendente, startTransition] = useTransition()

  function aplicar(mudanca: Partial<FiltrosCatalogo>) {
    const atual = Object.fromEntries(searchParams.entries())
    const proximo: Record<string, unknown> = { ...atual, ...mudanca, pagina: 1 }

    for (const [k, v] of Object.entries(mudanca)) {
      if (v === undefined || v === '') delete proximo[k]
    }

    startTransition(() => {
      router.push(`/imoveis${filtrosParaQuery(proximo as FiltrosCatalogo)}`, { scroll: false })
    })
  }

  function limpar() {
    startTransition(() => router.push('/imoveis', { scroll: false }))
  }

  /** Alterna um valor: se já está ativo, remove; senão, define. */
  function alternar(chave: keyof FiltrosCatalogo, valor: string | number) {
    const atual = searchParams.get(chave)
    aplicar({ [chave]: String(atual) === String(valor) ? undefined : valor } as Partial<FiltrosCatalogo>)
  }

  return { aplicar, limpar, alternar, pendente }
}
