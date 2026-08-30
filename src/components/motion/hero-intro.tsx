'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

/**
 * Entrada do hero: os elementos marcados com `data-hero` sobem em cascata.
 *
 * Roda no load (sem ScrollTrigger) porque o hero já está na viewport — esperar
 * um trigger só atrasaria a primeira impressão.
 */
export function HeroIntro({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-hero]', {
          opacity: 0,
          y: 18,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.08,
          clearProps: 'all',
        })
      })

      return () => mm.revert()
    },
    { scope: ref }
  )

  return <div ref={ref}>{children}</div>
}
