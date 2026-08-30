'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { ButtonLink } from '@/components/ui/button'
import { linkWhatsApp, mensagemContatoGeral } from '@/lib/vertiz'
import { cn } from '@/lib/utils/cn'

/**
 * Comprar/Alugar compartilham o prefixo /imoveis — não dá para diferenciar
 * pelo pathname sozinho. Cada link decide sua própria condição de "ativo".
 */
const LINKS = [
  {
    href: '/imoveis?finalidade=venda',
    rotulo: 'Comprar',
    ativo: (p: string, sp: URLSearchParams) => p.startsWith('/imoveis') && sp.get('finalidade') === 'venda',
  },
  {
    href: '/imoveis?finalidade=locacao',
    rotulo: 'Alugar',
    ativo: (p: string, sp: URLSearchParams) => p.startsWith('/imoveis') && sp.get('finalidade') === 'locacao',
  },
  // Sem página própria ainda — "Administra" é um dos 4 serviços do escopo,
  // mas sem conteúdo dedicado. Aponta para Contato até existir uma seção.
  { href: '/contato', rotulo: 'Administração', ativo: (p: string) => p.startsWith('/contato') },
  { href: '/sobre', rotulo: 'Sobre', ativo: (p: string) => p.startsWith('/sobre') },
]

export function SiteHeader() {
  const [aberto, setAberto] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Fecha o menu ao navegar — sem isso o painel fica aberto sobre a página nova.
  useEffect(() => setAberto(false), [pathname])

  // Trava o scroll do fundo enquanto o painel mobile está aberto.
  useEffect(() => {
    document.body.style.overflow = aberto ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [aberto])

  const ativo = (checar: (p: string, sp: URLSearchParams) => boolean) => checar(pathname, searchParams)

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/85 backdrop-blur-md">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Vertiz — página inicial" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={ativo(link.ativo) ? 'page' : undefined}
              className={cn(
                'rounded-pill px-3.5 py-2 text-[0.9375rem] transition-colors duration-200 ease-soft',
                ativo(link.ativo)
                  ? 'bg-navy-50 font-medium text-navy-800'
                  : 'text-navy-500 hover:bg-navy-50 hover:text-navy-800'
              )}
            >
              {link.rotulo}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <ButtonLink
            href={linkWhatsApp(mensagemContatoGeral())}
            externo
            variante="whatsapp"
            tamanho="sm"
          >
            Consultar no WhatsApp
          </ButtonLink>
        </div>

        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          aria-controls="menu-mobile"
          aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-navy-700 transition-colors hover:bg-navy-50 md:hidden"
        >
          {aberto ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
        </button>
      </div>

      {aberto && (
        <div
          id="menu-mobile"
          className="border-t border-navy-100 bg-white md:hidden"
        >
          <nav className="container-app flex flex-col py-2" aria-label="Principal (mobile)">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={ativo(link.ativo) ? 'page' : undefined}
                className={cn(
                  'flex min-h-12 items-center rounded-lg px-3 text-base transition-colors',
                  ativo(link.ativo)
                    ? 'font-medium text-navy-800'
                    : 'text-navy-600 hover:bg-navy-50'
                )}
              >
                {link.rotulo}
              </Link>
            ))}
            <ButtonLink
              href={linkWhatsApp(mensagemContatoGeral())}
              externo
              variante="whatsapp"
              className="my-3"
            >
              Consultar no WhatsApp
            </ButtonLink>
          </nav>
        </div>
      )}
    </header>
  )
}
