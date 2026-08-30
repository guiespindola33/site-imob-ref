import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Renova a sessão do Supabase e protege as áreas internas.
 *
 * O middleware é a primeira barreira, não a única: quem tenta ler dados sem
 * sessão ainda esbarra no RLS. Aqui evitamos apenas que a tela interna chegue a
 * renderizar para quem não está logado.
 */
const ROTAS_PROTEGIDAS = ['/crm', '/cms']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Sem Supabase configurado (ambiente de desenvolvimento antes do banco
  // existir), o middleware roda em TODA requisição e derrubaria o site inteiro
  // ao tentar criar o client. O site público continua navegável; a área interna
  // vai para o login, que também não terá como autenticar.
  if (!url || !anonKey) {
    const protegidaSemBanco = ROTAS_PROTEGIDAS.some((rota) =>
      request.nextUrl.pathname.startsWith(rota)
    )
    if (protegidaSemBanco) {
      const destino = request.nextUrl.clone()
      destino.pathname = '/login'
      destino.search = ''
      return NextResponse.redirect(destino)
    }
    return response
  }

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // getUser() revalida o token no servidor do Supabase.
  // getSession() apenas lê o cookie e é forjável — não serve para autorizar.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const protegida = ROTAS_PROTEGIDAS.some((rota) => pathname.startsWith(rota))

  if (protegida && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = `?redirect=${encodeURIComponent(pathname)}`
    return NextResponse.redirect(url)
  }

  if (pathname === '/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/crm'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Tudo, menos assets estáticos e imagens — não faz sentido gastar uma
     * chamada de auth para servir um favicon.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)',
  ],
}
