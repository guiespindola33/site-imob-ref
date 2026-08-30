'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd'
import { AlertCircle, Hand, Phone } from 'lucide-react'
import { assumirLead, moverLead } from '@/app/(painel)/crm/actions'
import { ETAPAS_PIPELINE, ETAPA_LEAD_LABEL, ORIGEM_LEAD_LABEL } from '@/types'
import type { EtapaLead, LeadComRelacoes } from '@/types'
import { cn } from '@/lib/utils/cn'

const COLUNAS: EtapaLead[] = [...ETAPAS_PIPELINE, 'perdido']

const COR_COLUNA: Partial<Record<EtapaLead, string>> = {
  captacao: 'bg-aqua-500',
  fechamento: 'bg-emerald-500',
  pos_venda: 'bg-navy-400',
  perdido: 'bg-red-400',
}

export function Kanban({
  inicial,
  usuarioId,
}: {
  inicial: Record<EtapaLead, LeadComRelacoes[]>
  usuarioId: string
}) {
  const router = useRouter()
  const [colunas, setColunas] = useState(inicial)
  const [erro, setErro] = useState<string | null>(null)
  const [perdaPendente, setPerdaPendente] = useState<{ id: string; de: EtapaLead } | null>(null)
  const [motivo, setMotivo] = useState('')
  const [, startTransition] = useTransition()

  function mover(leadId: string, de: EtapaLead, para: EtapaLead) {
    // Atualização otimista: o card muda de coluna na hora e volta se o servidor recusar.
    const anterior = colunas
    const lead = colunas[de].find((l) => l.id === leadId)
    if (!lead) return

    setColunas({
      ...colunas,
      [de]: colunas[de].filter((l) => l.id !== leadId),
      [para]: [{ ...lead, etapa: para }, ...colunas[para]],
    })

    startTransition(async () => {
      const r = await moverLead({ id: leadId, etapa: para, motivo_perda: motivo || undefined })
      if (!r.ok) {
        setColunas(anterior)
        setErro(r.erro ?? 'Não foi possível mover o lead.')
      } else {
        setErro(null)
        router.refresh()
      }
    })
  }

  function onDragEnd(resultado: DropResult) {
    const { source, destination, draggableId } = resultado
    if (!destination) return

    const de = source.droppableId as EtapaLead
    const para = destination.droppableId as EtapaLead
    if (de === para) return

    // 'perdido' exige motivo — abre o diálogo antes de efetivar o movimento.
    if (para === 'perdido') {
      setPerdaPendente({ id: draggableId, de })
      setMotivo('')
      return
    }

    mover(draggableId, de, para)
  }

  function confirmarPerda() {
    if (!perdaPendente || !motivo.trim()) return
    const { id, de } = perdaPendente
    setPerdaPendente(null)
    mover(id, de, 'perdido')
  }

  function assumir(id: string) {
    startTransition(async () => {
      const r = await assumirLead(id)
      if (!r.ok) setErro(r.erro ?? 'Não foi possível assumir o lead.')
      else router.refresh()
    })
  }

  return (
    <>
      {erro && (
        <p
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle size={16} aria-hidden />
          {erro}
        </p>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        {/* Rolagem horizontal fica contida na faixa do quadro — o body nunca rola de lado. */}
        <div className="-mx-4 overflow-x-auto px-4 pb-4 lg:-mx-8 lg:px-8">
          <div className="flex min-w-max gap-4">
            {COLUNAS.map((etapa) => (
              <Droppable droppableId={etapa} key={etapa}>
                {(provided, snapshot) => (
                  <section
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'flex w-72 shrink-0 flex-col rounded-card border bg-navy-50/50 p-3 transition-colors',
                      snapshot.isDraggingOver
                        ? 'border-aqua-400 bg-aqua-50/60'
                        : 'border-navy-100'
                    )}
                  >
                    <header className="mb-3 flex items-center gap-2 px-1">
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full',
                          COR_COLUNA[etapa] ?? 'bg-navy-300'
                        )}
                        aria-hidden
                      />
                      <h2 className="text-sm font-semibold text-navy-700">
                        {ETAPA_LEAD_LABEL[etapa]}
                      </h2>
                      <span className="tabular ml-auto rounded-pill bg-white px-2 py-0.5 text-xs text-navy-500">
                        {colunas[etapa].length}
                      </span>
                    </header>

                    <div className="flex flex-1 flex-col gap-2">
                      {colunas[etapa].map((lead, indice) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={indice}>
                          {(drag, snap) => (
                            <article
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              className={cn(
                                'rounded-xl border border-navy-100 bg-white p-3 shadow-sm transition-shadow',
                                snap.isDragging && 'shadow-card-hover'
                              )}
                            >
                              <Link
                                href={`/crm/leads/${lead.id}`}
                                className="block text-sm font-medium text-navy-800 hover:text-aqua-700"
                              >
                                {lead.nome}
                              </Link>

                              <p className="tabular mt-1 flex items-center gap-1.5 text-xs text-navy-400">
                                <Phone size={12} aria-hidden />
                                {lead.telefone}
                              </p>

                              {lead.imovel && (
                                <p className="mt-2 truncate rounded-lg bg-navy-50 px-2 py-1 text-xs text-navy-600">
                                  {lead.imovel.nome_empreendimento}
                                </p>
                              )}

                              <div className="mt-2.5 flex items-center justify-between gap-2">
                                <span className="rounded-pill bg-offwhite px-2 py-0.5 text-[0.6875rem] text-navy-500">
                                  {ORIGEM_LEAD_LABEL[lead.origem]}
                                </span>

                                {lead.corretor_id === null ? (
                                  <button
                                    type="button"
                                    onClick={() => assumir(lead.id)}
                                    className="inline-flex cursor-pointer items-center gap-1 rounded-pill bg-aqua-50 px-2.5 py-1 text-[0.6875rem] font-medium text-aqua-700 transition-colors hover:bg-aqua-100"
                                  >
                                    <Hand size={11} aria-hidden />
                                    Assumir
                                  </button>
                                ) : (
                                  <span className="truncate text-[0.6875rem] text-navy-400">
                                    {lead.corretor_id === usuarioId
                                      ? 'Você'
                                      : (lead.corretor?.nome ?? 'Atribuído')}
                                  </span>
                                )}
                              </div>
                            </article>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {colunas[etapa].length === 0 && (
                        <p className="rounded-xl border border-dashed border-navy-200 px-3 py-6 text-center text-xs text-navy-300">
                          Sem leads
                        </p>
                      )}
                    </div>
                  </section>
                )}
              </Droppable>
            ))}
          </div>
        </div>
      </DragDropContext>

      {/* Diálogo de motivo da perda — o relatório de conversão depende deste campo */}
      {perdaPendente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-perda"
            className="w-full max-w-sm rounded-card bg-white p-6 shadow-xl"
          >
            <h2 id="titulo-perda" className="text-lg">
              Por que o lead foi perdido?
            </h2>
            <p className="mt-1.5 text-sm text-navy-500">
              O motivo alimenta o relatório de conversão.
            </p>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              autoFocus
              maxLength={500}
              className="mt-4 w-full rounded-xl border border-navy-200 p-3 text-sm focus:border-aqua-500"
              placeholder="Ex.: fechou com outra imobiliária"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPerdaPendente(null)}
                className="min-h-11 cursor-pointer rounded-pill px-4 text-sm text-navy-500 hover:bg-navy-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarPerda}
                disabled={!motivo.trim()}
                className="min-h-11 cursor-pointer rounded-pill bg-navy-800 px-5 text-sm font-medium text-white hover:bg-navy-700 disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
