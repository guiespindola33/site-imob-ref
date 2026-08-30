const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

const brlCents = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Formata valor em BRL. Retorna null quando não há valor — o chamador decide o fallback. */
export function formatMoeda(valor: number | null | undefined, comCentavos = false): string | null {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return null
  return comCentavos ? brlCents.format(valor) : brl.format(valor)
}

/** Converte string mascarada ("R$ 1.234,56") em número. */
export function parseMoeda(mascara: string): number | null {
  const limpo = mascara.replace(/[̀-ͯ]/g, '')
  if (!limpo) return null
  return Number(limpo) / 100
}

/** Aplica máscara de moeda progressiva enquanto o usuário digita. */
export function maskMoeda(valor: string): string {
  const digitos = valor.replace(/\D/g, '')
  if (!digitos) return ''
  return brlCents.format(Number(digitos) / 100)
}

/** Máscara de telefone brasileiro: (81) 99941-6438 */
export function maskTelefone(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** Apenas dígitos — usado para busca e para montar link de WhatsApp. */
export function soDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

export function formatArea(m2: number | null | undefined): string | null {
  if (m2 === null || m2 === undefined) return null
  const n = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(m2)
  return `${n} m²`
}

/** Gera slug ASCII a partir de texto livre. */
export function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
}
