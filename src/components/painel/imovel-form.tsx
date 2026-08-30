'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2 } from 'lucide-react'
import { salvarImovel } from '@/app/(painel)/cms/actions'
import { Button } from '@/components/ui/button'
import { maskMoeda, parseMoeda } from '@/lib/utils/format'
import { FINALIDADE_LABEL, STATUS_IMOVEL_LABEL, TIPO_IMOVEL_LABEL } from '@/types'
import type { ImovelComFotos } from '@/types'

const CAMPO =
  'min-h-12 w-full rounded-xl border border-navy-200 bg-white px-3.5 text-[0.9375rem] ' +
  'transition-colors focus:border-aqua-500'

function Rotulo({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-navy-700">
      {children}
    </label>
  )
}

/** Campo de valor com máscara de moeda; envia o número puro em um hidden. */
function CampoMoeda({
  nome,
  rotulo,
  inicial,
}: {
  nome: string
  rotulo: string
  inicial: number | null
}) {
  const [texto, setTexto] = useState(
    inicial !== null ? maskMoeda(String(Math.round(inicial * 100))) : ''
  )

  return (
    <div>
      <Rotulo htmlFor={nome}>{rotulo}</Rotulo>
      <input
        id={nome}
        inputMode="numeric"
        value={texto}
        onChange={(e) => setTexto(maskMoeda(e.target.value))}
        placeholder="R$ 0,00"
        className={`${CAMPO} tabular`}
      />
      <input type="hidden" name={nome} value={parseMoeda(texto) ?? ''} />
    </div>
  )
}

