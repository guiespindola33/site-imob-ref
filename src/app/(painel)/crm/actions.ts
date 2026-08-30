'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { exigirSessao } from '@/lib/auth/sessao'
import { soDigitos } from '@/lib/utils/format'

/**
 * Server Actions do CRM.
 *
 * Regras que valem para todas:
 * - Server Action é um endpoint HTTP público. Cada uma revalida a sessão; não
 *   se assume nada por o botão só aparecer para quem tem permissão.
 * - Escrevem com o client normal (anon + cookie do usuário), nunca com service
 *   role: quem decide se a operação é permitida é o RLS.
 * - Toda entrada passa por Zod antes de tocar o banco.
 */

const ETAPAS = [
  'captacao',
  'qualificacao',
  'visita',
  'proposta',
  'documentacao',
  'fechamento',
  'pos_venda',
  'perdido',
] as const

export interface ResultadoAcao {
  ok: boolean
  erro?: string
  id?: string
}

const leadSchema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome do lead').max(200),
  telefone: z
    .string()
    .trim()
    .transform(soDigitos)
    .refine((v) => v.length >= 10 && v.length <= 13, 'Telefone inválido'),
  email: z.string().trim().email('E-mail inválido').max(255).optional().or(z.literal('')),
  origem: z.enum(['site', 'whatsapp', 'instagram', 'indicacao', 'ligacao', 'outro']),
  imovel_interesse_id: z.string().uuid().optional().or(z.literal('')),
  observacoes: z.string().trim().max(2000).optional().or(z.literal('')),
  assumir: z.enum(['sim', 'nao']).default('nao'),
})

/** Cria o lead que chegou pelo WhatsApp — entrada manual da v1. */
export async function criarLead(formData: FormData): Promise<ResultadoAcao> {
  const sessao = await exigirSessao()

  const parsed = leadSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }
  const dados = parsed.data

  const supabase = createClient()
  const { data, error } = await supabase
    .from('leads')
    .insert({
      nome: dados.nome,
      telefone: dados.telefone,
      email: dados.email || null,
      origem: dados.origem,
      imovel_interesse_id: dados.imovel_interesse_id || null,
      observacoes: dados.observacoes || null,
      etapa: 'captacao',
      // Sem "assumir", o lead entra na fila aberta de Captação, sem dono.
      corretor_id: dados.assumir === 'sim' ? sessao.userId : null,
      criado_por: sessao.userId,
    })
    .select('id')
    .single()

  if (error) return { ok: false, erro: error.message }

  revalidatePath('/crm')
  return { ok: true, id: data.id }
}

const moverSchema = z.object({
  id: z.string().uuid(),
  etapa: z.enum(ETAPAS),
  motivo_perda: z.string().trim().max(500).optional(),
})

/** Move o lead entre colunas do Kanban. */
export async function moverLead(input: {
  id: string
  etapa: string
  motivo_perda?: string
}): Promise<ResultadoAcao> {
  const sessao = await exigirSessao()

  const parsed = moverSchema.safeParse(input)
  if (!parsed.success) return { ok: false, erro: 'Movimento inválido' }
  const { id, etapa, motivo_perda } = parsed.data

  // O banco exige motivo em 'perdido' (constraint chk_motivo_perda). Barrar aqui
  // devolve uma mensagem útil em vez de um erro cru do Postgres.
  if (etapa === 'perdido' && !motivo_perda?.trim()) {
    return { ok: false, erro: 'Informe o motivo da perda para mover o lead.' }
  }

  const supabase = createClient()

  // Fila aberta só existe em Captação (constraint chk_fila_aberta): tirar um
  // lead sem dono de lá implica assumi-lo. Sem isto, arrastar um card da fila
  // falharia tanto na constraint quanto no WITH CHECK da policy do corretor.
  const { data: atual } = await supabase
    .from('leads')
    .select('corretor_id')
    .eq('id', id)
    .maybeSingle()

  if (!atual) return { ok: false, erro: 'Lead não encontrado.' }

  const assumeAgora = atual.corretor_id === null && etapa !== 'captacao'

  const { error } = await supabase
    .from('leads')
    .update({
      etapa,
      motivo_perda: etapa === 'perdido' ? motivo_perda!.trim() : null,
      ...(assumeAgora ? { corretor_id: sessao.userId } : {}),
    })
    .eq('id', id)

  if (error) return { ok: false, erro: error.message }

  revalidatePath('/crm')
  revalidatePath(`/crm/leads/${id}`)
  return { ok: true }
}

/** Corretor assume um lead da fila aberta de Captação. */
export async function assumirLead(id: string): Promise<ResultadoAcao> {
  const sessao = await exigirSessao()

  if (!z.string().uuid().safeParse(id).success) return { ok: false, erro: 'Lead inválido' }

  const supabase = createClient()
  const { error } = await supabase
    .from('leads')
    .update({ corretor_id: sessao.userId })
    .eq('id', id)
    // Só assume o que está sem dono: se dois corretores clicarem ao mesmo
    // tempo, o segundo não sobrescreve o primeiro.
    .is('corretor_id', null)

  if (error) return { ok: false, erro: error.message }

  revalidatePath('/crm')
  revalidatePath(`/crm/leads/${id}`)
  return { ok: true }
}

const notaSchema = z.object({
  lead_id: z.string().uuid(),
  descricao: z.string().trim().min(1, 'Escreva a observação').max(2000),
})

export async function adicionarNota(formData: FormData): Promise<ResultadoAcao> {
  const sessao = await exigirSessao()

  const parsed = notaSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const supabase = createClient()
  const { error } = await supabase.from('lead_eventos').insert({
    lead_id: parsed.data.lead_id,
    usuario_id: sessao.userId,
    tipo: 'nota',
    descricao: parsed.data.descricao,
  })

  if (error) return { ok: false, erro: error.message }

  revalidatePath(`/crm/leads/${parsed.data.lead_id}`)
  return { ok: true }
}
