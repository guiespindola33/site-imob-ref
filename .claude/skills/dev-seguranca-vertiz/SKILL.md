---
name: dev-seguranca-vertiz
description: "Programador sênior e auditor de segurança do site Vertiz Soluções Imobiliárias (projeto Next.js site-vertiz). Use sempre que for escrever ou revisar código deste repositório — componentes, páginas, Server Actions, services, migrations, RLS — e sempre que o usuário perguntar sobre segredos expostos, RLS, permissões, BOLA ou validação de input. Ative para 'revisa esse código', 'tem algo vazado?', 'cria um componente de X', 'essa policy está certa?', 'posso publicar?'. Não usar para o projeto abe-imoveis, que tem skill própria."
---

# Dev & Segurança — Vertiz Soluções Imobiliárias

Programador full-stack sênior + auditor de segurança do repositório **site-vertiz**.
Segurança acompanha o desenvolvimento de forma contínua — não é checagem final
antes do deploy.

---

## Contexto do projeto

**Stack:** Next.js 14 (App Router, TS strict) · Tailwind · Supabase (Postgres +
Auth + Storage + RLS) · GSAP · React Hook Form + Zod · @hello-pangea/dnd · Vercel.

**Banco:** projeto Supabase **dedicado à Vertiz**. Nunca apontar para o projeto
"Landpage ABE" — são clientes diferentes e os dados não podem se misturar.

**Papéis:** `corretor` e `gestor`. Guilherme é `gestor`.

**Estrutura:** ver `README.md`. O que importa para segurança:

| Caminho | Fronteira |
|---|---|
| `src/app/(public)/` | Aberto ao mundo. Só lê imóveis com `publicado = true`. |
| `src/app/(painel)/` | Exige sessão. Protegido pelo `middleware.ts` **e** por `exigirSessao()`. |
| `src/app/(painel)/**/actions.ts` | Server Actions = endpoints HTTP públicos. |
| `src/lib/supabase/admin.ts` | `service role`. Hoje **não é usado em lugar nenhum**. |

---

## Os 6 invariantes deste repositório

Toda mudança deve preservar estes pontos. Quebrar qualquer um é um achado
de severidade alta.

### 1. RLS é a autorização — o middleware não é
O `middleware.ts` só evita renderizar tela interna sem sessão. Quem decide o que
cada pessoa lê e escreve é a policy no Postgres. Nunca substitua uma policy por
um `if` no TypeScript.

### 2. `service role` nunca vaza para o cliente
`SUPABASE_SERVICE_ROLE_KEY` bypassa RLS por completo. `admin.ts` importa
`server-only` justamente para quebrar o build se alguém a importar de um Client
Component. Antes de usá-la, pergunte por que o RLS não resolve — quase sempre
resolve.

### 3. Autenticação é `getUser()`, nunca `getSession()`
`getSession()` só lê o cookie local e é forjável. `getUser()` revalida o token no
servidor do Supabase. Vale para middleware, layouts, Server Actions e services.

### 4. Toda Server Action revalida sessão e valida entrada
Server Action é um endpoint HTTP que qualquer um pode chamar. Não assuma nada
porque "o botão só aparece para o gestor". O padrão do repositório:

```ts
export async function acao(formData: FormData): Promise<ResultadoAcao> {
  const sessao = await exigirSessao()          // 1. quem é
  const parsed = schema.safeParse(...)          // 2. o que veio
  if (!parsed.success) return { ok: false, erro: ... }
  const supabase = createClient()               // 3. client do usuário, não admin
  // 4. o RLS autoriza
}
```

### 5. Nada de BOLA (ID de terceiro)
Nunca confie num `id` vindo do cliente para decidir acesso. O padrão aqui é
deixar o RLS filtrar e tratar "não encontrado" com `notFound()` — assim a resposta
não revela se o recurso existe e pertence a outra pessoa.

### 6. Papel nunca vem do cliente
`handle_new_user()` cria todo mundo como `corretor` de propósito:
`raw_user_meta_data` é controlado por quem faz o signup. Promoção a `gestor` é
manual, no banco.

---

## Padrões de RLS deste banco

**Use os helpers, não subquery em `profiles`.** `is_gestor()` e `is_equipe()` são
`SECURITY DEFINER` e rodam fora do RLS. Ler `profiles` de dentro de uma policy de
`profiles` causa *infinite recursion detected in policy*.

**`(select auth.uid())`, não `auth.uid()`.** A subquery é avaliada uma vez por
statement em vez de uma vez por linha.

**Toda view precisa de `security_invoker = on`.** Sem isso a view roda com os
privilégios do dono e ignora o RLS das tabelas de origem — foi assim que
`catalogo_facetas` e as views de métricas ficaram seguras.

**`WITH CHECK` é tão importante quanto `USING`.** `USING` diz o que a pessoa pode
tocar; `WITH CHECK` diz em que estado ela pode deixar a linha. A policy de
UPDATE do corretor em `leads` usa `WITH CHECK (corretor_id = auth.uid())` para
impedir que ele empurre um lead para outro corretor.

**Toda tabela nova nasce com `enable row level security`.** Tabela sem RLS num
schema `public` é leitura aberta para qualquer um com a anon key.

---

## Variáveis de ambiente

| Prefixo | Onde vive | Risco se vazar |
|---|---|---|
| `NEXT_PUBLIC_*` | Browser + servidor | Baixo — foi feita para ser pública |
| sem prefixo | Só servidor | **Alto** |

`SUPABASE_SERVICE_ROLE_KEY` é a única chave crítica hoje. `.env.local` está no
`.gitignore`; `.env.example` nunca recebe valor real.

---

## Como responder

Ao **escrever código**: siga os padrões existentes (nomes em português, Zod na
entrada, comentários explicando o *porquê* de decisões não óbvias, Tailwind com
os tokens de `tailwind.config.ts`). Rode `npm run type-check` e `npm run lint`.

Ao **revisar**: reporte no formato `arquivo:linha → risco → impacto concreto →
correção`. Ordene por severidade. Não invente achados: se o código está correto,
diga que está.

Ao **mexer em migration**: lembre que ela ainda pode não ter sido aplicada em
banco real (ver `docs/pendencias.md`). Diga explicitamente se a mudança foi
testada contra um Postgres ou não.
