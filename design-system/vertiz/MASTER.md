# Vertiz — Sistema de Design (fonte da verdade)

Derivado das skills `ui-ux-pro-max` e `frontend-design`, ajustado à identidade
real da Vertiz (logo navy + monograma VZ) e ao contexto de uso: catálogo
imobiliário consumido quase 100% no celular, vindo do Instagram/Linktree.

---

## 1. Direção

**Navy costeiro.** O navy profundo do logo carrega seriedade e registro
profissional (CRECI); o acento aqua traz a referência de Boa Viagem e Setúbal sem
cair no clichê de "imobiliária de praia". Verde WhatsApp é **reservado** ao CTA
de conversão — se virar cor decorativa, perde a função de sinalizar a ação.

Deliberadamente **não** seguimos a recomendação automática da base (teal +
Cinzel + skeuomorfismo): Cinzel é o cliché de "imobiliária de luxo", conflita com
o pedido de fonte limpa e moderna, e skeuomorfismo tem performance ruim num
catálogo de fotos pesadas no 4G.

---

## 2. Cor

| Token | Valor | Uso |
|---|---|---|
| `navy-800` | `#0B2545` | Primária: header, footer, botões principais, títulos |
| `navy-900` / `navy-950` | `#081A33` / `#04101F` | Fundos escuros (hero, sidebar do painel) |
| `navy-500…100` | escala | Texto secundário, bordas, superfícies |
| `aqua-500` | `#12A594` | Acento interativo: links, chips ativos, foco |
| `aqua-50` | `#EAFBF7` | Fundo de destaque suave |
| `whatsapp` | `#25D366` | **Só** o CTA de conversão |
| `sand` | `#C9A96A` | Selo de "Reservado" |
| `offwhite` | `#F7F9FB` | Fundo da página |
| `ink` | `#0E1420` | Texto corrido |

Contraste: `navy-800` sobre `offwhite` ≈ 14:1; `aqua-600` sobre branco ≈ 4.6:1
(usar `aqua-600`/`700` para texto, `aqua-400`/`500` só para superfície e ícone).

---

## 3. Tipografia

| Papel | Fonte | Configuração |
|---|---|---|
| Títulos | **DM Sans** 500/600/700 | `tracking-[-0.02em]`, `text-wrap: balance` |
| Corpo e UI | **Inter** | base 16px, `line-height` 1.5 |
| Preços e métricas | Inter | `font-variant-numeric: tabular-nums` (classe `.tabular`) |

Numerais tabulares importam: sem eles, uma coluna de preços "dança"
horizontalmente a cada dígito diferente.

---

## 4. Forma e espaço

- Raio: `card` = 20px, campos = 12px, botões = pill.
- Sombras: `shadow-card` em repouso, `shadow-card-hover` no hover — sombra
  cresce, o card não salta.
- Espaçamento: escala 4/8/16/24/32/48/64 (densidade padrão).
- Container: `max-w-6xl` com padding 16/24/32 conforme o breakpoint.

---

## 5. Regras de interação (não negociáveis)

- **Alvo de toque ≥ 44×44px** em tudo que é clicável, inclusive ícones.
- **Foco visível sempre**: anel `aqua-500` com offset. Nunca remover outline.
- **Estado nunca só por cor**: o switch de publicação tem rótulo textual; as
  barras do relatório têm o número escrito.
- **Hover não é requisito**: no mobile não existe. O botão de remover foto fica
  sempre visível abaixo de `sm`.
- **Zoom liberado** (`maximumScale: 5`).

---

## 6. Movimento

Tier: **Standard** (6/10). Só `opacity` e `transform` — nunca `width`/`height`,
que forçam reflow a cada frame.

| Padrão | Onde | Configuração |
|---|---|---|
| Hero intro | Home | stagger 0.08s, 0.7s, `power3.out` |
| Scroll reveal | Seções | `top 88%`, `once: true`, 0.6s, `power2.out` |
| Stagger de grid | Cards do catálogo | `ScrollTrigger.batch`, 0.42s, `back.out(1.4)`, each 0.06 |
| Transição de filtro | Catálogo | reexecuta o stagger quando os filtros mudam |

`prefers-reduced-motion` é respeitado via `gsap.matchMedia()` **e** no CSS. Sem
JS nada fica invisível: a classe `js-reveal` só é aplicada quando o script roda e
o usuário não pediu menos movimento.

---

## 7. Componentes-chave

**Card de imóvel** — imagem `aspect-[4/3]` (reserva espaço, evita CLS), badge de
tipo, bairro em caixa-alta como kicker, specs com ícone, preço em destaque. O
link cobre o card inteiro via `::after`.

**Filtros do catálogo** — desktop: 4 selects inline. Mobile: recolhidos atrás de
"Filtros". Chips removíveis para o que está ativo. As opções vêm das facetas do
banco: **nunca é possível escolher um filtro sem estoque**.

**CTA "Consultar Disponibilidade"** — mobile: barra fixa no rodapé com preço +
botão; desktop: cartão lateral que acompanha a rolagem. O `<body>` reserva a
altura da barra para o conteúdo não ficar coberto.

---

## 8. Checklist antes de entregar tela nova

- [ ] Sem emoji como ícone (Lucide/SVG)
- [ ] `cursor-pointer` em tudo que é clicável
- [ ] Transições de 150–300ms
- [ ] Contraste de texto ≥ 4.5:1
- [ ] Foco de teclado visível
- [ ] `prefers-reduced-motion` respeitado
- [ ] Testado em 375 / 768 / 1024 / 1440px
- [ ] Nenhuma rolagem horizontal no `body`
