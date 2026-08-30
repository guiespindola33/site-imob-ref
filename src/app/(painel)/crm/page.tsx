import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import { Kanban } from '@/components/painel/kanban'
import { listarPipeline } from '@/services/leads'
import { exigirSessao } from '@/lib/auth/sessao'
import { ETAPAS_PIPELINE } from '@/types'

export const metadata = { title: 'Pipeline' }

export default async function CrmPage() {
  const [sessao, pipeline] = await Promise.all([exigirSessao('/crm'), listarPipeline()])

  const emAndamento = ETAPAS_PIPELINE.reduce((soma, e) => soma + pipeline[e].length, 0)
  const naFila = pipeline.captacao.filter((l) => l.corretor_id === null).length

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl">Pipeline</h1>
          <p className="mt-1 text-sm text-navy-500">
            {emAndamento} {emAndamento === 1 ? 'lead ativo' : 'leads ativos'}
            {naFila > 0 && (
              <>
                {' · '}
                <span className="font-medium text-aqua-700">
                  {naFila} na fila aberta
                </span>
              </>
            )}
          </p>
        </div>

        <Link
          href="/crm/leads/novo"
          className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-navy-800 px-5 text-sm font-medium text-white transition-colors hover:bg-navy-700"
        >
          <UserPlus size={17} aria-hidden />
          Adicionar lead
        </Link>
      </header>

      <Kanban inicial={pipeline} usuarioId={sessao.userId} />

      <p className="mt-4 text-xs text-navy-400">
        Leads que chegam pelo WhatsApp entram aqui pelo botão &ldquo;Adicionar lead&rdquo;. A
        criação automática exigiria a API Oficial do WhatsApp (Meta), fora do escopo da v1.
      </p>
    </>
  )
}
