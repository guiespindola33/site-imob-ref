import type { Metadata } from 'next'
import Link from 'next/link'
import { SearchX } from 'lucide-react'
import { ImovelCard } from '@/components/imoveis/imovel-card'
import { ImovelCardLinha } from '@/components/imoveis/imovel-card-linha'
import { CatalogoMobile } from '@/components/imoveis/catalogo-mobile'
import { CatalogoSidebar } from '@/components/imoveis/catalogo-sidebar'
import { CatalogoResultadoBarra } from '@/components/imoveis/catalogo-resultado-barra'
import { StaggerGrid } from '@/components/motion/stagger-grid'
import { agregarOpcoes, carregarFacetas, listarCatalogo } from '@/services/imoveis'
import { filtrosParaQuery, parseFiltros, temFiltroAtivo } from '@/lib/imoveis/filtros'
import { TIPO_IMOVEL_LABEL, TIPO_IMOVEL_LABEL_PLURAL, type TipoImovel } from '@/types'

export const revalidate = 120

type SearchParams = Record<string, string | string[] | undefined>

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const filtros = parseFiltros(searchParams)

  const partes = [
    filtros.tipo ? TIPO_IMOVEL_LABEL_PLURAL[filtros.tipo as TipoImovel] : 'Imóveis',
    filtros.finalidade === 'locacao' ? 'para alugar' : filtros.finalidade === 'venda' ? 'à venda' : null,
    filtros.bairro ? `em ${filtros.bairro}` : 'no Grande Recife',
  ].filter(Boolean)

  return {
    title: partes.join(' '),
    description:
      `${partes.join(' ')} — catálogo da Vertiz Soluções Imobiliárias com valor, ficha completa ` +
      'e atendimento direto no WhatsApp.',
    alternates: { canonical: '/imoveis' },
    robots: temFiltroAtivo(filtros) ? { index: false, follow: true } : { index: true, follow: true },
  }
}

/** "Apartamentos em Boa Viagem" / "Imóveis à venda" / "Todos os imóveis". */
function titulo(filtros: ReturnType<typeof parseFiltros>): string {
  const tipoPlural = filtros.tipo ? TIPO_IMOVEL_LABEL_PLURAL[filtros.tipo as TipoImovel] : null

  if (tipoPlural && filtros.bairro) return `${tipoPlural} em ${filtros.bairro}`
  if (filtros.bairro) return `Imóveis em ${filtros.bairro}`
  if (tipoPlural) return tipoPlural
  if (filtros.finalidade === 'locacao') return 'Imóveis para alugar'
  if (filtros.finalidade === 'venda') return 'Imóveis à venda'
  return 'Todos os imóveis'
}

function breadcrumb(filtros: ReturnType<typeof parseFiltros>): string {
  const partes = ['HOME']
  partes.push(filtros.finalidade ? filtros.finalidade.toUpperCase() : 'CATÁLOGO')
  if (filtros.tipo) partes.push(TIPO_IMOVEL_LABEL[filtros.tipo as TipoImovel].toUpperCase())
  if (filtros.bairro) partes.push(filtros.bairro.toUpperCase())
  return partes.join(' / ')
}

