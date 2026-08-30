import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center">
      <div className="container-app text-center">
        <p className="font-display text-6xl font-semibold text-navy-200">404</p>
        <h1 className="mt-4 text-2xl sm:text-3xl">Esta página não existe</h1>
        <p className="mx-auto mt-3 max-w-sm text-navy-500">
          O imóvel pode ter sido despublicado ou o endereço está incorreto.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/imoveis"
            className="inline-flex min-h-12 items-center justify-center rounded-pill bg-navy-800 px-6 font-medium text-white transition-colors hover:bg-navy-700"
          >
            Ver imóveis disponíveis
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-pill border border-navy-200 bg-white px-6 font-medium text-navy-800 transition-colors hover:border-navy-400"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
