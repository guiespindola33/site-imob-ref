import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/painel/login-form'
import { Logo } from '@/components/brand/logo'

export const metadata: Metadata = {
  title: 'Entrar',
  robots: { index: false, follow: false },
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string }
}) {
  // Só aceita caminho interno: `?redirect=https://site-malicioso` seria
  // um open redirect usando o login da Vertiz como trampolim.
  const destinoBruto = searchParams.redirect ?? '/crm'
  const destino =
    destinoBruto.startsWith('/') && !destinoBruto.startsWith('//') ? destinoBruto : '/crm'

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-900 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Link href="/" aria-label="Voltar ao site">
            <Logo invertido />
          </Link>
        </div>

        <div className="mt-8 rounded-card bg-white p-7 shadow-xl">
          <h1 className="text-xl">Acesso interno</h1>
          <p className="mt-1.5 text-sm text-navy-500">
            Painel de imóveis e CRM da equipe Vertiz.
          </p>
          <LoginForm destino={destino} />
        </div>

        <p className="mt-6 text-center text-sm text-navy-300">
          <Link href="/" className="underline-offset-4 hover:text-white hover:underline">
            Voltar para o site
          </Link>
        </p>
      </div>
    </main>
  )
}
