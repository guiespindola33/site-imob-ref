import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { ImovelForm } from '@/components/painel/imovel-form'
import { UploadFotos } from '@/components/painel/upload-fotos'
import { buscarImovelCms } from '@/services/cms'
import { exigirSessao } from '@/lib/auth/sessao'
import { slugFinalidade } from '@/types'

export const metadata = { title: 'Editar imóvel' }

export default async function EditarImovelPage({ params }: { params: { id: string } }) {
  await exigirSessao(`/cms/imoveis/${params.id}`)

  const imovel = await buscarImovelCms(params.id)
  // Imóvel de outro corretor volta null pelo RLS — 404, sem revelar que existe.
  if (!imovel) notFound()

  return (
    <div className="max-w-4xl">
      <Link
        href="/cms/imoveis"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm text-navy-500 transition-colors hover:text-navy-800"
      >
        <ArrowLeft size={16} aria-hidden />
        Voltar aos imóveis
      </Link>

      <header className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl">{imovel.nome_empreendimento}</h1>
          <p className="mt-1 truncate font-mono text-xs text-navy-400">/{imovel.slug}</p>
        </div>

        {imovel.publicado && (
          <Link
            href={`/imoveis/${slugFinalidade(imovel.finalidade)}/${imovel.slug}`}
            target="_blank"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-pill border border-navy-200 px-4 text-sm text-navy-700 transition-colors hover:border-navy-400"
          >
            Ver no site
            <ExternalLink size={14} aria-hidden />
          </Link>
        )}
      </header>

      <div className="mt-7 rounded-card border border-navy-100 bg-white p-6">
        <UploadFotos imovel={imovel} />
      </div>

      <div className="mt-6">
        <ImovelForm imovel={imovel} />
      </div>
    </div>
  )
}
