import Link from 'next/link'
import { ArrowRight, Building2, FileSignature, KeyRound, ClipboardList } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button'
import { ImovelCard } from '@/components/imoveis/imovel-card'
import { Reveal } from '@/components/motion/reveal'
import { StaggerGrid } from '@/components/motion/stagger-grid'
import { HeroIntro } from '@/components/motion/hero-intro'
import { carregarFacetas, listarDestaques } from '@/services/imoveis'
import { VERTIZ, linkWhatsApp, mensagemContatoGeral } from '@/lib/vertiz'

export const revalidate = 300

const SERVICOS = [
  {
    icone: Building2,
    titulo: 'Vende',
    texto: 'Apartamentos, casas e coberturas com avaliação de mercado e divulgação ativa.',
  },
  {
    icone: KeyRound,
    titulo: 'Aluga',
    texto: 'Locação com análise de perfil, contrato e acompanhamento do início ao fim.',
  },
  {
    icone: ClipboardList,
    titulo: 'Administra',
    texto: 'Gestão de contratos, repasses e manutenção sem que o proprietário precise correr atrás.',
  },
  {
    icone: FileSignature,
    titulo: 'Escritura',
    texto: 'Condução da documentação e do registro até a entrega das chaves.',
  },
]

export default async function HomePage() {
  const [destaques, facetas] = await Promise.all([listarDestaques(6), carregarFacetas()])

  const bairros = [...new Set(facetas.map((f) => f.bairro))]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .slice(0, 8)

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-navy-900">
        {/* Malha de gradiente sutil — profundidade sem custo de imagem */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(60% 55% at 15% 0%, rgba(18,165,148,0.22) 0%, transparent 60%),' +
              'radial-gradient(45% 45% at 90% 15%, rgba(74,114,166,0.28) 0%, transparent 65%)',
          }}
        />

        <div className="container-app relative py-16 sm:py-24 lg:py-28">
          <HeroIntro>
            <p
              data-hero
              className="kicker text-xs text-accent-300"
            >
              CRECI {VERTIZ.creci} · {VERTIZ.atuacao}
            </p>

            <h1
              data-hero
              className="mt-5 max-w-3xl font-editorial text-[2.25rem] font-normal leading-[1.1] text-white sm:text-6xl lg:text-7xl"
            >
              O imóvel certo em Boa Viagem, Setúbal e no Grande Recife.
            </h1>

            <p
              data-hero
              className="mt-5 max-w-xl text-base leading-relaxed text-navy-200 sm:text-lg"
            >
              Catálogo com valor à vista, ficha completa e resposta direta no WhatsApp — sem
              formulário no meio do caminho.
            </p>

            <div data-hero className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/imoveis" variante="secundaria" tamanho="lg">
                Ver imóveis disponíveis
                <ArrowRight size={18} aria-hidden />
              </ButtonLink>
              <ButtonLink
                href={linkWhatsApp(mensagemContatoGeral())}
                externo
                variante="contorno"
                tamanho="lg"
                className="border-white/25 bg-white/5 text-white hover:border-white/50 hover:bg-white/10"
              >
                Falar com corretor
              </ButtonLink>
            </div>

            <ul
              data-hero
              className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-navy-300"
            >
              {VERTIZ.servicos.map((s) => (
                <li key={s} className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-400" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
          </HeroIntro>
        </div>
      </section>

      {/* ----------------------------------------------------------- Destaques */}
      <section className="container-app py-14 sm:py-20">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl">Selecionados da semana</h2>
            <p className="mt-2 max-w-md text-navy-500">
              Uma amostra do que está disponível agora. O catálogo completo tem filtros por
              bairro, tipo e faixa de valor.
            </p>
          </div>
          <Link
            href="/imoveis"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-pill px-4 text-sm font-medium text-accent-600 transition-colors hover:bg-accent-50 hover:text-accent-700"
          >
            Ver todos
            <ArrowRight size={16} aria-hidden />
          </Link>
        </Reveal>

        {destaques.length > 0 ? (
          <StaggerGrid className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {destaques.map((imovel, i) => (
              <ImovelCard key={imovel.id} imovel={imovel} prioridade={i < 3} />
            ))}
          </StaggerGrid>
        ) : (
          <p className="mt-8 rounded-card border border-dashed border-navy-200 bg-white p-8 text-center text-navy-400">
            Os imóveis aparecem aqui assim que forem publicados no painel.
          </p>
        )}
      </section>

      {/* ------------------------------------------------------------ Serviços */}
      <section className="border-y border-navy-100 bg-white">
        <div className="container-app py-14 sm:py-20">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl">Quatro frentes, uma imobiliária</h2>
            <p className="mt-2 max-w-lg text-navy-500">
              Da avaliação à escritura, o mesmo time acompanha o processo inteiro.
            </p>
          </Reveal>

          <StaggerGrid className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICOS.map((s) => (
              <div
                key={s.titulo}
                className="rounded-card border border-navy-100 bg-offwhite p-6 transition-colors duration-300 ease-soft hover:border-accent-200 hover:bg-accent-50/40"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy-800 text-white">
                  <s.icone size={20} aria-hidden />
                </span>
                <h3 className="mt-4 text-lg">{s.titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-500">{s.texto}</p>
              </div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* -------------------------------------------------------------- Bairros */}
      {bairros.length > 0 && (
        <section className="container-app py-14 sm:py-20">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl">Onde temos imóveis agora</h2>
            <p className="mt-2 max-w-lg text-navy-500">
              Só aparecem bairros com estoque ativo — nenhum atalho leva a uma busca vazia.
            </p>
          </Reveal>

          <StaggerGrid className="mt-7 flex flex-wrap gap-2.5">
            {bairros.map((bairro) => (
              <Link
                key={bairro}
                href={`/imoveis?bairro=${encodeURIComponent(bairro)}`}
                className="inline-flex min-h-11 items-center rounded-pill border border-navy-200 bg-white px-5 text-sm font-medium text-navy-700 transition-colors duration-200 ease-soft hover:border-accent-400 hover:bg-accent-50 hover:text-accent-700"
              >
                {bairro}
              </Link>
            ))}
          </StaggerGrid>
        </section>
      )}

      {/* ------------------------------------------------------------------ CTA */}
      <section className="container-app pb-16 sm:pb-24">
        <Reveal className="overflow-hidden rounded-card bg-navy-800 px-6 py-12 text-center sm:px-12 sm:py-16">
          <h2 className="mx-auto max-w-xl text-2xl text-white sm:text-3xl">
            Procurando algo que ainda não está no catálogo?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-navy-200">
            Manda o que você precisa no WhatsApp: a equipe busca na carteira e responde com
            opções reais.
          </p>
          <ButtonLink
            href={linkWhatsApp(mensagemContatoGeral())}
            externo
            variante="whatsapp"
            tamanho="lg"
            className="mt-7"
          >
            Falar agora no WhatsApp
          </ButtonLink>
        </Reveal>
      </section>
    </>
  )
}
