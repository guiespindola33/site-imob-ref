import type { Metadata } from 'next'
import { Instagram, MessageCircle, MapPin, Clock } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button'
import { Reveal } from '@/components/motion/reveal'
import {
  VERTIZ,
  linkWhatsApp,
  mensagemContatoGeral,
  whatsappFormatado,
} from '@/lib/vertiz'

export const metadata: Metadata = {
  title: 'Contato',
  description:
    `Fale com a ${VERTIZ.nome} pelo WhatsApp ${whatsappFormatado()} ou pelo Instagram ` +
    `${VERTIZ.instagramHandle}. CRECI ${VERTIZ.creci}.`,
  alternates: { canonical: '/contato' },
}

export default function ContatoPage() {
  return (
    <div className="container-app py-14 sm:py-20">
      <Reveal className="max-w-2xl">
        <h1 className="font-editorial text-[2rem] font-normal sm:text-5xl">Fale com a equipe</h1>
        <p className="mt-4 text-lg leading-relaxed text-navy-500">
          O atendimento acontece direto no WhatsApp, com um corretor da equipe — sem formulário
          e sem fila de espera.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <Reveal className="rounded-card border border-navy-100 bg-white p-7 shadow-card">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-whatsapp/10 text-whatsapp-dark">
            <MessageCircle size={22} aria-hidden />
          </span>
          <h2 className="mt-4 text-xl">WhatsApp</h2>
          <p className="tabular mt-1 text-navy-500">{whatsappFormatado()}</p>
          <p className="mt-3 text-sm leading-relaxed text-navy-500">
            Consultas de disponibilidade, agendamento de visitas e propostas.
          </p>
          <ButtonLink
            href={linkWhatsApp(mensagemContatoGeral())}
            externo
            variante="whatsapp"
            className="mt-5 w-full sm:w-auto"
          >
            Abrir conversa
          </ButtonLink>
        </Reveal>

        <Reveal delay={0.08} className="rounded-card border border-navy-100 bg-white p-7 shadow-card">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
            <Instagram size={22} aria-hidden />
          </span>
          <h2 className="mt-4 text-xl">Instagram</h2>
          <p className="mt-1 text-navy-500">{VERTIZ.instagramHandle}</p>
          <p className="mt-3 text-sm leading-relaxed text-navy-500">
            Lançamentos, oportunidades e novidades do portfólio publicados primeiro por lá.
          </p>
          <ButtonLink
            href={VERTIZ.instagram}
            externo
            variante="contorno"
            className="mt-5 w-full sm:w-auto"
          >
            Seguir no Instagram
          </ButtonLink>
        </Reveal>

        <Reveal delay={0.16} className="rounded-card border border-navy-100 bg-white p-7 shadow-card">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
            <MapPin size={22} aria-hidden />
          </span>
          <h2 className="mt-4 text-xl">Área de atuação</h2>
          <p className="mt-3 text-sm leading-relaxed text-navy-500">
            {VERTIZ.atuacao}, com concentração em Boa Viagem e Setúbal.
          </p>
        </Reveal>

        <Reveal delay={0.24} className="rounded-card border border-navy-100 bg-white p-7 shadow-card">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
            <Clock size={22} aria-hidden />
          </span>
          <h2 className="mt-4 text-xl">Atendimento</h2>
          <p className="mt-3 text-sm leading-relaxed text-navy-500">
            Segunda a sexta, das 8h às 18h. Sábados sob agendamento.
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.16em] text-navy-400">
            CRECI {VERTIZ.creci}
          </p>
        </Reveal>
      </div>
    </div>
  )
}
