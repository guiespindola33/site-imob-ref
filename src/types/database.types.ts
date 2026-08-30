/**
 * Tipos do banco da Vertiz.
 *
 * Escritos à mão a partir de `supabase/migrations/*.sql`, depois cross-checados
 * contra `generate_typescript_types` no projeto real (smoaxeujwcqwpjuteuqr) —
 * batem campo a campo, com uma única divergência intencional:
 *
 * `imoveis.slug` é NOT NULL sem DEFAULT de coluna, então o codegen o marcaria
 * como obrigatório em Insert. Aqui ele fica de fora de propósito: o trigger
 * `gerar_slug_imovel` (BEFORE INSERT) preenche `NEW.slug` antes de a constraint
 * NOT NULL ser checada, e o código nunca envia slug manualmente — ver
 * `src/app/(painel)/cms/actions.ts`. Se um dia o insert passar a enviar slug
 * (ex.: importação em massa), adicionar `'slug'` aos obrigatórios abaixo.
 *
 * Se o schema mudar, prefira regerar e comparar com este arquivo, não
 * sobrescrever cegamente — o Insert de outras tabelas também foi ajustado à
 * mão (ex.: `leads.telefone_digitos`, coluna gerada, nunca é escrita pelo app).
 */

export type UserRole = 'corretor' | 'gestor'

export type TipoImovel =
  | 'apartamento'
  | 'casa'
  | 'cobertura'
  | 'flat'
  | 'sala_comercial'
  | 'loja'
  | 'galpao'
  | 'terreno'
  | 'outro'

export type FinalidadeImovel = 'venda' | 'locacao' | 'venda_locacao'

export type StatusImovel = 'disponivel' | 'reservado' | 'vendido' | 'alugado'

export type EtapaLead =
  | 'captacao'
  | 'qualificacao'
  | 'visita'
  | 'proposta'
  | 'documentacao'
  | 'fechamento'
  | 'pos_venda'
  | 'perdido'

export type OrigemLead = 'site' | 'whatsapp' | 'instagram' | 'indicacao' | 'ligacao' | 'outro'

export type TipoEventoLead = 'etapa' | 'nota' | 'atribuicao' | 'criacao'

type ProfileRow = {
  id: string
  user_id: string
  nome: string
  email: string
  telefone: string | null
  avatar_url: string | null
  role: UserRole
  ativo: boolean
  creci: string | null
  created_at: string
  updated_at: string
}

type ImovelRow = {
  id: string
  created_at: string
  updated_at: string
  corretor_id: string
  nome_empreendimento: string
  slug: string
  tipo_imovel: TipoImovel
  finalidade: FinalidadeImovel
  bairro: string
  cidade: string
  uf: string
  endereco: string | null
  cep: string | null
  area_m2: number | null
  quartos: number | null
  suites: number | null
  banheiros: number | null
  vagas: number | null
  andar: number | null
  mobiliado: boolean
  valor_venda: number | null
  valor_aluguel: number | null
  valor_condominio: number | null
  valor_iptu: number | null
  taxas_inclusas: boolean
  descricao: string | null
  diferenciais: string[]
  proximidades: string[]
  status: StatusImovel
  publicado: boolean
  destaque: boolean
  publicado_em: string | null
}

type ImovelFotoRow = {
  id: string
  imovel_id: string
  storage_path: string
  largura: number | null
  altura: number | null
  ordem: number
  legenda: string | null
  capa: boolean
  created_at: string
}

type LeadRow = {
  id: string
  created_at: string
  updated_at: string
  nome: string
  telefone: string
  telefone_digitos: string
  email: string | null
  imovel_interesse_id: string | null
  origem: OrigemLead
  observacoes: string | null
  etapa: EtapaLead
  corretor_id: string | null
  criado_por: string
  motivo_perda: string | null
  fechado_em: string | null
}

type LeadEventoRow = {
  id: string
  lead_id: string
  usuario_id: string | null
  tipo: TipoEventoLead
  etapa_de: EtapaLead | null
  etapa_para: EtapaLead | null
  descricao: string | null
  created_at: string
}

/**
 * Payload de INSERT: só as colunas realmente obrigatórias no banco são exigidas.
 * Tudo que é nullable ou tem DEFAULT fica opcional, como no tipo gerado pelo CLI.
 */
type Insercao<Row, Obrigatorios extends keyof Row> = Pick<Row, Obrigatorios> &
  Partial<Omit<Row, Obrigatorios>>

/** telefone_digitos é coluna gerada (GENERATED ALWAYS) — o cliente nunca escreve. */
type LeadEscrivel = Omit<LeadRow, 'telefone_digitos'>

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: Insercao<ProfileRow, 'user_id' | 'nome' | 'email'>
        Update: Partial<Omit<ProfileRow, 'id' | 'user_id'>>
        Relationships: []
      }
      imoveis: {
        Row: ImovelRow
        Insert: Insercao<
          ImovelRow,
          'corretor_id' | 'nome_empreendimento' | 'tipo_imovel' | 'bairro'
        >
        Update: Partial<Omit<ImovelRow, 'id'>>
        Relationships: []
      }
      imovel_fotos: {
        Row: ImovelFotoRow
        Insert: Insercao<ImovelFotoRow, 'imovel_id' | 'storage_path'>
        Update: Partial<Omit<ImovelFotoRow, 'id'>>
        Relationships: [
          {
            foreignKeyName: 'imovel_fotos_imovel_id_fkey'
            columns: ['imovel_id']
            isOneToOne: false
            referencedRelation: 'imoveis'
            referencedColumns: ['id']
          },
        ]
      }
      leads: {
        Row: LeadRow
        Insert: Insercao<LeadEscrivel, 'nome' | 'telefone' | 'criado_por'>
        Update: Partial<Omit<LeadEscrivel, 'id'>>
        Relationships: [
          {
            foreignKeyName: 'leads_imovel_interesse_id_fkey'
            columns: ['imovel_interesse_id']
            isOneToOne: false
            referencedRelation: 'imoveis'
            referencedColumns: ['id']
          },
        ]
      }
      lead_eventos: {
        Row: LeadEventoRow
        Insert: Insercao<LeadEventoRow, 'lead_id' | 'tipo'>
        Update: Partial<Omit<LeadEventoRow, 'id'>>
        Relationships: [
          {
            foreignKeyName: 'lead_eventos_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      catalogo_facetas: {
        Row: {
          finalidade: FinalidadeImovel
          tipo_imovel: TipoImovel
          bairro: string
          total: number
          valor_min: number | null
          valor_max: number | null
          quartos_max: number
        }
        Relationships: []
      }
      vw_leads_por_periodo: {
        Row: { mes: string; semana: string; total: number }
        Relationships: []
      }
      vw_conversao: {
        Row: {
          mes: string
          fechados: number
          perdidos: number
          em_andamento: number
          total: number
          taxa_conversao_pct: number | null
        }
        Relationships: []
      }
      vw_leads_por_corretor: {
        Row: {
          corretor_id: string | null
          corretor_nome: string | null
          total: number
          fechados: number
          perdidos: number
          em_andamento: number
        }
        Relationships: []
      }
    }
    Functions: {
      buscar_leads: {
        Args: { termo: string }
        Returns: LeadRow[]
      }
    }
    CompositeTypes: Record<string, never>
    Enums: {
      user_role: UserRole
      tipo_imovel: TipoImovel
      finalidade_imovel: FinalidadeImovel
      status_imovel: StatusImovel
      etapa_lead: EtapaLead
      origem_lead: OrigemLead
      tipo_evento_lead: TipoEventoLead
    }
  }
}
