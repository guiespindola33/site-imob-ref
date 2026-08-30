import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'

export interface Sessao {
  userId: string
  profile: Profile
}

/**
 * Usuário autenticado + perfil.
 *
 * `cache` deduplica a chamada dentro do mesmo render: layout, página e
 * componentes podem pedir a sessão sem multiplicar round-trips.
 *
 * Usa getUser() (valida o token no servidor do Supabase) e nunca getSession(),
 * que apenas lê o cookie local e pode ser forjado.
 */
export const obterSessao = cache(async (): Promise<Sessao | null> => {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile || !profile.ativo) return null

  return { userId: user.id, profile }
})

/** Exige sessão válida. Redireciona para o login preservando o destino. */
export async function exigirSessao(destino?: string): Promise<Sessao> {
  const sessao = await obterSessao()
  if (!sessao) {
    redirect(destino ? `/login?redirect=${encodeURIComponent(destino)}` : '/login')
  }
  return sessao
}

/** Exige papel de gestor. Corretor cai em 404 — não revela a existência da tela. */
export async function exigirGestor(): Promise<Sessao> {
  const sessao = await exigirSessao()
  if (sessao.profile.role !== 'gestor') {
    const { notFound } = await import('next/navigation')
    notFound()
  }
  return sessao
}
