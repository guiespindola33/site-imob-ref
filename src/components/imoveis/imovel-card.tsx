import Image from 'next/image'
import Link from 'next/link'
import { formatArea, formatMoeda } from '@/lib/utils/format'
import { linkWhatsApp, mensagemConsultaImovel, siteUrl } from '@/lib/vertiz'
import { FINALIDADE_LABEL, STATUS_IMOVEL_LABEL, slugFinalidade, type ImovelComFotos } from '@/types'
import { cn } from '@/lib/utils/cn'

interface ImovelCardProps {
  imovel: ImovelComFotos
  /** Prioriza o carregamento das primeiras imagens visíveis (LCP). */
  prioridade?: boolean
  /** Home mostra o card sem CTA — a decisão de conversão acontece na ficha. */
  mostrarCta?: boolean
  className?: string
}

/** Linha compacta "Bairro · 96 m² · 3 qtos · 1 suíte · 2 vagas". */
function linhaSpecs(imovel: ImovelComFotos): string {
  const partes = [
    imovel.bairro,
    formatArea(imovel.area_m2),
    imovel.quartos ? `${imovel.quartos} qto${imovel.quartos > 1 ? 's' : ''}` : null,
    imovel.suites ? `${imovel.suites} suíte${imovel.suites > 1 ? 's' : ''}` : null,
    imovel.vagas ? `${imovel.vagas} vaga${imovel.vagas > 1 ? 's' : ''}` : null,
  ].filter(Boolean)
  return partes.join(' · ')
}

/** Kicker "VENDA · DISPONÍVEL" / "LOCAÇÃO · TAXAS INCLUSAS" / "VENDA · RESERVADO". */
function kicker(imovel: ImovelComFotos): { texto: string; destaque: boolean } {
  if (imovel.status !== 'disponivel') {
    return { texto: `${FINALIDADE_LABEL[imovel.finalidade]} · ${STATUS_IMOVEL_LABEL[imovel.status]}`, destaque: false }
  }
  const alugavel = imovel.finalidade === 'locacao' || imovel.finalidade === 'venda_locacao'
  if (alugavel && imovel.taxas_inclusas) {
    return { texto: `${FINALIDADE_LABEL[imovel.finalidade]} · TAXAS INCLUSAS`, destaque: true }
  }
  return { texto: `${FINALIDADE_LABEL[imovel.finalidade]} · DISPONÍVEL`, destaque: true }
}

export function ImovelCard({
  imovel,
  prioridade = false,
  mostrarCta = true,
  className,
}: ImovelCardProps) {
  const capa = imovel.fotos[0]
  const href = `/imoveis/${slugFinalidade(imovel.finalidade)}/${imovel.slug}`
  const k = kicker(imovel)

  const venda = formatMoeda(imovel.valor_venda)
  const aluguel = formatMoeda(imovel.valor_aluguel)
  const precoPrincipal = imovel.finalidade === 'locacao' ? aluguel : venda
  const precoRotulo = imovel.finalidade === 'locacao' ? '/mês' : null

  const urlAbsoluta = `${siteUrl()}${href}`
  const linkCta =
    imovel.status === 'reservado'
      ? linkWhatsApp(
          `Olá! O imóvel ${imovel.nome_empreendimento} — ${imovel.bairro} está reservado. ` +
            `Quero entrar na lista de espera. ${urlAbsoluta}`
        )
      : linkWhatsApp(
          mensagemConsultaImovel({ nome: imovel.nome_empreendimento, bairro: imovel.bairro, url: urlAbsoluta })
        )

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-card border border-navy-100 bg-white shadow-card',
        'transition-shadow duration-300 ease-soft hover:shadow-card-hover',
        className
      )}
    >
      {/* Proporção fixa reserva o espaço da imagem e evita layout shift (CLS). */}
      <div className="relative aspect-[2/1] overflow-hidden">
        {capa ? (
          <Image
            src={capa.url}
            alt={capa.legenda ?? `${imovel.nome_empreendimento} — ${imovel.bairro}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={prioridade}
            className="object-cover transition-transform duration-500 ease-soft group-hover:scale-[1.03]"
          />
        ) : (
          <div className="foto-placeholder flex h-full items-center justify-center">
            <span className="kicker text-[10px] text-navy-400/80">Sem foto</span>
          </div>
        )}

        <span
          className={cn(
            'kicker absolute left-3 top-3 rounded-pill px-2.5 py-1 text-[0.625rem]',
            imovel.status === 'disponivel'
              ? 'bg-white/95 text-navy-700'
              : 'bg-navy-800/80 text-white'
          )}
        >
          {STATUS_IMOVEL_LABEL[imovel.status]}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <p className={cn('kicker text-[0.6875rem]', k.destaque ? 'text-accent-600' : 'text-navy-400')}>
          {k.texto}
        </p>

        <h3 className="mt-1.5 text-base font-semibold leading-snug sm:text-lg">
          <Link href={href} className={cn(!mostrarCta && "after:absolute after:inset-0 after:content-['']")}>
            {imovel.nome_empreendimento}
          </Link>
        </h3>

        <p className="mt-1.5 text-sm text-navy-500">{linhaSpecs(imovel)}</p>

        <p className="tabular mt-2.5 text-lg font-semibold text-navy-800 sm:text-xl">
          {precoPrincipal ?? 'Sob consulta'}
          {precoRotulo && <span className="ml-1 text-sm font-normal text-navy-400">{precoRotulo}</span>}
        </p>

        {mostrarCta && (
          <a
            href={linkCta}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'relative z-[1] mt-4 flex min-h-11 items-center justify-center rounded-xl text-sm font-medium transition-colors duration-200 ease-soft',
              imovel.status === 'reservado'
                ? 'border border-navy-200 text-navy-600 hover:border-navy-400'
                : 'bg-whatsapp text-whatsapp-ink hover:bg-whatsapp-dark'
            )}
          >
            {imovel.status === 'reservado' ? 'Entrar na lista de espera' : 'Consultar Disponibilidade'}
          </a>
        )}
      </div>
    </article>
  )
}
