import { createClient, supabaseConfigurado } from '@/lib/supabase/server'
import { urlFoto } from '@/services/imoveis'
import type { Imovel, ImovelComFotos } from '@/types'

/**
 * Leitura do CMS.
 *
 * Diferente do site público, aqui listamos rascunhos e pausados também. Quem
 * decide o recorte é o RLS: corretor vê os imóveis que cadastrou; gestor vê
 * todos. A consulta não filtra por corretor — se filtrasse, teríamos a regra
 * duplicada em dois lugares e um dia elas divergiriam.
 */
export async function listarImoveisCms(): Promise<ImovelComFotos[]> {
  if (!supabaseConfigurado()) return []

  const supabase = createClient()
  const { data, error } = await supabase
    .from('imoveis')
    .select('*, imovel_fotos(id, storage_path, ordem, legenda, capa)')
    .order('updated_at', { ascending: false })

  if (error) throw new Error(`Falha ao listar imóveis: ${error.message}`)

  return (data ?? []).map((registro) => {
    const { imovel_fotos, ...imovel } = registro as Imovel & {
      imovel_fotos: Array<{
        id: string
        storage_path: string
        ordem: number
        legenda: string | null
        capa: boolean
      }>
    }

    return {
      ...imovel,
      fotos: (imovel_fotos ?? [])
        .sort((a, b) => Number(b.capa) - Number(a.capa) || a.ordem - b.ordem)
        .map((f) => ({
          id: f.id,
          ordem: f.ordem,
          legenda: f.legenda,
          capa: f.capa,
          url: urlFoto(f.storage_path),
        })),
    }
  })
}

export async function buscarImovelCms(id: string): Promise<ImovelComFotos | null> {
  if (!supabaseConfigurado()) return null

  const supabase = createClient()
  const { data, error } = await supabase
    .from('imoveis')
    .select('*, imovel_fotos(id, storage_path, ordem, legenda, capa)')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(`Falha ao carregar imóvel: ${error.message}`)
  if (!data) return null

  const { imovel_fotos, ...imovel } = data as never as Imovel & {
    imovel_fotos: Array<{
      id: string
      storage_path: string
      ordem: number
      legenda: string | null
      capa: boolean
    }>
  }

  return {
    ...imovel,
    fotos: (imovel_fotos ?? [])
      .sort((a, b) => Number(b.capa) - Number(a.capa) || a.ordem - b.ordem)
      .map((f) => ({
        id: f.id,
        ordem: f.ordem,
        legenda: f.legenda,
        capa: f.capa,
        url: urlFoto(f.storage_path),
      })),
  }
}