export default async function CatalogoPage({ searchParams }: { searchParams: SearchParams }) {
  const filtros = parseFiltros(searchParams)

  const [resultado, facetas] = await Promise.all([
    listarCatalogo(filtros),
    carregarFacetas(filtros.finalidade),
  ])

  const opcoes = agregarOpcoes(facetas)
  const chaveFiltros = JSON.stringify(filtros)

  const mensagemWhatsapp = filtros.bairro
    ? `Olá! Quero consultar a disponibilidade de imóveis em ${filtros.bairro}.`
    : filtros.finalidade
      ? `Olá! Quero consultar imóveis para ${filtros.finalidade === 'venda' ? 'comprar' : 'alugar'}.`
      : 'Olá! Quero consultar a disponibilidade de imóveis no catálogo da Vertiz.'

  return (
    <div className="container-app py-5 pb-sticky-cta lg:py-9 lg:pb-9">
      <p className="kicker hidden text-[0.6875rem] text-navy-400 lg:block">{breadcrumb(filtros)}</p>

      <div className="flex flex-wrap items-end justify-between gap-4 lg:mt-2">
        <h1 className="font-editorial text-[1.75rem] font-normal normal-case tracking-normal text-navy-800 sm:text-3xl lg:text-[2.125rem]">
          {titulo(filtros)}
        </h1>
      </div>
      <p className="mt-1.5 max-w-xl text-sm text-navy-500 lg:hidden">
        Cada ficha traz valor, metragem e diferenciais. Falar com a equipe é sempre pelo WhatsApp.
      </p>

      <CatalogoMobile
        filtros={filtros}
        opcoes={opcoes}
        total={resultado.total}
        mensagemWhatsapp={mensagemWhatsapp}
      />

      <div className="mt-5 hidden lg:block">
        <CatalogoResultadoBarra filtros={filtros} total={resultado.total} />
      </div>

      <div className="mt-5 flex flex-col gap-8 lg:mt-6 lg:flex-row">
        <CatalogoSidebar filtros={filtros} opcoes={opcoes} />

        <div className="min-w-0 flex-1">
          {resultado.imoveis.length > 0 ? (
            <>
              {/* Mobile: cards em linha (thumb + info compacta) */}
              <StaggerGrid chave={chaveFiltros} className="flex flex-col gap-2.5 lg:hidden">
                {resultado.imoveis.map((imovel, i) => (
                  <ImovelCardLinha key={imovel.id} imovel={imovel} prioridade={i < 4} />
                ))}
              </StaggerGrid>

              {/* Desktop: grade de 3 colunas com CTA embutido no card */}
              <StaggerGrid
                chave={chaveFiltros}
                className="hidden gap-5 lg:grid lg:grid-cols-2 xl:grid-cols-3"
              >
                {resultado.imoveis.map((imovel, i) => (
                  <ImovelCard key={imovel.id} imovel={imovel} prioridade={i < 3} />
                ))}
              </StaggerGrid>

              {resultado.totalPaginas > 1 && (
                <nav
                  className="mt-10 flex items-center justify-center gap-2"
                  aria-label="Paginação do catálogo"
                >
                  {Array.from({ length: resultado.totalPaginas }, (_, i) => i + 1).map((n) => (
                    <Link
                      key={n}
                      href={`/imoveis${filtrosParaQuery({ ...filtros, pagina: n })}`}
                      aria-current={n === resultado.pagina ? 'page' : undefined}
                      className={
                        n === resultado.pagina
                          ? 'inline-flex h-11 min-w-11 items-center justify-center rounded-pill bg-navy-800 px-3 text-sm font-medium text-white'
                          : 'inline-flex h-11 min-w-11 items-center justify-center rounded-pill border border-navy-200 bg-white px-3 text-sm text-navy-600 transition-colors hover:border-navy-400'
                      }
                    >
                      {n}
                    </Link>
                  ))}
                </nav>
              )}
            </>
          ) : (
            <div className="rounded-card border border-dashed border-navy-200 bg-white px-6 py-16 text-center">
              <SearchX size={32} className="mx-auto text-navy-300" aria-hidden />
              <h2 className="mt-4 text-lg">Nenhum imóvel com esses filtros</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-navy-500">
                {temFiltroAtivo(filtros)
                  ? 'Tente ampliar a faixa de valor ou remover um dos filtros.'
                  : 'O catálogo ainda não tem imóveis publicados.'}
              </p>
              {temFiltroAtivo(filtros) && (
                <Link
                  href="/imoveis"
                  className="mt-6 inline-flex min-h-11 items-center rounded-pill bg-navy-800 px-5 text-sm font-medium text-white transition-colors hover:bg-navy-700"
                >
                  Ver todos os imóveis
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
