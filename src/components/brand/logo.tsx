import { cn } from '@/lib/utils/cn'

/**
 * Monograma VZ.
 *
 * Placeholder tipográfico fiel ao logo atual (monograma sobre navy, wordmark em
 * cinza claro) até o arquivo em alta resolução chegar — ver pendência de
 * identidade visual no escopo. Trocar por SVG do arquivo original mantendo a
 * mesma API deste componente.
 */
export function Monograma({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn('h-9 w-9', className)}
      role="img"
      aria-label="Vertiz"
      fill="none"
    >
      <rect width="40" height="40" rx="10" className="fill-navy-800" />
      <path
        d="M9 12.5 15.4 27h2.3l6.4-14.5h-3.1l-4.4 10.6-4.4-10.6H9Z"
        className="fill-white"
      />
      <path
        d="M23.5 12.5v2.6h5.6l-5.9 9.5v2.4h9.6v-2.6h-6l5.9-9.5v-2.4h-9.2Z"
        className="fill-accent-400"
      />
    </svg>
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
          Vertiz
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
