import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, Mail, MessageCircle, Phone } from 'lucide-react'
import { buscarLead } from '@/services/leads'
import { exigirSessao } from '@/lib/auth/sessao'
import { NotaForm } from '@/components/painel/nota-form'
import { linkWhatsApp } from '@/lib/vertiz'
import { ETAPA_LEAD_LABEL, ORIGEM_LEAD_LABEL, type LeadEvento } from '@/types'

export const metadata = { title: 'Lead' }

function descreverEvento(evento: LeadEvento): string {
  if (evento.tipo === 'etapa') {
    const de = evento.etapa_de ? ETAPA_LEAD_LABEL[evento.etapa_de] : '—'
    const para = evento.etapa_para ? ETAPA_LEAD_LABEL[evento.etapa_para] : '—'
    return `Movido de ${de} para ${para}${evento.descricao ? ` · ${evento.descricao}` : ''}`
  }
  return evento.descricao ?? ETAPA_LEAD_LABEL[evento.etapa_para ?? 'captacao']
}

const formatarData = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(iso)
  )

export default async function LeadPage({ params }: { params: { id: string } }) {
  await exigirSessao(`/crm/leads/${params.id}`)

  const resultado = await buscarLead(params.id)
  // Lead fora da visibilidade do usuário volta como null pelo RLS — 404 não
  // revela se ele existe e pertence a outro corretor.
  if (!resultado) notFound()

  const { lead, eventos } = resultado

  return (
    <div className="max-w-3xl">
      <Link
        href="/crm"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm text-navy-500 transition-colors hover:text-navy-800"
      >
        <ArrowLeft size={16} aria-hidden />
        Voltar ao pipeline
      </Link>

      <header className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl">{lead.nome}</h1>
          <p className="mt-1 text-sm text-navy-500">
            {ORIGEM_LEAD_LABEL[lead.origem]} · criado em {formatarData(lead.created_at)}
          </p>
        </div>
        <span className="rounded-pill bg-navy-800 px-3.5 py-1.5 text-xs font-medium text-white">
          {ETAPA_LEAD_LABEL[lead.etapa]}
        </span>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <a
          href={linkWhatsApp(`Olá, ${lead.nome}! Aqui é da Vertiz Soluções Imobiliárias.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-14 items-center gap-3 rounded-card border border-navy-100 bg-white px-4 transition-colors hover:border-whatsapp"
        >
          <MessageCircle size={18} className="text-whatsapp-dark" aria-hidden />
          <span className="tabular text-sm font-medium text-navy-800">{lead.telefone}</span>
          <ExternalLink size={14} className="ml-auto text-navy-300" aria-hidden />
        </a>

        {lead.email ? (
          <a
            href={`mailto:${lead.email}`}
            className="flex min-h-14 items-center gap-3 rounded-card border border-navy-100 bg-white px-4 transition-colors hover:border-navy-300"
          >
            <Mail size={18} className="text-navy-400" aria-hidden />
            <span className="truncate text-sm text-navy-800">{lead.email}</span>
          </a>
        ) : (
          <p className="flex min-h-14 items-center gap-3 rounded-card border border-dashed border-navy-200 px-4 text-sm text-navy-400">
            <Phone size={18} aria-hidden />
            Sem e-mail cadastrado
          </p>
        )}
      </div>

      {lead.imovel && (
        <section className="mt-4 rounded-card border border-navy-100 bg-white p-5">
          <h2 className="text-xs font-medium uppercase tracking-wider text-navy-400">
            Imóvel de interesse
          </h2>
          <p className="mt-2 font-medium text-navy-800">{lead.imovel.nome_empreendimento}</p>
          <p className="text-sm text-navy-500">{lead.imovel.bairro}</p>
          <Link
            href={`/imoveis/venda/${lead.imovel.slug}`}
            target="_blank"
            className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-sm text-aqua-700 hover:underline"
          >
            Abrir ficha no site
            <ExternalLink size={13} aria-hidden />
          </Link>
        </section>
      )}

      {lead.observacoes && (
        <section className="mt-4 rounded-card border border-navy-100 bg-white p-5">
          <h2 className="text-xs font-medium uppercase tracking-wider text-navy-400">
            Observações
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-navy-700">
            {lead.observacoes}
          </p>
        </section>
      )}

      {lead.motivo_perda && (
        <section className="mt-4 rounded-card border border-red-100 bg-red-50 p-5">
          <h2 className="text-xs font-medium uppercase tracking-wider text-red-500">
            Motivo da perda
          </h2>
          <p className="mt-2 text-sm text-red-800">{lead.motivo_perda}</p>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg">Histórico</h2>
        <NotaForm leadId={lead.id} />

        <ol className="mt-6 space-y-4 border-l border-navy-100 pl-5">
          {eventos.map((evento) => (
            <li key={evento.id} className="relative">
              <span
                className="absolute -left-[1.4rem] top-1.5 h-2 w-2 rounded-full bg-aqua-400"
                aria-hidden
              />
              <p className="text-sm text-navy-700">{descreverEvento(evento)}</p>
              <p className="mt-0.5 text-xs text-navy-400">{formatarData(evento.created_at)}</p>
            </li>
          ))}
          {eventos.length === 0 && (
            <li className="text-sm text-navy-400">Nenhum evento registrado ainda.</li>
          )}
        </ol>
      </section>
    </div>
  )
}
