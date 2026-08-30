'use client'

import { usePathname } from 'next/navigation'
import { linkWhatsApp, mensagemContatoGeral } from '@/lib/vertiz'

/**
 * Rotas que já têm CTA fixo próprio — dois botões de WhatsApp competiriam.
 * Cobre o catálogo (barra inferior "Filtrar" + WhatsApp) e a ficha do imóvel
 * (CTA "Consultar Disponibilidade").
 */
const OCULTAR_EM = /^\/imoveis(\/|$)/

export function WhatsappFab() {
  const pathname = usePathname()
  if (OCULTAR_EM.test(pathname)) return null

  return (
    <a
      href={linkWhatsApp(mensagemContatoGeral())}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com um corretor no WhatsApp"
      className="fixed bottom-5 right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg shadow-navy-900/20 transition-transform duration-200 ease-soft hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6"
      style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Ícone oficial do WhatsApp em SVG — nada de emoji como ícone. */}
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
        <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35Z" />
        <path d="M12.04 2C6.6 2 2.17 6.43 2.17 11.87c0 1.74.46 3.44 1.32 4.93L2 22l5.35-1.4a9.83 9.83 0 0 0 4.69 1.19h.01c5.43 0 9.86-4.43 9.86-9.87A9.8 9.8 0 0 0 12.04 2Zm0 17.94h-.01a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.1.81.83-3.02-.2-.31a8.13 8.13 0 0 1-1.25-4.34c0-4.52 3.68-8.2 8.2-8.2a8.15 8.15 0 0 1 8.19 8.21c0 4.52-3.68 8.17-8.19 8.17Z" />
      </svg>
    </a>
  )
}
