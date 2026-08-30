/**
 * Constantes institucionais da Vertiz.
 * Fonte única — evita telefone/CRECI espalhados por componentes.
 */

export const VERTIZ = {
  nome: 'Vertiz Soluções Imobiliárias',
  nomeCurto: 'Vertiz',
  creci: process.env.NEXT_PUBLIC_CRECI ?? '21669-J',
  servicos: ['Vende', 'Aluga', 'Administra', 'Escritura'] as const,
  atuacao: 'Grande Recife e Praias — PE',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://instagram.com/vertizsolucoes',
  instagramHandle: '@vertizsolucoes',
  /** Somente dígitos com DDI, formato aceito pelo wa.me */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMERO ?? '5581999416438',
} as const

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

/** Telefone formatado para leitura: (81) 99941-6438 */
export function whatsappFormatado(): string {
  const d = VERTIZ.whatsapp.replace(/\D/g, '')
  const local = d.startsWith('55') ? d.slice(2) : d
  if (local.length !== 11) return VERTIZ.whatsapp
  return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`
}

/**
 * Monta o link do WhatsApp com mensagem pré-preenchida.
 * Todo CTA de imóvel passa por aqui — mensagem consistente em todo o site.
 */
export function linkWhatsApp(mensagem?: string): string {
  const base = `https://wa.me/${VERTIZ.whatsapp.replace(/\D/g, '')}`
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
  return 'Olá! Vim pelo site da Vertiz e gostaria de falar com um corretor.'
}
