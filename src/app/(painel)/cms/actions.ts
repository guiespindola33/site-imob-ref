'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { exigirSessao } from '@/lib/auth/sessao'
import type { ResultadoAcao } from '@/app/(painel)/crm/actions'

/**
 * Server Actions do CMS de imóveis.
 *
 * Como no CRM: sessão revalidada a cada chamada, entrada validada por Zod e
 * escrita com o client do usuário — o RLS é quem autoriza. Nenhuma destas
 * funções usa service role.
 */

const TIPOS = [
  'apartamento',
  'casa',
  'cobertura',
  'flat',
  'sala_comercial',
  'loja',
  'galpao',
  'terreno',
  'outro',
] as const

/** Campo numérico opcional vindo de <input>: '' vira null, não 0. */
const numeroOpcional = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === '' || v === null) return null
    const n = typeof v === 'number' ? v : Number(String(v).replace(/[^\d,.-]/g, '').replace(',', '.'))
    return Number.isFinite(n) ? n : null
  })

/** Lista separada por vírgula ou quebra de linha -> text[] */
const listaTexto = z
  .string()
  .optional()
  .transform((v) =>
    (v ?? '')
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 30)
  )

const imovelSchema = z
  .object({
    id: z.string().uuid().optional().or(z.literal('')),
    nome_empreendimento: z.string().trim().min(2, 'Informe o nome do empreendimento').max(200),
    tipo_imovel: z.enum(TIPOS),
    finalidade: z.enum(['venda', 'locacao', 'venda_locacao']),
    bairro: z.string().trim().min(2, 'Informe o bairro').max(100),
    cidade: z.string().trim().min(2).max(100).default('Recife'),
    uf: z.string().trim().length(2).default('PE'),
    endereco: z.string().trim().max(300).optional().or(z.literal('')),
    cep: z.string().trim().max(9).optional().or(z.literal('')),

    area_m2: numeroOpcional,
    quartos: numeroOpcional,
    suites: numeroOpcional,
    banheiros: numeroOpcional,
    vagas: numeroOpcional,
    andar: numeroOpcional,
    mobiliado: z.coerce.boolean().default(false),

    valor_venda: numeroOpcional,
    valor_aluguel: numeroOpcional,
    valor_condominio: numeroOpcional,
    valor_iptu: numeroOpcional,
    taxas_inclusas: z.coerce.boolean().default(false),

    descricao: z.string().trim().max(5000).optional().or(z.literal('')),
    diferenciais: listaTexto,
    proximidades: listaTexto,

    status: z.enum(['disponivel', 'reservado', 'vendido', 'alugado']).default('disponivel'),
    publicado: z.coerce.boolean().default(false),
    destaque: z.coerce.boolean().default(false),
  })
  // Espelha a constraint chk_valor_por_finalidade do banco. O banco é a
  // garantia; esta checagem só existe para dar uma mensagem legível.
  .refine(
    (d) =>
      !d.publicado ||
      (d.finalidade === 'venda' && d.valor_venda !== null) ||
      (d.finalidade === 'locacao' && d.valor_aluguel !== null) ||
      (d.finalidade === 'venda_locacao' && d.valor_venda !== null && d.valor_aluguel !== null),
    { message: 'Para publicar, informe o valor correspondente à finalidade escolhida.' }
  )
  .refine((d) => d.suites === null || d.quartos === null || d.suites <= d.quartos, {
    message: 'O número de suítes não pode ser maior que o de quartos.',
  })

export async function salvarImovel(formData: FormData): Promise<ResultadoAcao> {
  const sessao = await exigirSessao()

  // Checkboxes não enviam nada quando desmarcados — normaliza antes do Zod.
  const bruto = Object.fromEntries(formData)
  for (const campo of ['mobiliado', 'taxas_inclusas', 'publicado', 'destaque']) {
    bruto[campo] = formData.get(campo) === 'on' || formData.get(campo) === 'true' ? 'true' : ''
  }

  const parsed = imovelSchema.safeParse(bruto)
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }
  const { id, ...dados } = parsed.data

  const supabase = createClient()

  if (id) {
    const { error } = await supabase.from('imoveis').update(dados).eq('id', id)
    if (error) return { ok: false, erro: error.message }

    revalidatePath('/cms/imoveis')
    revalidatePath('/imoveis')
    return { ok: true, id }
  }

  const { data, error } = await supabase
    .from('imoveis')
    .insert({ ...dados, corretor_id: sessao.userId })
    .select('id')
    .single()

  if (error) return { ok: false, erro: error.message }

  revalidatePath('/cms/imoveis')
  revalidatePath('/imoveis')
  return { ok: true, id: data.id }
}

/** Botão liga/desliga da listagem: publica ou pausa o imóvel. */
export async function alternarPublicacao(id: string, publicado: boolean): Promise<ResultadoAcao> {
  await exigirSessao()

  if (!z.string().uuid().safeParse(id).success) return { ok: false, erro: 'Imóvel inválido' }

  const supabase = createClient()
  const { error } = await supabase.from('imoveis').update({ publicado }).eq('id', id)

  if (error) {
    // A constraint do banco recusa publicar sem valor coerente com a finalidade.
    return {
      ok: false,
      erro: error.message.includes('chk_valor_por_finalidade')
        ? 'Informe o valor correspondente à finalidade antes de publicar.'
        : error.message,
    }
  }

  revalidatePath('/cms/imoveis')
  revalidatePath('/imoveis')
  revalidatePath('/')
  return { ok: true }
}

const fotoSchema = z.object({
  imovel_id: z.string().uuid(),
  storage_path: z.string().min(1).max(400),
  largura: z.number().int().positive().optional(),
  altura: z.number().int().positive().optional(),
  ordem: z.number().int().min(0).max(100),
  capa: z.boolean().default(false),
})

/** Registra no banco uma foto já enviada ao Storage pelo navegador. */
export async function registrarFoto(input: z.input<typeof fotoSchema>): Promise<ResultadoAcao> {
  await exigirSessao()

  const parsed = fotoSchema.safeParse(input)
  if (!parsed.success) return { ok: false, erro: 'Dados da foto inválidos' }

  const supabase = createClient()
  const { error } = await supabase.from('imovel_fotos').insert(parsed.data)
  if (error) return { ok: false, erro: error.message }

  revalidatePath(`/cms/imoveis/${parsed.data.imovel_id}`)
  return { ok: true }
}

export async function removerFoto(fotoId: string): Promise<ResultadoAcao> {
  await exigirSessao()

  if (!z.string().uuid().safeParse(fotoId).success) return { ok: false, erro: 'Foto inválida' }

  const supabase = createClient()

  // Busca o caminho antes de apagar a linha: sem isso o arquivo ficaria órfão
  // no Storage, ocupando espaço para sempre.
  const { data: foto } = await supabase
    .from('imovel_fotos')
    .select('storage_path, imovel_id')
    .eq('id', fotoId)
    .maybeSingle()

  const { error } = await supabase.from('imovel_fotos').delete().eq('id', fotoId)
  if (error) return { ok: false, erro: error.message }

  if (foto) {
    await supabase.storage.from('imoveis').remove([foto.storage_path])
    revalidatePath(`/cms/imoveis/${foto.imovel_id}`)
  }

  return { ok: true }
}
