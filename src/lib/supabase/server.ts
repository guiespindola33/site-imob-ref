import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

/**
 * Indica se o projeto Supabase já está configurado no ambiente.
 *
 * Enquanto o banco dedicado da Vertiz não existe, o site precisa subir e ser
 * navegável. As telas usam isto para mostrar estado vazio em vez de estourar.
 */
export function supabaseConfigurado(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

/**
 * Client Supabase para Server Components / Route Handlers.
 * Continua respeitando RLS: age como o usuário logado (ou anônimo).
 */
export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Server Component não pode escrever cookie — o middleware renova a sessão.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // idem
          }
        },
      },
    }
  )
}
