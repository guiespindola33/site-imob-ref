import { TrendingDown, TrendingUp, Users } from 'lucide-react'
import { carregarMetricas } from '@/services/leads'
import { exigirSessao } from '@/lib/auth/sessao'

export const metadata = { title: 'Relatórios' }

const mesLegivel = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit' })
    .format(new Date(iso))
    .replace('.', '')

const semanaLegivel = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(iso))

export default async function RelatoriosPage() {
  const { profile } = await exigirSessao('/crm/relatorios')
  const { porPeriodo, conversao, porCorretor } = await carregarMetricas()

  // Semanas vêm em linhas mês×semana; agrupamos para o gráfico de volume.
  const semanas = Object.values(
    porPeriodo.reduce<Record<string, { semana: string; total: number }>>((acc, linha) => {
      acc[linha.semana] = {
        semana: linha.semana,
        total: (acc[linha.semana]?.total ?? 0) + linha.total,
      }
      return acc
    }, {})
  )
    .sort((a, b) => a.semana.localeCompare(b.semana))
    .slice(-8)

  const picoSemana = Math.max(1, ...semanas.map((s) => s.total))
  const mesAtual = conversao[0]
  const totalLeads = porPeriodo.reduce((s, l) => s + l.total, 0)

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl">Relatórios</h1>
        <p className="mt-1 text-sm text-navy-500">
          {profile.role === 'gestor'
            ? 'Números da equipe inteira.'
            : 'Números dos seus leads.'}{' '}
          Três indicadores — volume, conversão e distribuição por corretor.
        </p>
      </header>

      {/* ------------------------------------------------ 1. Volume de leads */}
      <section className="rounded-card border border-navy-100 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg">Volume de leads</h2>
            <p className="mt-0.5 text-sm text-navy-500">Últimas 8 semanas</p>
          </div>
          <p className="text-right">
            <span className="tabular block text-3xl font-semibold text-navy-800">
              {totalLeads}
            </span>
            <span className="text-xs uppercase tracking-wider text-navy-400">no total</span>
          </p>
        </div>

        {semanas.length > 0 ? (
          <div className="mt-6 flex h-40 items-end gap-2" role="img" aria-label="Leads por semana">
            {semanas.map((s) => (
              <div key={s.semana} className="flex flex-1 flex-col items-center gap-2">
                {/* Rótulo numérico além da altura da barra: cor/altura sozinhas não comunicam o valor */}
                <span className="tabular text-xs font-medium text-navy-600">{s.total}</span>
                <div
                  className="w-full rounded-t-md bg-aqua-400 transition-all"
                  style={{ height: `${Math.max(4, (s.total / picoSemana) * 100)}%` }}
                />
                <span className="text-[0.6875rem] text-navy-400">
                  {semanaLegivel(s.semana)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-navy-400">Ainda não há leads registrados.</p>
        )}
      </section>

      {/* --------------------------------------------- 2. Taxa de conversão */}
      <section className="mt-5 grid gap-5 sm:grid-cols-3">
        <div className="rounded-card border border-navy-100 bg-white p-6">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <TrendingUp size={18} aria-hidden />
          </span>
          <p className="tabular mt-4 text-3xl font-semibold text-navy-800">
            {mesAtual?.taxa_conversao_pct !== null && mesAtual?.taxa_conversao_pct !== undefined
              ? `${mesAtual.taxa_conversao_pct}%`
              : '—'}
          </p>
          <p className="mt-1 text-sm text-navy-500">
            Taxa de conversão {mesAtual ? `em ${mesLegivel(mesAtual.mes)}` : ''}
          </p>
          <p className="mt-2 text-xs text-navy-400">
            Fechados sobre o total de leads decididos (fechados + perdidos).
          </p>
        </div>

        <div className="rounded-card border border-navy-100 bg-white p-6">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
            <Users size={18} aria-hidden />
          </span>
          <p className="tabular mt-4 text-3xl font-semibold text-navy-800">
            {mesAtual?.fechados ?? 0}
          </p>
          <p className="mt-1 text-sm text-navy-500">Fechamentos no mês</p>
        </div>

        <div className="rounded-card border border-navy-100 bg-white p-6">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <TrendingDown size={18} aria-hidden />
          </span>
          <p className="tabular mt-4 text-3xl font-semibold text-navy-800">
            {mesAtual?.perdidos ?? 0}
          </p>
          <p className="mt-1 text-sm text-navy-500">Perdidos no mês</p>
        </div>
      </section>

      {/* -------------------------------------------- 3. Leads por corretor */}
      <section className="mt-5 rounded-card border border-navy-100 bg-white p-6">
        <h2 className="text-lg">Leads por corretor</h2>

        {porCorretor.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wider text-navy-400">
                  <th scope="col" className="pb-3 font-medium">Corretor</th>
                  <th scope="col" className="pb-3 text-right font-medium">Total</th>
                  <th scope="col" className="pb-3 text-right font-medium">Em andamento</th>
                  <th scope="col" className="pb-3 text-right font-medium">Fechados</th>
                  <th scope="col" className="pb-3 text-right font-medium">Perdidos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {porCorretor.map((linha) => (
                  <tr key={linha.corretor_id ?? 'fila'}>
                    <td className="py-3 font-medium text-navy-800">
                      {linha.corretor_nome ?? 'Fila aberta (sem dono)'}
                    </td>
                    <td className="tabular py-3 text-right text-navy-700">{linha.total}</td>
                    <td className="tabular py-3 text-right text-navy-500">
                      {linha.em_andamento}
                    </td>
                    <td className="tabular py-3 text-right text-emerald-600">
                      {linha.fechados}
                    </td>
                    <td className="tabular py-3 text-right text-red-500">{linha.perdidos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-navy-400">Nenhum lead atribuído ainda.</p>
        )}
      </section>
    </>
  )
}
