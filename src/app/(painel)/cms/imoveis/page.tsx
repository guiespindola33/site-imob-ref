import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Plus } from 'lucide-react'
import { listarImoveisCms } from '@/services/cms'
import { exigirSessao } from '@/lib/auth/sessao'
import { TogglePublicado } from '@/components/painel/toggle-publicado'
import { formatMoeda } from '@/lib/utils/format'
import {
  STATUS_IMOVEL_LABEL,
  TIPO_IMOVEL_LABEL,
  slugFinalidade,
} from '@/types'

export const metadata = { title: 'Imóveis' }

export default async function CmsImoveisPage() {
  await exigirSessao('/cms/imoveis')
  const imoveis = await listarImoveisCms()

  const publicados = imoveis.filter((i) => i.publicado).length

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl">Imóveis</h1>
          <p className="mt-1 text-sm text-navy-500">
            {imoveis.length} cadastrados · {publicados} publicados no site
          </p>
        </div>

        <Link
          href="/cms/imoveis/novo"
          className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-navy-800 px-5 text-sm font-medium text-white transition-colors hover:bg-navy-700"
        >
          <Plus size={17} aria-hidden />
          Cadastrar imóvel
        </Link>
      </header>

      {imoveis.length === 0 ? (
        <p className="rounded-card border border-dashed border-navy-200 bg-white px-6 py-16 text-center text-navy-400">
          Nenhum imóvel cadastrado ainda.
        </p>
      ) : (
        <ul className="space-y-3">
          {imoveis.map((imovel) => {
            const preco = formatMoeda(imovel.valor_venda ?? imovel.valor_aluguel)

            return (
              <li
                key={imovel.id}
                className="flex flex-wrap items-center gap-4 rounded-card border border-navy-100 bg-white p-3 sm:p-4"
              >
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-navy-50">
                  {imovel.fotos[0] ? (
                    <Image
                      src={imovel.fotos[0].url}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-[0.625rem] text-navy-300">
                      Sem foto
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/cms/imoveis/${imovel.id}`}
                    className="block truncate font-medium text-navy-800 hover:text-aqua-700"
                  >
                    {imovel.nome_empreendimento}
                  </Link>
                  <p className="mt-0.5 truncate text-sm text-navy-500">
                    {TIPO_IMOVEL_LABEL[imovel.tipo_imovel]} · {imovel.bairro} ·{' '}
                    {STATUS_IMOVEL_LABEL[imovel.status]}
                  </p>
                  <p className="tabular mt-0.5 text-sm font-medium text-navy-700">
                    {preco ?? 'Sem valor'}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {imovel.publicado && (
                    <Link
                      href={`/imoveis/${slugFinalidade(imovel.finalidade)}/${imovel.slug}`}
                      target="_blank"
                      aria-label={`Ver ${imovel.nome_empreendimento} no site`}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700"
                    >
                      <ExternalLink size={16} aria-hidden />
                    </Link>
                  )}

                  <TogglePublicado
                    id={imovel.id}
                    publicado={imovel.publicado}
                    nome={imovel.nome_empreendimento}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
