import { Suspense } from 'react'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { WhatsappFab } from '@/components/layout/whatsapp-fab'

// Mesma altura do header real (h-16) — evita salto de layout enquanto o
// Suspense resolve. SiteHeader usa useSearchParams() (para saber se "Comprar"
// ou "Alugar" está ativo) e o App Router exige boundary em volta disso, senão
// a página inteira perde a pré-renderização estática.
function HeaderFallback() {
  return <div className="h-16 border-b border-navy-100 bg-white" />
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-navy-800 focus:px-5 focus:py-3 focus:text-white"
      >
        Pular para o conteúdo
      </a>
      <Suspense fallback={<HeaderFallback />}>
        <SiteHeader />
      </Suspense>
      <main id="conteudo">{children}</main>
      <SiteFooter />
      <WhatsappFab />
    </>
  )
}
