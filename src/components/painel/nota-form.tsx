'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { adicionarNota } from '@/app/(painel)/crm/actions'

export function NotaForm({ leadId }: { leadId: string }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, startTransition] = useTransition()

  function onSubmit(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro(null)
    const formData = new FormData(evento.currentTarget)

    startTransition(async () => {
      const r = await adicionarNota(formData)
      if (!r.ok) {
        setErro(r.erro ?? 'Não foi possível salvar a observação.')
        return
      }
      formRef.current?.reset()
      router.refresh()
    })
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="mt-4">
      <input type="hidden" name="lead_id" value={leadId} />
      <label htmlFor="descricao" className="sr-only">
        Nova observação
      </label>
      <textarea
        id="descricao"
        name="descricao"
        rows={2}
        maxLength={2000}
        required
        placeholder="Registrar contato, retorno, combinado..."
        className="w-full rounded-xl border border-navy-200 bg-white p-3.5 text-sm transition-colors focus:border-aqua-500"
      />

      {erro && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="mt-2 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-pill bg-navy-800 px-5 text-sm font-medium text-white transition-colors hover:bg-navy-700 disabled:opacity-50"
      >
        {enviando ? (
          <Loader2 size={15} className="animate-spin" aria-hidden />
        ) : (
          <Plus size={15} aria-hidden />
        )}
        Adicionar observação
      </button>
    </form>
  )
}
