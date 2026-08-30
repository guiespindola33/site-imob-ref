import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

type Variante = 'primaria' | 'secundaria' | 'contorno' | 'fantasma' | 'whatsapp'
type Tamanho = 'sm' | 'md' | 'lg'

const VARIANTES: Record<Variante, string> = {
  primaria: 'bg-navy-800 text-white hover:bg-navy-700 active:bg-navy-900',
  secundaria: 'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700',
  contorno: 'border border-navy-200 bg-white text-navy-800 hover:border-navy-400 hover:bg-navy-50',
  fantasma: 'text-navy-700 hover:bg-navy-50',
  // Texto verde-escuro sobre o verde do WhatsApp, não branco — assim no
  // mockup aprovado, e o contraste (~5:1) fica melhor que branco sobre #25D366.
  whatsapp: 'bg-whatsapp text-whatsapp-ink hover:bg-whatsapp-dark active:bg-whatsapp-dark',
}

// Altura mínima de 44px em todos os tamanhos: alvo de toque acessível.
const TAMANHOS: Record<Tamanho, string> = {
  sm: 'min-h-11 px-4 text-sm gap-1.5',
  md: 'min-h-12 px-5 text-[0.9375rem] gap-2',
  lg: 'min-h-14 px-6 text-base gap-2.5',
}

const BASE =
  'inline-flex items-center justify-center rounded-pill font-medium leading-none ' +
  'cursor-pointer select-none transition-colors duration-200 ease-soft ' +
  'disabled:pointer-events-none disabled:opacity-50'

interface Comuns {
  variante?: Variante
  tamanho?: Tamanho
  className?: string
  children: React.ReactNode
}

export function Button({
  variante = 'primaria',
  tamanho = 'md',
  className,
  children,
  ...props
}: Comuns & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(BASE, VARIANTES[variante], TAMANHOS[tamanho], className)} {...props}>
      {children}
    </button>
  )
}

export function ButtonLink({
  variante = 'primaria',
  tamanho = 'md',
  className,
  children,
  href,
  externo,
  ...props
}: Comuns & { href: string; externo?: boolean } & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    'href'
  >) {
  const classes = cn(BASE, VARIANTES[variante], TAMANHOS[tamanho], className)

  if (externo) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        // noopener/noreferrer: impede que a aba aberta manipule esta via window.opener
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  )
}
