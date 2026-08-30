import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/vertiz'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Áreas internas nunca entram no índice.
      disallow: ['/crm', '/cms', '/login', '/api'],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
