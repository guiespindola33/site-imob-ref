import Link from 'next/link'
import { Instagram, MapPin, MessageCircle } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { VERTIZ, linkWhatsApp, mensagemContatoGeral, whatsappFormatado } from '@/lib/vertiz'

export function SiteFooter() {
  const ano = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t border-navy-800/40 bg-navy-900 text-navy-100">
      <div className="container-app grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo invertido />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-200">
            {VERTIZ.servicos.join(' · ')}. Atuação no {VERTIZ.atuacao}, com forte presença em
            Boa Viagem e Setúbal.
          </p>
          <p className="kicker mt-4 text-xs text-navy-300">CRECI {VERTIZ.creci}</p>
        </div>

        <nav aria-label="Navegação do rodapé">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
            Navegação
          </h2>
          <ul className="mt-4 space-y-1 text-sm">
            {[
              { href: '/imoveis', rotulo: 'Todos os imóveis' },
              { href: '/imoveis?finalidade=venda', rotulo: 'À venda' },
              { href: '/imoveis?finalidade=locacao', rotulo: 'Para alugar' },
              { href: '/sobre', rotulo: 'Sobre a Vertiz' },
              { href: '/contato', rotulo: 'Contato' },
            ].map((l) => (
              <li key={l.rotulo}>
                <Link
                  href={l.href}
                  className="inline-flex min-h-10 items-center text-navy-200 transition-colors hover:text-white"
                >
                  {l.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
            Contato
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href={linkWhatsApp(mensagemContatoGeral())}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center gap-2 text-navy-200 transition-colors hover:text-white"
              >
                <MessageCircle size={16} aria-hidden />
                {whatsappFormatado()}
              </a>
            </li>
            <li>
              <a
                href={VERTIZ.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center gap-2 text-navy-200 transition-colors hover:text-white"
              >
                <Instagram size={16} aria-hidden />
                {VERTIZ.instagramHandle}
              </a>
            </li>
            <li className="flex items-start gap-2 pt-1 text-navy-200">
              <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden />
              <span>{VERTIZ.atuacao}</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
            Atendimento
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-navy-200">
            Consultas de disponibilidade, visitas e propostas são atendidas diretamente pelo
            WhatsApp com um corretor da equipe.
          </p>
        </div>
      </div>

      <div className="border-t border-navy-800">
        <div className="container-app flex flex-col gap-2 py-6 text-xs text-navy-300 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {ano} {VERTIZ.nome}. Todos os direitos reservados.
          </p>
          <p>CRECI {VERTIZ.creci}</p>
        </div>
      </div>
    </footer>
  )
}
