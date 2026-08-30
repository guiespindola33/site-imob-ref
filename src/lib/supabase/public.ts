import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * Client anônimo sem cookies — para leituras que rodam fora de um request
 * (build time / ISR): `generateStaticParams`, `sitemap.ts`. Essas funções não
 * têm contexto de requisição, então o client de `lib/supabase/server.ts`
 * (que chama `cookies()` do `next/headers`) derruba o build com
 * "cookies was called outside a request scope".
 *
 * Só serve para dados já públicos via RLS (imóveis publicados) — nunca usar
 * onde a resposta deveria variar por usuário logado.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
