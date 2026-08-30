/**
 * Esqueleto do catálogo.
 * Reproduz a mesma grade e proporção dos cards reais (linha no mobile, grade
 * de 3 colunas no desktop) para que a troca não provoque salto de layout.
 */
export default function CatalogoLoading() {
  return (
    <div className="container-app py-5 lg:py-9">
      <div className="skeleton h-8 w-56 lg:h-10 lg:w-72" />

      <div className="mt-4 flex gap-2 lg:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-9 w-20 rounded-pill" />
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        <div className="hidden w-[262px] shrink-0 space-y-6 lg:block">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2.5">
              <div className="skeleton h-3 w-20" />
              <div className="skeleton h-9 w-full" />
            </div>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          {/* Mobile: linhas */}
          <div className="flex flex-col gap-2.5 lg:hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 rounded-card border border-navy-100 bg-white p-2.5">
                <div className="skeleton h-24 w-24 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="skeleton h-2.5 w-20" />
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-4 w-16" />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: grade */}
          <div className="hidden gap-5 lg:grid lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-card border border-navy-100 bg-white">
                <div className="skeleton aspect-[2/1] rounded-none" />
                <div className="space-y-3 p-5">
                  <div className="skeleton h-2.5 w-24" />
                  <div className="skeleton h-5 w-3/4" />
                  <div className="skeleton h-4 w-1/2" />
                  <div className="skeleton h-6 w-32" />
                  <div className="skeleton h-11 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
