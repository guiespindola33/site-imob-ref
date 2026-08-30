'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { alternarPublicacao } from '@/app/(painel)/cms/actions'
import { cn } from '@/lib/utils/cn'

/**
 * Botão liga/desliga de publicação.
 *
 * Switch acessível de verdade: role="switch" + aria-checked, alvo de toque de
 * 44px e rótulo textual ao lado — não é só a cor que informa o estado.
 */
export function TogglePublicado({
  id,
  publicado,
  nome,
}: {
  id: string
  publicado: boolean
  nome: string
}) {
  const router = useRouter()
  const [ligado, setLigado] = useState(publicado)
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, startTransition] = useTransition()

  function alternar() {
    const proximo = !ligado
    setLigado(proximo) // otimista
    setErro(null)

    startTransition(async () => {
      const r = await alternarPublicacao(id, proximo)
      if (!r.ok) {
        setLigado(!proximo)
        setErro(r.erro ?? 'Não foi possível alterar a publicação.')
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          role="switch"
          aria-checked={ligado}
          aria-label={`${ligado ? 'Despublicar' : 'Publicar'} ${nome}`}
          onClick={alternar}
          disabled={pendente}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full',
            'transition-colors duration-200 ease-soft disabled:opacity-60',
            // Área de toque de 44px sem inflar o desenho do switch
            'before:absolute before:-inset-2.5 before:content-[""]',
            ligado ? 'bg-aqua-500' : 'bg-navy-200'
          )}
        >
          <span
            className={cn(
              'inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-soft',
              ligado ? 'translate-x-[1.375rem]' : 'translate-x-0.5'
            )}
          />
        </button>
        <span className={cn('text-sm', ligado ? 'text-aqua-700' : 'text-navy-400')}>
          {ligado ? 'Publicado' : 'Pausado'}
        </span>
      </div>

      {erro && (
        <p role="alert" className="max-w-xs text-xs text-red-600">
          {erro}
        </p>
      )}
    </div>
  )
}
