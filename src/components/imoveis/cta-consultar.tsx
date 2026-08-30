'use client'

import { MessageCircle } from 'lucide-react'
import { linkWhatsApp, mensagemConsultaImovel } from '@/lib/vertiz'
import { cn } from '@/lib/utils/cn'

interface Props {
  nome: string
  bairro: string
  url: string
  preco: string | null
  precoRotulo: string | null
  /** 'sticky' = barra fixa no rodapé (mobile) · 'painel' = cartão lateral (desktop) */
  modo: 'sticky' | 'painel'
  className?: string
}

/**
 * CTA "Consultar Disponibilidade" — o único caminho de conversão do site.
 *
 * No mobile fica FIXO no rodapé: quase todo o tráfego vem do Instagram/Linktree,
 * e obrigar o usuário a rolar de volta até um botão no meio da página é onde se
 * perde a conversão. O `<body>` reserva a altura da barra (`pb-sticky-cta`) para
 * que ela nunca cubra o fim do conteúdo.
 */
export function CtaConsultar({
  nome,
  bairro,
  url,
  preco,
  precoRotulo,
  modo,
  className,
}: Props) {
  const href = linkWhatsApp(mensagemConsultaImovel({ nome, bairro, url }))

  const botao = (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex min-h-14 flex-1 cursor-pointer items-center justify-center gap-2.5',
        'rounded-pill bg-whatsapp px-6 font-medium text-whatsapp-ink',
        'transition-transform duration-200 ease-soft hover:bg-whatsapp-dark active:scale-[0.98]'
      )}
    >
      <MessageCircle size={20} aria-hidden />
      Consultar disponibilidade
    </a>
  )

  if (modo === 'painel') {
    return (
      <aside
        className={cn(
          'rounded-card border border-navy-100 bg-white p-6 shadow-card',
          className
        )}
      >
        {preco && (
          <p className="tabular text-3xl font-semibold text-navy-800">
            {preco}
            {precoRotulo && (
              <span className="ml-1 text-base font-normal text-navy-400">{precoRotulo}</span>
            )}
          </p>
        )}
        <p className="mt-2 text-sm leading-relaxed text-navy-500">
          A conversa começa direto com um corretor, com o imóvel já identificado.
        </p>
        <div className="mt-5 flex">{botao}</div>
      </aside>
    )
  }

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 bg-white/95 backdrop-blur-md shadow-sticky safe-bottom',
        className
      )}
    >
      <div className="container-app flex items-center gap-3 py-3">
        {preco && (
          <div className="min-w-0 shrink-0">
            <p className="kicker text-[0.6875rem] text-navy-400">
              {precoRotulo === '/mês' ? 'Aluguel' : 'Valor'}
            </p>
            <p className="tabular truncate text-lg font-semibold leading-tight text-navy-800">
              {preco}
            </p>
          </div>
        )}
        {botao}
      </div>
    </div>
  )
}
