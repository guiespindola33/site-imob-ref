# Pendências e premissas — site Vertiz

Atualizado em 30/08/2026, ao final da primeira sessão de desenvolvimento.

---

## 1. Bloqueios reais (dependem de decisão ou de terceiros)

| # | Pendência | Status |
|---|---|---|
| ~~1~~ | ~~Criar o projeto Supabase dedicado da Vertiz~~ | **Feito em 30/08/2026.** Projeto `site-vertiz` (`smoaxeujwcqwpjuteuqr`), org "Site ABE", plano **free** (US$ 0/mês), região `sa-east-1`. 5 migrations + 3 correções pós-auditoria aplicadas e verificadas contra o Postgres real. Ver seção 6. |
| ~~2~~ | ~~Logo em alta resolução~~ | **Feito em 30/08/2026.** Arquivo real recebido (`vertiz_logo.jpg`, 150×150, export tipo foto de perfil). Salvo em `public/logo-vertiz.jpg` (selo completo — favicon e Open Graph) e `public/logo-vertiz-monograma.png` (monograma recortado — header/footer/painel). Ver nota sobre a cor do navy na seção 2. |
| 3 | **Modelo de contratação** (SaaS x projeto fechado) | Define se o projeto fica no free (some após 7 dias sem uso, sem backup garantido) ou sobe para o Pro (US$ 25/mês — backup diário, sem pausa) antes de ir ao ar. | Comercial |
| 4 | **Validar o fluxo manual de leads do WhatsApp** | O escopo já registra como pendente. Se a equipe recusar o cadastro manual, a alternativa é a API Oficial do WhatsApp (Meta) — mais caro e mais lento. | Guilherme + equipe Vertiz |
| 5 | **Criar o primeiro usuário gestor** | Login e RLS já funcionam contra o banco real, mas nenhum usuário existe ainda. Ver seção 6. | Guilherme |

---

## 2. Premissas que assumi (confirmar e corrigir se estiver errado)

| Onde | O que assumi | Status |
|---|---|---|
| `src/app/(public)/contato/page.tsx` | **Horário de atendimento**: segunda a sexta, 8h–18h; sábado sob agendamento. | **Confirmado por Guilherme em 30/08/2026.** Mantido sem alteração. |
| Paleta | Navy `#0B1B33` + acento dourado `#C08A3E` — direção "Filtro vivo", aprovada pelo cliente via mockup hifi (substituiu a paleta navy/aqua da primeira versão). | Aplicado em `tailwind.config.ts`. **Nota:** o navy real do logo (`#223C61`, amostrado do arquivo oficial) é mais claro/azulado que o navy do site. Mantive o navy do mockup aprovado por já ter passado por aprovação — o logo funciona como selo autocontido (carrega seu próprio fundo), então a diferença não gera inconsistência visual. Se quiser alinhar 100%, é um recálculo de escala em `tailwind.config.ts`. |
| Tipografia | **DM Sans** (UI/corpo) + **Instrument Serif** (títulos editoriais) + **DM Mono** (labels/badges) — parte da direção "Filtro vivo" aprovada. | Aplicado em `src/app/layout.tsx`. |
| Papéis | Apenas `corretor` e `gestor`. Guilherme entra como `gestor` (acesso pleno), como o escopo descreve. | `supabase/migrations/001_perfis.sql` |
| Textos institucionais | Home, Sobre e Contato foram escritos por mim a partir do escopo. | **Confirmado por Guilherme em 30/08/2026:** manter o tom atual, ajustando só dados factuais que ele fornecer. |
| Cidade padrão | `Recife` / `PE` no cadastro de imóveis. | `supabase/migrations/002_imoveis.sql` |

---

## 3. Decisões técnicas que diferem do projeto da ABE

**Helpers `is_gestor()` / `is_equipe()` em vez de subquery em `profiles`.**
Na ABE, as policies de `profiles` consultam a própria `profiles` para checar o
papel. Isso é o padrão que gera *infinite recursion detected in policy* no
Postgres. Aqui o papel é lido por funções `SECURITY DEFINER`, que rodam fora do
RLS e quebram o ciclo.

**`(select auth.uid())` nas policies.** A subquery é avaliada uma vez por
statement em vez de uma vez por linha — diferença que aparece quando a tabela de
leads cresce.

**Views com `security_invoker = on`.** Por padrão uma view roda com os
privilégios do dono, o que faria `catalogo_facetas` e as views de métricas
ignorarem o RLS e vazarem dados. Com `security_invoker`, cada consulta respeita
quem está perguntando.

