import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  BedDouble,
  Building,
  Car,
  ChevronRight,
  Maximize,
  ShowerHead,
  Sofa,
} from 'lucide-react'
import { ImovelGaleria } from '@/components/imoveis/imovel-galeria'
import { CtaConsultar } from '@/components/imoveis/cta-consultar'
import { buscarImovelPorSlug, listarSlugsPublicados } from '@/services/imoveis'
import { formatArea, formatMoeda } from '@/lib/utils/format'
import { serializarJsonLd } from '@/lib/utils/json-ld'
import { siteUrl, VERTIZ } from '@/lib/vertiz'
import {
  FINALIDADE_LABEL,
  STATUS_IMOVEL_LABEL,
  TIPO_IMOVEL_LABEL,
  isFinalidadeSlug,
  slugFinalidade,
} from '@/types'

export const revalidate = 300

interface Params {
  params: { finalidade: string; slug: string }
}

export async function generateStaticParams() {
  const imoveis = await listarSlugsPublicados()
  return imoveis.map((i) => ({
    finalidade: slugFinalidade(i.finalidade),
    slug: i.slug,
  }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const imovel = await buscarImovelPorSlug(params.slug)
  if (!imovel) return { title: 'Imóvel não encontrado' }

  const tipo = TIPO_IMOVEL_LABEL[imovel.tipo_imovel]
  const preco = formatMoeda(imovel.valor_venda ?? imovel.valor_aluguel)
  const caminho = `/imoveis/${slugFinalidade(imovel.finalidade)}/${imovel.slug}`

  const descricao =
    imovel.descricao?.slice(0, 155) ??
    [
      `${tipo} em ${imovel.bairro}`,
      imovel.quartos ? `${imovel.quartos} quartos` : null,
      formatArea(imovel.area_m2),
      preco,
    ]
      .filter(Boolean)
      .join(' · ')

  return {
    title: `${imovel.nome_empreendimento} — ${tipo} em ${imovel.bairro}`,
    description: descricao,
    alternates: { canonical: caminho },
    openGraph: {
      title: `${imovel.nome_empreendimento} — ${imovel.bairro}`,
      description: descricao,
      url: caminho,
      images: imovel.fotos[0] ? [{ url: imovel.fotos[0].url }] : undefined,
    },
  }
}

export default async function ImovelPage({ params }: Params) {
  if (!isFinalidadeSlug(params.finalidade)) notFound()

  const imovel = await buscarImovelPorSlug(params.slug)
  if (!imovel) notFound()

  // Uma URL canônica por imóvel: /venda/x e /locacao/x não podem coexistir
  // servindo o mesmo conteúdo, ou o Google trata como conteúdo duplicado.
  const canonica = slugFinalidade(imovel.finalidade)
  if (params.finalidade !== canonica) {
    redirect(`/imoveis/${canonica}/${imovel.slug}`)
  }

  const url = `${siteUrl()}/imoveis/${canonica}/${imovel.slug}`
  const tipo = TIPO_IMOVEL_LABEL[imovel.tipo_imovel]

  const venda = formatMoeda(imovel.valor_venda)
  const aluguel = formatMoeda(imovel.valor_aluguel)
  const precoPrincipal = imovel.finalidade === 'locacao' ? aluguel : venda
  const precoRotulo = imovel.finalidade === 'locacao' ? '/mês' : null

  const specs = [
    imovel.area_m2 && { icone: Maximize, rotulo: 'Área', valor: formatArea(imovel.area_m2)! },
    imovel.quartos && { icone: BedDouble, rotulo: 'Quartos', valor: String(imovel.quartos) },
    imovel.suites && { icone: ShowerHead, rotulo: 'Suítes', valor: String(imovel.suites) },
    imovel.vagas && { icone: Car, rotulo: 'Vagas', valor: String(imovel.vagas) },
    imovel.andar && { icone: Building, rotulo: 'Andar', valor: `${imovel.andar}º` },
    imovel.mobiliado && { icone: Sofa, rotulo: 'Mobiliado', valor: 'Sim' },
  ].filter(Boolean) as Array<{ icone: typeof Maximize; rotulo: string; valor: string }>

  const custos = [
    venda && { rotulo: 'Valor de venda', valor: venda },
    aluguel && { rotulo: 'Aluguel mensal', valor: `${aluguel}/mês` },
    formatMoeda(imovel.valor_condominio) && {
      rotulo: 'Condomínio',
      valor: formatMoeda(imovel.valor_condominio)!,
    },
    formatMoeda(imovel.valor_iptu) && { rotulo: 'IPTU', valor: formatMoeda(imovel.valor_iptu)! },
  ].filter(Boolean) as Array<{ rotulo: string; valor: string }>

  // Dados estruturados para o Google entender a ficha como uma oferta.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: imovel.nome_empreendimento,
    url,
    description: imovel.descricao ?? `${tipo} em ${imovel.bairro}`,
    image: imovel.fotos.map((f) => f.url),
    datePosted: imovel.publicado_em ?? imovel.created_at,
    address: {
      '@type': 'PostalAddress',
      addressLocality: imovel.cidade,
      addressRegion: imovel.uf,
      addressCountry: 'BR',
      streetAddress: imovel.bairro,
    },
    offers: {
      '@type': 'Offer',
      price: imovel.valor_venda ?? imovel.valor_aluguel ?? undefined,
      priceCurrency: 'BRL',
      availability:
        imovel.status === 'disponivel'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/LimitedAvailability',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializarJsonLd(jsonLd) }}
      />

      {/* pb-sticky-cta reserva a altura da barra fixa — o conteúdo nunca fica embaixo dela */}
      <div className="container-app py-6 pb-sticky-cta lg:pb-12">
        <nav aria-label="Trilha de navegação" className="mb-5">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-navy-400">
            <li>
              <Link href="/" className="transition-colors hover:text-navy-700">
                Início
              </Link>
            </li>
            <ChevronRight size={14} aria-hidden />
            <li>
              <Link href="/imoveis" className="transition-colors hover:text-navy-700">
                Imóveis
              </Link>
            </li>
            <ChevronRight size={14} aria-hidden />
            <li>
              <Link
                href={`/imoveis?bairro=${encodeURIComponent(imovel.bairro)}`}
                className="transition-colors hover:text-navy-700"
              >
                {imovel.bairro}
              </Link>
            </li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
          <div className="min-w-0">
            <ImovelGaleria
              fotos={imovel.fotos}
              alt={`${tipo} em ${imovel.bairro}`}
            />

            <header className="mt-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="kicker rounded-pill bg-navy-50 px-3 py-1 text-[0.6875rem] text-navy-600">
                  {tipo}
                </span>
                <span className="kicker rounded-pill bg-accent-50 px-3 py-1 text-[0.6875rem] text-accent-700">
                  {FINALIDADE_LABEL[imovel.finalidade]}
                </span>
                {imovel.status !== 'disponivel' && (
                  <span className="kicker rounded-pill bg-navy-800/80 px-3 py-1 text-[0.6875rem] text-white">
                    {STATUS_IMOVEL_LABEL[imovel.status]}
                  </span>
                )}
              </div>

              <h1 className="mt-3 font-editorial text-3xl font-normal sm:text-4xl">
                {imovel.nome_empreendimento}
              </h1>
              <p className="mt-2 text-navy-500">
                {imovel.bairro} · {imovel.cidade}/{imovel.uf}
                {imovel.endereco ? ` · ${imovel.endereco}` : ''}
              </p>
            </header>

            {specs.length > 0 && (
              <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {specs.map((s) => (
                  <li
                    key={s.rotulo}
                    className="rounded-xl border border-navy-100 bg-white px-4 py-3"
                  >
                    <span className="kicker flex items-center gap-1.5 text-[0.6875rem] text-navy-400">
                      <s.icone size={14} aria-hidden />
                      {s.rotulo}
                    </span>
                    <span className="tabular mt-1 block text-lg font-semibold text-navy-800">
                      {s.valor}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {imovel.descricao && (
              <section className="mt-8">
                <h2 className="text-xl">Sobre o imóvel</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-navy-600">
                  {imovel.descricao}
                </p>
              </section>
            )}

            {imovel.diferenciais.length > 0 && (
              <section className="mt-8">
                <h2 className="text-xl">Diferenciais do prédio</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {imovel.diferenciais.map((d) => (
                    <li
                      key={d}
                      className="rounded-pill border border-navy-100 bg-white px-4 py-2 text-sm text-navy-600"
                    >
                      {d}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {imovel.proximidades.length > 0 && (
              <section className="mt-8">
                <h2 className="text-xl">Por perto</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {imovel.proximidades.map((p) => (
                    <li
                      key={p}
                      className="rounded-pill bg-accent-50 px-4 py-2 text-sm text-accent-700"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {custos.length > 0 && (
              <section className="mt-8">
                <h2 className="text-xl">Valores</h2>
                <dl className="mt-3 divide-y divide-navy-50 overflow-hidden rounded-card border border-navy-100 bg-white">
                  {custos.map((c) => (
                    <div key={c.rotulo} className="flex items-center justify-between px-5 py-3.5">
                      <dt className="text-navy-500">{c.rotulo}</dt>
                      <dd className="tabular font-semibold text-navy-800">{c.valor}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-sm text-navy-400">
                  {imovel.taxas_inclusas
                    ? 'Taxas inclusas no valor informado.'
                    : 'Condomínio e IPTU não estão inclusos no valor principal.'}
                </p>
              </section>
            )}

            <p className="mt-8 text-xs text-navy-400">
              {VERTIZ.nome} · CRECI {VERTIZ.creci}. Valores e disponibilidade sujeitos a
              confirmação com a equipe.
            </p>
          </div>

          {/* Desktop: cartão de conversão que acompanha a rolagem */}
          <div className="hidden lg:block">
            <CtaConsultar
              modo="painel"
              className="sticky top-24"
              nome={imovel.nome_empreendimento}
              bairro={imovel.bairro}
              url={url}
              preco={precoPrincipal}
              precoRotulo={precoRotulo}
            />
          </div>
        </div>
      </div>

      {/* Mobile: barra fixa no rodapé */}
      <CtaConsultar
        modo="sticky"
        className="lg:hidden"
        nome={imovel.nome_empreendimento}
        bairro={imovel.bairro}
        url={url}
        preco={precoPrincipal}
        precoRotulo={precoRotulo}
      />
    </>
  )
}
