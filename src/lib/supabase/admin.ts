import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * Client com service role — BYPASSA RLS COMPLETAMENTE.
 *
 * Regras de uso:
 * - Só em Route Handlers / Server Actions / Server Components.
 * - Nunca importar em Client Component (`server-only` quebra o build se tentarem).
 * - Sempre validar entrada e autorizar o usuário ANTES de usar.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY ausente no ambiente do servidor.')
  }

  return createSupabaseClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
