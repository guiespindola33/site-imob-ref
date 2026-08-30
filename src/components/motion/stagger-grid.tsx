'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/utils/cn'

gsap.registerPlugin(useGSAP, ScrollTrigger)

interface StaggerGridProps {
  children: React.ReactNode
  className?: string
  /**
   * Muda quando os filtros mudam. Ao trocar, os cards reentram em stagger —
   * é a transição de filtro do catálogo.
   */
  chave?: string
}

/**
 * Grid cujos filhos diretos entram em cascata.
 *
 * Usa ScrollTrigger.batch: um único trigger observa todos os cards e agrupa os
 * que entram juntos, em vez de criar um ScrollTrigger por card — diferença que
 * aparece quando o catálogo cresce para dezenas de itens.
 */
export function StaggerGrid({ children, className, chave }: StaggerGridProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const itens = gsap.utils.toArray<HTMLElement>(ref.current?.children ?? [])
        if (!itens.length) return

        gsap.set(itens, { opacity: 0, y: 16, scale: 0.97 })

        ScrollTrigger.batch(itens, {
          start: 'top 92%',
          once: true,
          onEnter: (lote) =>
            gsap.to(lote, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.42,
              ease: 'back.out(1.4)',
              stagger: { each: 0.06, from: 'start' },
              clearProps: 'transform',
            }),
        })
      })

      return () => mm.revert()
    },
    { scope: ref, dependencies: [chave], revertOnUpdate: true }
  )

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  )
}
