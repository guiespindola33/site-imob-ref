import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LeadForm } from '@/components/painel/lead-form'
import { listarImoveisParaSelecao } from '@/services/leads'
import { exigirSessao } from '@/lib/auth/sessao'

export const metadata = { title: 'Adicionar lead' }

export default async function NovoLeadPage() {
  await exigirSessao('/crm/leads/novo')
  const imoveis = await listarImoveisParaSelecao()

  return (
    <div className="max-w-2xl">
      <Link
        href="/crm"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm text-navy-500 transition-colors hover:text-navy-800"
      >
        <ArrowLeft size={16} aria-hidden />
        Voltar ao pipeline
      </Link>

      <h1 className="mt-3 text-2xl">Adicionar lead</h1>
      <p className="mt-1.5 text-sm text-navy-500">
        Registre aqui o contato que chegou pelo WhatsApp, Instagram ou indicação. O lead entra
        na coluna Captação.
      </p>

      <div className="mt-7 rounded-card border border-navy-100 bg-white p-6">
        <LeadForm imoveis={imoveis} />
      </div>
    </div>
  )
}
