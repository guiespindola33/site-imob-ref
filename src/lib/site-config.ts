/**
 * Constantes institucionais do site — template genérico.
 * Fonte única — evita telefone/CRECI espalhados por componentes.
 *
 * Preencha com os dados reais do cliente antes de publicar (via env vars
 * ou substituindo os valores padrão abaixo).
 */

export const SITE = {
  nome: process.env.NEXT_PUBLIC_SITE_NOME ?? 'Sua Imobiliária',
  nomeCurto: process.env.NEXT_PUBLIC_SITE_NOME_CURTO ?? 'Imobiliária',
  creci: process.env.NEXT_PUBLIC_CRECI ?? '00000-X',
  servicos: ['Vende', 'Aluga', 'Administra', 'Escritura'] as const,
  atuacao: process.env.NEXT_PUBLIC_ATUACAO ?? 'sua região',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://instagram.com/',
  instagramHandle: process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? '@sua_imobiliaria',
  /** Somente dígitos com DDI, formato aceito pelo wa.me */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMERO ?? '5500000000000',
} as const

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

/** Telefone formatado para leitura: (00) 00000-0000 */
export function whatsappFormatado(): string {
  const d = SITE.whatsapp.replace(/\D/g, '')
  const local = d.startsWith('55') ? d.slice(2) : d
  if (local.length !== 11) return SITE.whatsapp
  return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`
}

/**
 * Monta o link do WhatsApp com mensagem pré-preenchida.
 * Todo CTA de imóvel passa por aqui — mensagem consistente em todo o site.
 */
export function linkWhatsApp(mensagem?: string): string {
  const base = `https://wa.me/${SITE.whatsapp.replace(/\D/g, '')}`
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base
}

export function mensagemConsultaImovel(params: {
  nome: string
  bairro: string
  url: string
}): string {
  return `Olá! Quero consultar a disponibilidade do imóvel ${params.nome} — ${params.bairro}. ${params.url}`
}

export function mensagemContatoGeral(): string {
  return `Olá! Vim pelo site da ${SITE.nomeCurto} e gostaria de falar com um corretor.`
}