export function ImovelForm({ imovel }: { imovel?: ImovelComFotos }) {
  const router = useRouter()
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, startTransition] = useTransition()

  function onSubmit(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro(null)
    const formData = new FormData(evento.currentTarget)

    startTransition(async () => {
      const r = await salvarImovel(formData)
      if (!r.ok) {
        setErro(r.erro ?? 'Não foi possível salvar o imóvel.')
        return
      }
      // Novo imóvel vai direto para a edição: é lá que ficam as fotos.
      router.push(`/cms/imoveis/${r.id}`)
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      {imovel && <input type="hidden" name="id" value={imovel.id} />}

      {/* ------------------------------------------------------ Identificação */}
      <fieldset className="rounded-card border border-navy-100 bg-white p-6">
        <legend className="px-2 text-sm font-semibold uppercase tracking-wider text-navy-400">
          Identificação
        </legend>

        <div className="mt-2 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Rotulo htmlFor="nome_empreendimento">
              Nome do empreendimento <span className="text-red-500">*</span>
            </Rotulo>
            <input
              id="nome_empreendimento"
              name="nome_empreendimento"
              required
              maxLength={200}
              defaultValue={imovel?.nome_empreendimento}
              className={CAMPO}
            />
            <p className="mt-1.5 text-xs text-navy-400">
              A URL do site é gerada a partir do tipo, bairro, quartos e deste nome.
            </p>
          </div>

          <div>
            <Rotulo htmlFor="tipo_imovel">Tipo</Rotulo>
            <select
              id="tipo_imovel"
              name="tipo_imovel"
              defaultValue={imovel?.tipo_imovel ?? 'apartamento'}
              className={`${CAMPO} cursor-pointer`}
            >
              {Object.entries(TIPO_IMOVEL_LABEL).map(([v, r]) => (
                <option key={v} value={v}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Rotulo htmlFor="finalidade">Finalidade</Rotulo>
            <select
              id="finalidade"
              name="finalidade"
              defaultValue={imovel?.finalidade ?? 'venda'}
              className={`${CAMPO} cursor-pointer`}
            >
              {Object.entries(FINALIDADE_LABEL).map(([v, r]) => (
                <option key={v} value={v}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* -------------------------------------------------------- Localização */}
      <fieldset className="rounded-card border border-navy-100 bg-white p-6">
        <legend className="px-2 text-sm font-semibold uppercase tracking-wider text-navy-400">
          Localização
        </legend>

        <div className="mt-2 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Rotulo htmlFor="bairro">
              Bairro <span className="text-red-500">*</span>
            </Rotulo>
            <input
              id="bairro"
              name="bairro"
              required
              maxLength={100}
              defaultValue={imovel?.bairro}
              placeholder="Boa Viagem"
              className={CAMPO}
            />
          </div>

          <div>
            <Rotulo htmlFor="cidade">Cidade</Rotulo>
            <input
              id="cidade"
              name="cidade"
              defaultValue={imovel?.cidade ?? 'Recife'}
              className={CAMPO}
            />
          </div>

          <div>
            <Rotulo htmlFor="uf">UF</Rotulo>
            <input
              id="uf"
              name="uf"
              maxLength={2}
              defaultValue={imovel?.uf ?? 'PE'}
              className={`${CAMPO} uppercase`}
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <Rotulo htmlFor="endereco">Endereço</Rotulo>
            <input
              id="endereco"
              name="endereco"
              maxLength={300}
              defaultValue={imovel?.endereco ?? ''}
              className={CAMPO}
            />
          </div>

          <div>
            <Rotulo htmlFor="cep">CEP</Rotulo>
            <input
              id="cep"
              name="cep"
              maxLength={9}
              defaultValue={imovel?.cep ?? ''}
              className={`${CAMPO} tabular`}
            />
          </div>
        </div>
      </fieldset>

      {/* ----------------------------------------------------- Características */}
      <fieldset className="rounded-card border border-navy-100 bg-white p-6">
        <legend className="px-2 text-sm font-semibold uppercase tracking-wider text-navy-400">
          Características
        </legend>

        <div className="mt-2 grid gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { nome: 'area_m2', rotulo: 'Área (m²)', valor: imovel?.area_m2 },
            { nome: 'quartos', rotulo: 'Quartos', valor: imovel?.quartos },
            { nome: 'suites', rotulo: 'Suítes', valor: imovel?.suites },
            { nome: 'banheiros', rotulo: 'Banheiros', valor: imovel?.banheiros },
            { nome: 'vagas', rotulo: 'Vagas', valor: imovel?.vagas },
            { nome: 'andar', rotulo: 'Andar', valor: imovel?.andar },
          ].map((campo) => (
            <div key={campo.nome}>
              <Rotulo htmlFor={campo.nome}>{campo.rotulo}</Rotulo>
              <input
                id={campo.nome}
                name={campo.nome}
                type="number"
                min={0}
                step={campo.nome === 'area_m2' ? '0.01' : '1'}
                defaultValue={campo.valor ?? ''}
                className={`${CAMPO} tabular`}
              />
            </div>
          ))}
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="mobiliado"
            defaultChecked={imovel?.mobiliado}
            className="h-4 w-4 cursor-pointer accent-aqua-500"
          />
          Mobiliado
        </label>
      </fieldset>

      {/* ---------------------------------------------------------- Valores */}
      <fieldset className="rounded-card border border-navy-100 bg-white p-6">
        <legend className="px-2 text-sm font-semibold uppercase tracking-wider text-navy-400">
          Valores
        </legend>

        <div className="mt-2 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <CampoMoeda nome="valor_venda" rotulo="Valor de venda" inicial={imovel?.valor_venda ?? null} />
          <CampoMoeda nome="valor_aluguel" rotulo="Aluguel mensal" inicial={imovel?.valor_aluguel ?? null} />
          <CampoMoeda nome="valor_condominio" rotulo="Condomínio" inicial={imovel?.valor_condominio ?? null} />
          <CampoMoeda nome="valor_iptu" rotulo="IPTU" inicial={imovel?.valor_iptu ?? null} />
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="taxas_inclusas"
            defaultChecked={imovel?.taxas_inclusas}
            className="h-4 w-4 cursor-pointer accent-aqua-500"
          />
          Taxas inclusas no valor principal
        </label>
      </fieldset>

      {/* ---------------------------------------------------------- Conteúdo */}
      <fieldset className="rounded-card border border-navy-100 bg-white p-6">
        <legend className="px-2 text-sm font-semibold uppercase tracking-wider text-navy-400">
          Conteúdo
        </legend>

        <div className="mt-2 space-y-5">
          <div>
            <Rotulo htmlFor="descricao">Descrição</Rotulo>
            <textarea
              id="descricao"
              name="descricao"
              rows={5}
              maxLength={5000}
              defaultValue={imovel?.descricao ?? ''}
              className="w-full rounded-xl border border-navy-200 bg-white p-3.5 text-[0.9375rem] focus:border-aqua-500"
            />
          </div>

          <div>
            <Rotulo htmlFor="diferenciais">Diferenciais do prédio</Rotulo>
            <textarea
              id="diferenciais"
              name="diferenciais"
              rows={2}
              defaultValue={imovel?.diferenciais.join(', ') ?? ''}
              placeholder="Piscina, academia, salão de festas, portaria 24h"
              className="w-full rounded-xl border border-navy-200 bg-white p-3.5 text-[0.9375rem] focus:border-aqua-500"
            />
            <p className="mt-1.5 text-xs text-navy-400">Separe por vírgula.</p>
          </div>

          <div>
            <Rotulo htmlFor="proximidades">Proximidades</Rotulo>
            <textarea
              id="proximidades"
              name="proximidades"
              rows={2}
              defaultValue={imovel?.proximidades.join(', ') ?? ''}
              placeholder="Praia, shopping, colégio, hospital"
              className="w-full rounded-xl border border-navy-200 bg-white p-3.5 text-[0.9375rem] focus:border-aqua-500"
            />
            <p className="mt-1.5 text-xs text-navy-400">Separe por vírgula.</p>
          </div>
        </div>
      </fieldset>

      {/* -------------------------------------------------------- Publicação */}
      <fieldset className="rounded-card border border-navy-100 bg-white p-6">
        <legend className="px-2 text-sm font-semibold uppercase tracking-wider text-navy-400">
          Publicação
        </legend>

        <div className="mt-2 grid gap-5 sm:grid-cols-2">
          <div>
            <Rotulo htmlFor="status">Status</Rotulo>
            <select
              id="status"
              name="status"
              defaultValue={imovel?.status ?? 'disponivel'}
              className={`${CAMPO} cursor-pointer`}
            >
              {Object.entries(STATUS_IMOVEL_LABEL).map(([v, r]) => (
                <option key={v} value={v}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 sm:pt-7">
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                name="publicado"
                defaultChecked={imovel?.publicado}
                className="h-4 w-4 cursor-pointer accent-aqua-500"
              />
              Publicado no site
            </label>
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                name="destaque"
                defaultChecked={imovel?.destaque}
                className="h-4 w-4 cursor-pointer accent-aqua-500"
              />
              Destacar na home
            </label>
          </div>
        </div>
      </fieldset>

      {erro && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle size={16} aria-hidden />
          {erro}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={salvando}>
          {salvando && <Loader2 size={16} className="animate-spin" aria-hidden />}
          {salvando ? 'Salvando...' : imovel ? 'Salvar alterações' : 'Criar imóvel'}
        </Button>
        <Button
          type="button"
          variante="contorno"
          onClick={() => router.push('/cms/imoveis')}
          disabled={salvando}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
