import type { Metadata } from 'next'
import { exigirSessao } from '@/lib/auth/sessao'
import { PainelShell } from '@/components/painel/painel-shell'

export const metadata: Metadata = {
  title: { default: 'Painel', template: '%s | Painel Vertiz' },
  // Área interna nunca é indexada, nem se o robots.txt for ignorado.
  robots: { index: false, follow: false, nocache: true },
}

// A sessão é lida a cada request — nada do painel pode ser cacheado estaticamente.
export const dynamic = 'force-dynamic'

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await exigirSessao()

  return (
    <PainelShell nome={profile.nome} role={profile.role}>
      {children}
    </PainelShell>
  )
}
