'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

/**
 * Assinatura visual da home: o perfil de torres da orla de Boa Viagem/Setúbal,
 * em traço técnico (mesma linguagem "prancheta" dos kickers em DM Mono do
 * resto do site) — não é um "hero" genérico com blobs de gradiente, é
 * literalmente a paisagem que a Vertiz vende.
 *
 * Cada prédio é um <rect> próprio para o traço poder "desenhar" em stagger
 * da esquerda pra direita no load (skyline "erguendo" prédio a prédio), em
 * vez de mascarar tudo atrás de um dashoffset único de um path complexo.
 */

interface Predio {
  x: number
  largura: number
  altura: number
  /** Segundo bloco (recuo de cobertura), comum nas torres da orla. */
  coberturaLargura?: number
  coberturaAltura?: number
  antena?: boolean
}

const SKYLINE: Predio[] = [
  { x: 0, largura: 46, altura: 88 },
  { x: 52, largura: 34, altura: 130, coberturaLargura: 20, coberturaAltura: 22 },
  { x: 92, largura: 40, altura: 104 },
  { x: 138, largura: 28, altura: 150, antena: true },
  { x: 172, largura: 50, altura: 96, coberturaLargura: 30, coberturaAltura: 18 },
  { x: 228, largura: 32, altura: 122 },
  { x: 266, largura: 44, altura: 160, coberturaLargura: 26, coberturaAltura: 24 },
  { x: 316, largura: 30, altura: 100 },
  { x: 352, largura: 52, altura: 138, antena: true },
  { x: 410, largura: 36, altura: 92 },
  { x: 452, largura: 42, altura: 168, coberturaLargura: 24, coberturaAltura: 26 },
  { x: 500, largura: 30, altura: 112 },
  { x: 536, largura: 48, altura: 96 },
  { x: 590, largura: 34, altura: 144, coberturaLargura: 20, coberturaAltura: 20 },
  { x: 630, largura: 40, altura: 108 },
  { x: 676, largura: 28, altura: 128, antena: true },
  { x: 710, largura: 50, altura: 90 },
  { x: 766, largura: 36, altura: 154, coberturaLargura: 22, coberturaAltura: 22 },
]

const LARGURA_TOTAL = 820
const ALTURA_BASE = 180

function perimetro(largura: number, altura: number) {
  return 2 * (largura + altura)
}

export function SkylineHorizonte({ className }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const formas = gsap.utils.toArray<SVGRectElement | SVGLineElement>(
          svgRef.current?.querySelectorAll('[data-traco]') ?? []
        )

        formas.forEach((forma) => {
          const comprimento =
            forma instanceof SVGLineElement
              ? forma.getTotalLength()
              : perimetro(Number(forma.getAttribute('width')), Number(forma.getAttribute('height')))
          gsap.set(forma, { strokeDasharray: comprimento, strokeDashoffset: comprimento })
        })

        gsap.to(formas, {
          strokeDashoffset: 0,
          duration: 1.1,
          ease: 'power2.inOut',
          delay: 0.3,
          stagger: { each: 0.045, from: 'start' },
        })
      })

      return () => mm.revert()
    },
    { scope: svgRef }
  )

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${LARGURA_TOTAL} ${ALTURA_BASE + 20}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden
      fill="none"
    >
      {/* Linha do horizonte — chão onde as torres se apoiam */}
      <line
        data-traco
        x1={0}
        y1={ALTURA_BASE}
        x2={LARGURA_TOTAL}
        y2={ALTURA_BASE}
        stroke="currentColor"
        strokeWidth={1}
        className="text-accent-500/35"
      />

      {SKYLINE.map((p, i) => {
        const y = ALTURA_BASE - p.altura
        return (
          <g key={i}>
            <rect
              data-traco
              x={p.x}
              y={y}
              width={p.largura}
              height={p.altura}
              stroke="currentColor"
              strokeWidth={1.25}
              vectorEffect="non-scaling-stroke"
              className="text-accent-400/70"
            />
            {p.coberturaLargura && p.coberturaAltura && (
              <rect
                data-traco
                x={p.x + (p.largura - p.coberturaLargura) / 2}
                y={y - p.coberturaAltura}
                width={p.coberturaLargura}
                height={p.coberturaAltura}
                stroke="currentColor"
                strokeWidth={1.25}
                vectorEffect="non-scaling-stroke"
                className="text-accent-400/70"
              />
            )}
            {p.antena && (
              <line
                data-traco
                x1={p.x + p.largura / 2}
                y1={y}
                x2={p.x + p.largura / 2}
                y2={y - 22}
                stroke="currentColor"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                className="text-accent-400/70"
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}
