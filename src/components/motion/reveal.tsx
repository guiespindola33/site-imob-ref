'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/utils/cn'

gsap.registerPlugin(useGSAP, ScrollTrigger)

type Direcao = 'baixo' | 'cima' | 'esquerda' | 'direita' | 'fade'

const DESLOCAMENTO: Record<Direcao, { x?: number; y?: number }> = {
  baixo: { y: 24 },
  cima: { y: -24 },
  esquerda: { x: -24 },
  direita: { x: 24 },
  fade: {},
}

interface RevealProps {
  children: React.ReactNode
  className?: string
  direcao?: Direcao
  delay?: number
  /** Renderiza como outro elemento (ex.: 'section', 'li'). */
  as?: 'div' | 'section' | 'article' | 'li' | 'header'
}

/**
 * Revela um bloco quando ele entra na viewport.
 *
 * Só anima opacidade e transform (compositor da GPU) — nunca width/height, que
 * forçariam reflow a cada frame. Sob prefers-reduced-motion o matchMedia não
 * registra nada e o CSS já mantém o elemento visível.
 */
export function Reveal({
  children,
  className,
  direcao = 'baixo',
  delay = 0,
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.to(ref.current, {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.6,
          delay,
          ease: 'power2.out',
          startAt: { opacity: 0, ...DESLOCAMENTO[direcao] },
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 88%',
            once: true,
          },
        })
      })

      return () => mm.revert()
    },
    { scope: ref, dependencies: [direcao, delay] }
  )

  return (
    <Tag ref={ref as never} data-reveal className={cn(className)}>
      {children}
    </Tag>
  )
}
