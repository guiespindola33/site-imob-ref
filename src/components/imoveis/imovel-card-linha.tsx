import Image from 'next/image'
import Link from 'next/link'
import { formatArea, formatMoeda } from '@/lib/utils/format'
import { FINALIDADE_LABEL, STATUS_IMOVEL_LABEL, slugFinalidade, type ImovelComFotos } from '@/types'
import { cn } from '@/lib/utils/cn'

/**
 * Card horizontal do catálogo mobile — thumb + informação em linha.
 * Direção "Filtro vivo" (mockup 1b): compacto o bastante para caber vários
 * na tela sem rolagem excessiva, já que é o formato que a maioria dos
 * visitantes (vindos do Instagram) vai rolar centenas de vezes.
 */
export function ImovelCardLinha({
  imovel,
  prioridade = false,
}: {
  imovel: ImovelComFotos
  prioridade?: boolean
}) {
  const capa = imovel.fotos[0]
  const href = `/imoveis/${slugFinalidade(imovel.finalidade)}/${imovel.slug}`

  const venda = formatMoeda(imovel.valor_venda)
  const aluguel = formatMoeda(imovel.valor_aluguel)
  const precoPrincipal = imovel.finalidade === 'locacao' ? aluguel : venda
  const precoRotulo = imovel.finalidade === 'locacao' ? '/mês' : null

  const disponivel = imovel.status === 'disponivel'
  const alugavel = imovel.finalidade === 'locacao' || imovel.finalidade === 'venda_locacao'
  const extraKicker =
    disponivel && alugavel && imovel.taxas_inclusas
      ? 'TAXAS INCLUSAS'
      : disponivel
        ? 'DISPONÍVEL'
        : STATUS_IMOVEL_LABEL[imovel.status].toUpperCase()

  const specs = [
    imovel.bairro,
    formatArea(imovel.area_m2),
    imovel.quartos ? `${imovel.quartos} qto${imovel.quartos > 1 ? 's' : ''}` : null,
    imovel.suites ? `${imovel.suites} suíte${imovel.suites > 1 ? 's' : ''}` : null,
    imovel.vagas ? `${imovel.vagas} vaga${imovel.vagas > 1 ? 's' : ''}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Link
      href={href}
      className="relative flex gap-3 rounded-card border border-navy-100 bg-white p-2.5 shadow-card transition-shadow duration-200 ease-soft active:shadow-none"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
        {capa ? (
          <Image
            src={capa.url}
            alt={capa.legenda ?? `${imovel.nome_empreendimento} — ${imovel.bairro}`}
            fill
            sizes="96px"
            priority={prioridade}
            className="object-cover"
          />
        ) : (
          <div className="foto-placeholder flex h-full items-center justify-center">
            <span className="kicker text-[8px] text-navy-400/80">Sem foto</span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            'kicker text-[0.625rem]',
            disponivel ? 'text-accent-600' : 'text-navy-400'
          )}
        >
          {FINALIDADE_LABEL[imovel.finalidade]} · {extraKicker}
        </span>
        <span className="mt-1 truncate text-[0.84375rem] font-medium leading-tight text-navy-800">
          {imovel.nome_empreendimento}
        </span>
        <span className="mt-0.5 truncate text-[0.6875rem] text-navy-500">{specs}</span>
        <span className="tabular mt-auto text-[0.9375rem] font-semibold text-navy-800">
          {precoPrincipal ?? 'Sob consulta'}
          {precoRotulo && <span className="text-xs font-normal text-navy-400"> {precoRotulo}</span>}
        </span>
      </div>
    </Link>
  )
}
