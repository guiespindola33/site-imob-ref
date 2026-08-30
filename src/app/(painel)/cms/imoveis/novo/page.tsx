import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ImovelForm } from '@/components/painel/imovel-form'
import { exigirSessao } from '@/lib/auth/sessao'

export const metadata = { title: 'Cadastrar imóvel' }

export default async function NovoImovelPage() {
  await exigirSessao('/cms/imoveis/novo')

  return (
    <div className="max-w-4xl">
      <Link
        href="/cms/imoveis"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm text-navy-500 transition-colors hover:text-navy-800"
      >
        <ArrowLeft size={16} aria-hidden />
        Voltar aos imóveis
      </Link>

      <h1 className="mt-3 text-2xl">Cadastrar imóvel</h1>
      <p className="mt-1.5 text-sm text-navy-500">
        Salve os dados primeiro; as fotos são enviadas na tela de edição.
      </p>

      <div className="mt-7">
        <ImovelForm />
      </div>
    </div>
  )
}
