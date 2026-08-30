import { CatalogoCamposFiltro } from './catalogo-campos-filtro'
import type { FiltrosCatalogo } from '@/lib/imoveis/filtros'
import type { OpcoesFiltro } from '@/services/imoveis'

export function CatalogoSidebar({
  filtros,
  opcoes,
}: {
  filtros: FiltrosCatalogo
  opcoes: OpcoesFiltro
}) {
  return (
    <aside className="hidden lg:block lg:w-[262px] lg:shrink-0">
      <div className="sticky top-24">
        <CatalogoCamposFiltro filtros={filtros} opcoes={opcoes} />
      </div>
    </aside>
  )
}
