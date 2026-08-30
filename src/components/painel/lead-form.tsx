'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2 } from 'lucide-react'
import { criarLead } from '@/app/(painel)/crm/actions'
import { Button } from '@/components/ui/button'
import { maskTelefone } from '@/lib/utils/format'
import { ORIGEM_LEAD_LABEL } from '@/types'

const CLASSE_CAMPO =
  'min-h-12 w-full rounded-xl border border-navy-200 bg-white px-3.5 text-[0.9375rem] ' +
  'transition-colors focus:border-aqua-500'

/**
 * Formulário rápido "Adicionar Lead".
 *
 * É a porta de entrada da v1: o lead que chega pelo WhatsApp é registrado aqui
 * pelo corretor ou gestor. Campos mínimos — nome e telefone — para que o
 * cadastro caiba no meio de um atendimento.
 */
export function LeadForm({
  imoveis,
}: {
  imoveis: Array<{ id: string; rotulo: string }>
}) {
  const router = useRouter()
  const [erro, setErro] = useState<string | null>(null)
  const [telefone, setTelefone] = useState('')
  const [enviando, startTransition] = useTransition()

  function onSubmit(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro(null)
    const formData = new FormData(evento.currentTarget)

    startTransition(async () => {
      const r = await criarLead(formData)
      if (!r.ok) {
        setErro(r.erro ?? 'Não foi possível salvar o lead.')
        return
      }
      router.push('/crm')
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="nome" className="mb-1.5 block text-sm font-medium text-navy-700">
            Nome <span className="text-red-500">*</span>
          </label>
          <input id="nome" name="nome" required maxLength={200} className={CLASSE_CAMPO} />
        </div>

        <div>
          <label htmlFor="telefone" className="mb-1.5 block text-sm font-medium text-navy-700">
            Telefone <span className="text-red-500">*</span>
          </label>
          <input
            id="telefone"
            name="telefone"
            required
            inputMode="tel"
            value={telefone}
            onChange={(e) => setTelefone(maskTelefone(e.target.value))}
            placeholder="(81) 99999-9999"
            className={`${CLASSE_CAMPO} tabular`}
          />
          <p className="mt-1.5 text-xs text-navy-400">Mesmo número usado no WhatsApp.</p>
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-navy-700">
            E-mail
          </label>
          <input id="email" name="email" type="email" className={CLASSE_CAMPO} />
        </div>

        <div>
          <label htmlFor="origem" className="mb-1.5 block text-sm font-medium text-navy-700">
            Origem
          </label>
          <select
            id="origem"
            name="origem"
            defaultValue="whatsapp"
            className={`${CLASSE_CAMPO} cursor-pointer`}
          >
            {Object.entries(ORIGEM_LEAD_LABEL).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="imovel_interesse_id"
          className="mb-1.5 block text-sm font-medium text-navy-700"
        >
          Imóvel de interesse
        </label>
        <select
          id="imovel_interesse_id"
          name="imovel_interesse_id"
          defaultValue=""
          className={`${CLASSE_CAMPO} cursor-pointer`}
        >
          <option value="">Nenhum / ainda não definido</option>
          {imoveis.map((i) => (
            <option key={i.id} value={i.id}>
              {i.rotulo}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="observacoes" className="mb-1.5 block text-sm font-medium text-navy-700">
          Observações
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          maxLength={2000}
          placeholder="O que o cliente pediu, faixa de valor, bairro preferido..."
          className="w-full rounded-xl border border-navy-200 bg-white p-3.5 text-[0.9375rem] transition-colors focus:border-aqua-500"
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-navy-100 bg-offwhite p-4">
        <input
          type="checkbox"
          name="assumir"
          value="sim"
          defaultChecked
          className="mt-0.5 h-4 w-4 cursor-pointer accent-aqua-500"
        />
        <span className="text-sm">
          <span className="font-medium text-navy-800">Assumir este lead</span>
          <span className="mt-0.5 block text-navy-500">
            Desmarque para deixá-lo na fila aberta de Captação, disponível para qualquer
            corretor.
          </span>
        </span>
      </label>

      {erro && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle size={16} aria-hidden />
          {erro}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={enviando}>
          {enviando && <Loader2 size={16} className="animate-spin" aria-hidden />}
          {enviando ? 'Salvando...' : 'Salvar lead'}
        </Button>
        <Button
          type="button"
          variante="contorno"
          onClick={() => router.push('/crm')}
          disabled={enviando}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
