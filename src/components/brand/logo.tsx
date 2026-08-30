import Image from 'next/image'
import { cn } from '@/lib/utils/cn'
import monograma from '../../../public/logo-vertiz-monograma.png'

/**
 * Monograma VZ — recortado do arquivo real enviado pela Vertiz
 * (`public/logo-vertiz-monograma.png`, extraído de `public/logo-vertiz.jpg`).
 *
 * A imagem já traz seu próprio fundo navy (a cor real da marca, `#223C61`,
 * ligeiramente diferente do navy usado no restante do site) — por isso
 * funciona como selo autocontido tanto no header branco quanto no footer/
 * painel escuro, sem precisar de fundo transparente.
 */
export function Monograma({ className }: { className?: string }) {
  return (
    <span className={cn('block h-9 w-9 overflow-hidden rounded-[10px]', className)}>
      <Image
        src={monograma}
        alt="Vertiz"
        className="h-full w-full object-cover"
        placeholder="blur"
        priority
      />
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
