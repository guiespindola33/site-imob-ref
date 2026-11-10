import { cn } from '@/lib/utils/cn'
import { SITE } from '@/lib/site-config'

/**
 * Selo genérico (iniciais do nome curto) — placeholder de template.
 * Substitua por um componente de imagem (ver README) quando houver
 * um logo real do cliente.
 */
export function Monograma({ className }: { className?: string }) {
  const iniciais = SITE.nomeCurto
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <span
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-navy-800 text-sm font-semibold text-white',
        className
      )}
    >
      {iniciais}
    </span>
  )
}

export function Logo({
  className,
  invertido = false,
}: {
  className?: string
  invertido?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Monograma />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display text-lg font-semibold tracking-[-0.02em]',
            invertido ? 'text-white' : 'text-navy-800'
          )}
        >
          {SITE.nomeCurto}
        </span>
        <span
          className={cn(
            'text-[0.625rem] font-medium uppercase tracking-[0.18em]',
            invertido ? 'text-navy-200' : 'text-navy-400'
          )}
        >
          Soluções Imobiliárias
        </span>
      </span>
    </span>
  )
}
