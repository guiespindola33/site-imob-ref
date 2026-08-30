# Vertiz Soluções Imobiliárias — site + painel

Catálogo público de imóveis com conversão direta no WhatsApp, mais painel interno
(cadastro de imóveis + CRM com pipeline Kanban).

**CRECI 21669-J · Grande Recife e Praias (PE)**

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript strict) |
| Estilo | Tailwind CSS |
| Animação | GSAP + ScrollTrigger (`@gsap/react`) |
| Banco / Auth / Storage | Supabase (Postgres + RLS) |
| Formulários | React Hook Form + Zod |
| Kanban | @hello-pangea/dnd |
| Deploy | Vercel |

> O banco é um **projeto Supabase dedicado à Vertiz** (`site-vertiz`,
> ref `smoaxeujwcqwpjuteuqr`, plano free). Nunca compartilhar com o projeto
> "Landpage ABE" — são clientes diferentes.

---

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha as chaves do Supabase
npm run dev
```

O site sobe mesmo sem Supabase configurado: as telas mostram estado vazio em vez
de quebrar. O painel (`/crm`, `/cms`) exige banco e login.

### Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run type-check` | `tsc --noEmit` |
| `npm run lint` | ESLint (next/core-web-vitals) |

---

## Banco de dados

As migrations estão em `supabase/migrations/`, na ordem de aplicação:

| Arquivo | Conteúdo |
|---|---|
| `001_perfis.sql` | `profiles`, papéis (`corretor` / `gestor`), helpers `is_gestor()` / `is_equipe()`, RLS |
| `002_imoveis.sql` | `imoveis`, `imovel_fotos`, slug SEO automático, view `catalogo_facetas`, RLS |
| `003_crm.sql` | `leads`, `lead_eventos`, histórico automático, busca global, RLS |
| `004_metricas.sql` | Views dos 3 indicadores do MVP |
| `005_storage.sql` | Bucket `imoveis` (leitura pública, escrita só da equipe) |

Depois de aplicar, regenere os tipos:

```bash
supabase gen types typescript --project-id <ref> --schema public > src/types/database.types.ts
```

### Primeiro gestor

O trigger `handle_new_user` cria todo mundo como `corretor` — de propósito, para
que o papel nunca venha do metadata controlado pelo cliente. Promova o primeiro
gestor manualmente no SQL Editor:

```sql
update public.profiles set role = 'gestor' where email = 'email@dogestor.com';
```

---

## Estrutura

```
src/
├── app/
│   ├── (public)/          # site: home, catálogo, ficha, sobre, contato
│   ├── (painel)/          # área interna — protegida pelo middleware
│   │   ├── crm/           # pipeline, leads, relatórios
│   │   └── cms/           # cadastro de imóveis
│   ├── login/
│   ├── sitemap.ts · robots.ts
│   └── layout.tsx
├── components/
│   ├── brand/ · layout/ · imoveis/ · motion/ · painel/ · ui/
├── lib/
│   ├── auth/              # sessão e autorização
│   ├── supabase/          # clients browser / server / admin
│   ├── imoveis/           # filtros validados por Zod
│   └── utils/             # máscaras, formatação, cn
├── services/              # leitura de dados (server)
├── types/                 # tipos do banco + rótulos em PT-BR
└── middleware.ts          # renova sessão e protege /crm e /cms
```

---

## Decisões que valem conhecer

**Conversão sem formulário.** Todo CTA de imóvel abre o WhatsApp com mensagem
pré-preenchida identificando o imóvel. Não há formulário intermediário.

**CTA fixo no mobile.** Quase todo o tráfego vem do Instagram/Linktree. Na ficha
do imóvel o botão fica fixo no rodapé; o conteúdo reserva a altura da barra para
não ficar coberto.

**Filtros sem beco sem saída.** As opções de bairro e tipo vêm da view
`catalogo_facetas`, que só lista o que tem estoque ativo. Não existe combinação
clicável que devolva zero resultados.

**Entrada de leads manual na v1.** O clique no WhatsApp leva para um app externo
e não cria lead sozinho — isso exigiria a API Oficial do WhatsApp (Meta). O lead
é registrado pela equipe em "Adicionar lead" e cai na fila aberta de Captação,
de onde qualquer corretor pode assumir.

**RLS é a autorização, não o middleware.** O middleware só evita renderizar tela
interna para quem não tem sessão. Quem decide o que cada pessoa lê e escreve é a
policy no banco — inclusive para Server Actions, que são endpoints públicos.
Nenhuma rota do app usa `service role`.