**Nenhuma rota usa `service role`.** O client admin existe
(`src/lib/supabase/admin.ts`, protegido por `server-only`) mas não é importado em
lugar nenhum. Toda escrita passa pelo RLS.

---

## 4. Fora do escopo da v1 — sugestões registradas, não implementadas

- **Registro de cliques no CTA do WhatsApp.** Ajudaria a saber por qual imóvel o
  lead entrou antes de a equipe cadastrá-lo manualmente. Não implementei: o
  escopo limita as métricas a três indicadores, e isso adiciona uma tabela.
- **Reordenar fotos por arrastar** e escolher a capa manualmente. Hoje a capa é a
  primeira foto enviada e a ordem é a de upload.
- **Recuperação de senha.** O login existe; o fluxo de "esqueci minha senha"
  ainda não.
- **Testes automatizados.** Nenhum ainda.

---

## 5. Estado da verificação

| Verificação | Resultado |
|---|---|
| `tsc --noEmit` | passa |
| `next build` | passa — 16 rotas |
| `next lint` | sem avisos |
| Migrations aplicadas em banco real | **sim** — projeto `smoaxeujwcqwpjuteuqr` |
| Advisors de segurança do Supabase | **limpos** (2 avisos remanescentes são intencionais — ver seção 6) |
| Tipos TS regerados do banco e comparados com os escritos à mão | **idênticos**, 1 divergência documentada (`imoveis.slug`) |
| Site aberto no navegador contra o banco real | **sim** — catálogo vazio renderiza sem erro, login rejeita credencial inválida com mensagem genérica, `/crm` redireciona sem sessão |
| RLS testado com usuário `corretor` e `gestor` reais | **não** — nenhum usuário existe ainda (pendência #5) |

---

## 6. Banco em produção — o que foi feito nesta sessão

**Projeto:** `site-vertiz` · ref `smoaxeujwcqwpjuteuqr` · org `wqlgcrxncbzskukwvvxj` ("Site ABE") · região `sa-east-1` · plano free · US$ 0/mês confirmado via `get_cost` antes de criar.

**Migrations aplicadas, na ordem:** `001_perfis` → `002_imoveis` → `003_crm` →
`004_metricas` → `005_storage`, e mais três corretivas descobertas pela
auditoria de segurança (`get_advisors`) rodada logo após:

| Migration | O que corrigiu |
|---|---|
| `006_trava_funcoes_security_definer` | `is_gestor()`/`is_equipe()` ainda eram chamáveis por `anon` — o `revoke ... from public` da migration 001 não bastou porque o Supabase concede `EXECUTE` a `anon`/`authenticated` diretamente (não via o pseudo-papel `PUBLIC`) no momento em que a função é criada. |
| `007_revoga_public_de_funcoes_trigger` | `handle_new_user()` e `registrar_evento_lead()` (funções de trigger, não de API) ainda tinham `EXECUTE` concedido a `PUBLIC` — o grant automático que toda função ganha ao ser criada, nunca revogado. Confirmado lendo `pg_proc.proacl` diretamente. |
| `008_indices_fk_faltantes` | 3 foreign keys sem índice de cobertura (`leads.criado_por`, `leads.imovel_interesse_id`, `lead_eventos.usuario_id`). |

Também movi a extensão `pg_trgm` do schema `public` para `extensions` (ela expõe
funções na API se ficar em `public`).

**2 avisos que ficaram, deliberadamente:** o linter do Supabase sinaliza
`is_gestor()`/`is_equipe()` como "SECURITY DEFINER chamável por authenticated" —
isso é a função dessas duas: existem justamente para que qualquer usuário
autenticado descubra seu próprio papel sem recursão de RLS. Revogar o acesso
quebraria todas as policies que dependem delas.

**Advisor de performance:** ficaram avisos de "multiple permissive policies" em
`imoveis`, `imovel_fotos`, `leads` e `profiles` — cada uma tem uma policy restrita
(corretor) e uma policy `FOR ALL` separada para gestor, em vez de uma única
condição com `OR`. É mais legível e foi a escolha deliberada; fundir as duas
economiza uma avaliação de policy por query mas exige reescrever e testar RLS
sem carga real ainda no banco — fica para quando houver dados e usuários reais
para validar a fusão sem quebrar nada.

**Criar o primeiro usuário gestor:**

```sql
-- Depois de criar o usuário pelo Supabase Auth (dashboard ou signup no /login):
update public.profiles set role = 'gestor' where email = 'email-do-guilherme@...';
```
