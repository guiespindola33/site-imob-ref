import type { Metadata, Viewport } from 'next'
import { DM_Mono, DM_Sans, Instrument_Serif } from 'next/font/google'
import { SITE, siteUrl } from '@/lib/site-config'
import './globals.css'

// UI e corpo de texto.
const sans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

// Títulos editoriais — usado com moderação (hero, título do catálogo), nunca
// em textos de card ou UI.
const editorial = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-editorial',
  display: 'swap',
})

// Labels técnicos: badges, contadores, kickers uppercase com tracking.
const mono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE.nome} — Imóveis no Grande Recife e Praias`,
    template: `%s | ${SITE.nomeCurto}`,
  },
  description:
    'Apartamentos, casas e coberturas à venda e para locação em Boa Viagem, Setúbal e região. ' +
    `${SITE.nome} — CRECI ${SITE.creci}.`,
  applicationName: SITE.nome,
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: SITE.nome,
    images: [{ url: '/logo.jpg', width: 150, height: 150, alt: SITE.nome }],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#0b1b33',
  width: 'device-width',
  initialScale: 1,
  // Zoom nunca é bloqueado — bloquear quebra acessibilidade.
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${sans.variable} ${editorial.variable} ${mono.variable}`}
      // O script abaixo adiciona 'js-reveal' ANTES da hidratação — o React
      // sempre veria isso como divergência do HTML gerado no servidor.
      // A divergência é esperada (o servidor nunca deveria mesmo aplicar essa
      // classe): suprimimos só o aviso, não a lógica.
      suppressHydrationWarning
    >
      <head>
        {/*
          Marca o documento antes da primeira pintura: só então o CSS esconde os
          elementos que o GSAP vai revelar. Sem JS, nada some — o conteúdo
          continua legível e indexável.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('js-reveal')}",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
