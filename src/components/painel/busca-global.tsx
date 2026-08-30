'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ETAPA_LEAD_LABEL, type Lead } from '@/types'

/**
 * Busca global do CRM — por nome ou telefone.
 *
 * Chama a função `buscar_leads` no banco, que roda sob o RLS do usuário: o
 * corretor só encontra os próprios leads e os da fila aberta, mesmo digitando o
 * nome exato de um lead de outro corretor.
 */
export function BuscaGlobal() {
  const router = useRouter()
  const [termo, setTermo] = useState('')
  const [resultados, setResultados] = useState<Lead[] | null>(null)
  const [carregando, setCarregando] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const consulta = termo.trim()
    if (consulta.length < 2) {
      setResultados(null)
      return
    }

    // Debounce: evita uma consulta por tecla digitada.
    const timer = setTimeout(async () => {
      setCarregando(true)
      const { data } = await createClient().rpc('buscar_leads', { termo: consulta })
      setResultados((data as Lead[]) ?? [])
      setCarregando(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [termo])

  // Fecha o dropdown ao clicar fora.
  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setResultados(null)
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [])

  function abrir(id: string) {
    setResultados(null)
    setTermo('')
    router.push(`/crm/leads/${id}`)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <label htmlFor="busca-global" className="sr-only">
        Buscar lead por nome ou telefone
      </label>
      <Search
        size={17}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300"
        aria-hidden
      />
      <input
        id="busca-global"
        type="search"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && setResultados(null)}
        placeholder="Buscar lead por nome ou telefone"
        autoComplete="off"
        className="min-h-11 w-full rounded-pill border border-navy-200 bg-offwhite pl-10 pr-10 text-sm transition-colors focus:border-aqua-500 focus:bg-white"
      />
      {carregando && (
        <Loader2
          size={16}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-navy-300"
          aria-hidden
        />
      )}

      {resultados !== null && (
        <div
          role="listbox"
          aria-label="Resultados da busca"
          className="absolute left-0 right-0 top-full z-40 mt-2 max-h-80 overflow-y-auto rounded-card border border-navy-100 bg-white py-1.5 shadow-card-hover"
        >
          {resultados.length === 0 ? (
            <p className="px-4 py-3 text-sm text-navy-400">Nenhum lead encontrado.</p>
          ) : (
            resultados.map((lead) => (
              <button
                key={lead.id}
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => abrir(lead.id)}
                className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-navy-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-navy-800">
                    {lead.nome}
                  </span>
                  <span className="tabular block text-xs text-navy-400">{lead.telefone}</span>
                </span>
                <span className="shrink-0 rounded-pill bg-navy-50 px-2.5 py-1 text-[0.6875rem] font-medium text-navy-600">
                  {ETAPA_LEAD_LABEL[lead.etapa]}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
