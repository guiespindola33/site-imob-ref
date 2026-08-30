/**
 * Serializa dados estruturados para dentro de <script type="application/ld+json">.
 *
 * JSON.stringify sozinho nao basta: a descricao e o nome do imovel vem do banco,
 * digitados pela equipe. Um texto contendo `</script>` fecharia a tag e o resto
 * viraria HTML executavel na pagina publica. Escapando `<`, `>` e `&` como
 * sequencias unicode, o JSON continua valido e nada escapa do bloco.
 */
export function serializarJsonLd(dados: unknown): string {
  return JSON.stringify(dados)
    .replace(/</g, '\u003c')
    .replace(/>/g, '\u003e')
    .replace(/&/g, '\u0026')
}
