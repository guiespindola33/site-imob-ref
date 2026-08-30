'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

const schema = z.object({
  email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
  senha: z.string().min(1, 'Informe a senha'),
})

type Campos = z.infer<typeof schema>

const CLASSE_INPUT =
  'min-h-12 w-full rounded-xl border border-navy-200 bg-white px-3.5 text-[0.9375rem] ' +
  'transition-colors focus:border-aqua-500'

export function LoginForm({ destino }: { destino: string }) {
  const router = useRouter()
  const [erro, setErro] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Campos>({ resolver: zodResolver(schema) })

  async function onSubmit(dados: Campos) {
    setErro(null)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: dados.email,
      password: dados.senha,
    })

    if (error) {
      // Mensagem genérica de propósito: distinguir "e-mail não existe" de
      // "senha errada" entrega ao atacante quais e-mails são válidos.
      setErro('E-mail ou senha incorretos.')
      return
    }

    router.push(destino)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-navy-700">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={CLASSE_INPUT}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'erro-email' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p id="erro-email" className="mt-1.5 text-sm text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="senha" className="mb-1.5 block text-sm font-medium text-navy-700">
          Senha
        </label>
        <input
          id="senha"
          type="password"
          autoComplete="current-password"
          className={CLASSE_INPUT}
          aria-invalid={Boolean(errors.senha)}
          aria-describedby={errors.senha ? 'erro-senha' : undefined}
          {...register('senha')}
        />
        {errors.senha && (
          <p id="erro-senha" className="mt-1.5 text-sm text-red-600">
            {errors.senha.message}
          </p>
        )}
      </div>

      {erro && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-xl bg-red-50 px-3.5 py-3 text-sm text-red-700"
        >
          <AlertCircle size={16} aria-hidden />
          {erro}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting && <Loader2 size={16} className="animate-spin" aria-hidden />}
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  )
}
