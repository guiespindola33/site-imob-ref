'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Foto {
  id: string
  url: string
  legenda: string | null
}

export function ImovelGaleria({ fotos, alt }: { fotos: Foto[]; alt: string }) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: fotos.length > 1, align: 'start' })
  const [indice, setIndice] = useState(0)

  const onSelect = useCallback(() => {
    if (embla) setIndice(embla.selectedScrollSnap())
  }, [embla])

  useEffect(() => {
    if (!embla) return
    onSelect()
    embla.on('select', onSelect)
    return () => {
      embla.off('select', onSelect)
    }
  }, [embla, onSelect])

  if (fotos.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-card bg-navy-50 text-navy-300">
        Sem fotos
      </div>
    )
  }

  return (
    <section aria-roledescription="carrossel" aria-label="Fotos do imóvel">
      <div className="relative overflow-hidden rounded-card bg-navy-50" ref={emblaRef}>
        <div className="flex">
          {fotos.map((foto, i) => (
            <div
              key={foto.id}
              className="relative aspect-[4/3] min-w-0 flex-[0_0_100%]"
              role="group"
              aria-roledescription="slide"
              aria-label={`Foto ${i + 1} de ${fotos.length}`}
            >
              <Image
                src={foto.url}
                alt={foto.legenda ?? `${alt} — foto ${i + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority={i === 0}
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {fotos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => embla?.scrollPrev()}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-navy-800 shadow-md transition-colors hover:bg-white"
            >
              <ChevronLeft size={20} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => embla?.scrollNext()}
              aria-label="Próxima foto"
              className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-navy-800 shadow-md transition-colors hover:bg-white"
            >
              <ChevronRight size={20} aria-hidden />
            </button>

            <p className="absolute bottom-3 right-3 rounded-pill bg-navy-900/75 px-2.5 py-1 text-xs font-medium text-white tabular">
              {indice + 1} / {fotos.length}
            </p>
          </>
        )}
      </div>

      {fotos.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {fotos.map((foto, i) => (
            <li key={foto.id} className="shrink-0">
              <button
                type="button"
                onClick={() => embla?.scrollTo(i)}
                aria-label={`Ir para a foto ${i + 1}`}
                aria-current={i === indice}
                className={cn(
                  'relative h-16 w-20 cursor-pointer overflow-hidden rounded-lg border-2 transition-colors sm:h-20 sm:w-28',
                  i === indice ? 'border-accent-500' : 'border-transparent opacity-70 hover:opacity-100'
                )}
              >
                <Image src={foto.url} alt="" fill sizes="112px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
