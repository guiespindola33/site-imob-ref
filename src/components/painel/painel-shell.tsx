'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  Building2,
  KanbanSquare,
  LogOut,
  Menu,
  UserPlus,
  X,
} from 'lucide-react'
import { Monograma } from '@/components/brand/logo'
import { BuscaGlobal } from '@/components/painel/busca-global'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types'
import { cn } from '@/lib/utils/cn'

const NAV = [
  { href: '/crm', rotulo: 'Pipeline', icone: KanbanSquare, exato: true },
  { href: '/crm/leads/novo', rotulo: 'Adicionar lead', icone: UserPlus },
  { href: '/crm/relatorios', rotulo: 'Relatórios', icone: BarChart3 },
  { href: '/cms/imoveis', rotulo: 'Imóveis', icone: Building2 },
]

export function PainelShell({
  nome,
  role,
  children,
}: {
  nome: string
  role: UserRole
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuAberto, setMenuAberto] = useState(false)

  async function sair() {
    await createClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const ativo = (item: (typeof NAV)[number]) =>
    item.exato ? pathname === item.href : pathname.startsWith(item.href)

  const links = (
    <nav className="space-y-1" aria-label="Painel">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setMenuAberto(false)}
          aria-current={ativo(item) ? 'page' : undefined}
          className={cn(
            'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors duration-200',
            ativo(item)
              ? 'bg-navy-800 font-medium text-white'
              : 'text-navy-200 hover:bg-navy-800/60 hover:text-white'
          )}
        >
          <item.icone size={18} aria-hidden />
          {item.rotulo}
        </Link>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-offwhite lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      {/* ------------------------------------------------------ Sidebar (desktop) */}
      <aside className="hidden bg-navy-900 p-5 lg:flex lg:h-screen lg:flex-col lg:sticky lg:top-0">
        <Link href="/crm" className="flex items-center gap-2.5 px-1">
          <Monograma className="h-8 w-8" />
          <span className="font-display text-base font-semibold text-white">Painel Vertiz</span>
        </Link>

        <div className="mt-7 flex-1">{links}</div>

        <div className="border-t border-navy-800 pt-4">
          <p className="px-3 text-sm font-medium text-white">{nome}</p>
          <p className="px-3 text-xs capitalize text-navy-400">{role}</p>
          <button
            type="button"
            onClick={sair}
            className="mt-2 flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm text-navy-300 transition-colors hover:bg-navy-800 hover:text-white"
          >
            <LogOut size={18} aria-hidden />
            Sair
          </button>
        </div>
      </aside>

      {/* -------------------------------------------------------- Topo (mobile) */}
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-navy-100 bg-white px-4 lg:px-8">
          <button
            type="button"
            onClick={() => setMenuAberto((v) => !v)}
            aria-expanded={menuAberto}
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            className="-ml-2 inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-navy-700 hover:bg-navy-50 lg:hidden"
          >
            {menuAberto ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>

          {/* Busca global do CRM: por nome ou telefone, em qualquer tela */}
          <BuscaGlobal />
        </header>

        {menuAberto && (
          <div className="border-b border-navy-800 bg-navy-900 p-4 lg:hidden">
            {links}
            <button
              type="button"
              onClick={sair}
              className="mt-2 flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm text-navy-300 hover:bg-navy-800 hover:text-white"
            >
              <LogOut size={18} aria-hidden />
              Sair ({nome})
            </button>
          </div>
        )}

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
