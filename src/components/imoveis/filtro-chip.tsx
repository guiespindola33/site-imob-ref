import { cn } from '@/lib/utils/cn'

export function FiltroChip({
  ativo,
  onClick,
  children,
  className,
  desabilitado,
}: {
  ativo: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
  desabilitado?: boolean
}) {
  return (
    <button
      type="button"
      className={cn('filtro-chip', className)}
      data-ativo={ativo}
      aria-pressed={ativo}
      onClick={onClick}
      disabled={desabilitado}
    >
      {children}
    </button>
  )
}
