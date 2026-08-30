import type { MetadataRoute } from 'next'
import { listarSlugsPublicados } from '@/services/imoveis'
import { siteUrl } from '@/lib/vertiz'
import { slugFinalidade } from '@/types'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()

  const estaticas: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/imoveis`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/sobre`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contato`, changeFrequency: 'monthly', priority: 0.5 },
  ]

  const imoveis = await listarSlugsPublicados()

  return [
    ...estaticas,
    ...imoveis.map((i) => ({
      url: `${base}/imoveis/${slugFinalidade(i.finalidade)}/${i.slug}`,
      lastModified: new Date(i.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
