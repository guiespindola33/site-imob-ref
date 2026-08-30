import type { Metadata } from 'next'
import { ShieldCheck, MapPinned, Handshake } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button'
import { Reveal } from '@/components/motion/reveal'
import { VERTIZ, linkWhatsApp, mensagemContatoGeral } from '@/lib/vertiz'

export const metadata: Metadata = {
  title: 'Sobre a Vertiz',
  description:
    `${VERTIZ.nome} — CRECI ${VERTIZ.creci}. Venda, locação, administração e escritura de ` +
    'imóveis no Grande Recife e nas praias de Pernambuco.',
  alternates: { canonical: '/sobre' },
}

const PILARES = [
  {
    icone: ShieldCheck,
    titulo: 'Registro ativo no CRECI',
    texto: `Atuação regularizada sob o CRECI ${VERTIZ.creci}, com responsabilidade técnica sobre cada negociação.`,
  },
  {
    icone: MapPinned,
    titulo: 'Especialistas na região',
    texto:
      'Boa Viagem, Setúbal e o Grande Recife são o território de trabalho diário da equipe — não uma área de cobertura no mapa.',
  },
  {
    icone: Handshake,
    titulo: 'Do anúncio à escritura',
    texto:
      'A mesma equipe conduz avaliação, visita, proposta, documentação e registro, sem repassar o cliente adiante.',
  },
]

export default function SobrePage() {
  return (
    <>
      <section className="border-b border-navy-100 bg-white">
        <div className="container-app py-14 sm:py-20">
          <Reveal>
            <p className="kicker text-xs text-accent-600">
              CRECI {VERTIZ.creci}
            </p>
            <h1 className="mt-4 max-w-2xl font-editorial text-[2rem] font-normal sm:text-5xl">
              Uma imobiliária que atende como quem mora aqui.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-navy-500">
              A {VERTIZ.nomeCurto} vende, aluga, administra e escritura imóveis no{' '}
              {VERTIZ.atuacao}. O trabalho começa antes do anúncio e continua depois da entrega
              das chaves.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-app py-14 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-3">
          {PILARES.map((p, i) => (
            <Reveal
              key={p.titulo}
              delay={i * 0.08}
              className="rounded-card border border-navy-100 bg-white p-6 shadow-card"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                <p.icone size={20} aria-hidden />
              </span>
              <h2 className="mt-4 text-lg">{p.titulo}</h2>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">{p.texto}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 rounded-card bg-navy-800 px-6 py-12 text-center sm:px-12">
          <h2 className="mx-auto max-w-lg text-2xl text-white sm:text-3xl">
            Quer anunciar seu imóvel com a Vertiz?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-navy-200">
            A equipe avalia o imóvel, define o valor de mercado e cuida da divulgação.
          </p>
          <ButtonLink
            href={linkWhatsApp(mensagemContatoGeral())}
            externo
            variante="whatsapp"
            tamanho="lg"
            className="mt-7"
          >
            Falar com a equipe
          </ButtonLink>
        </Reveal>
      </section>
    </>
  )
}
