'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import imageCompression from 'browser-image-compression'
import { ImagePlus, Loader2, Star, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { registrarFoto, removerFoto } from '@/app/(painel)/cms/actions'
import type { ImovelComFotos } from '@/types'

const MAX_ARQUIVOS = 20
const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']

/**
 * Upload múltiplo com compressão automática.
 *
 * A compressão roda no navegador (Web Worker) ANTES do upload: uma foto de
 * celular de 6 MB vira ~300 KB em WebP. Isso reduz o tempo de envio no 4G do
 * corretor e o peso das páginas do catálogo, que é onde o cliente final paga a
 * conta. O bucket também tem limite de 5 MB por arquivo como segunda barreira.
 */
export function UploadFotos({ imovel }: { imovel: ImovelComFotos }) {
  const router = useRouter()
  const [enviando, setEnviando] = useState(false)
  const [progresso, setProgresso] = useState<{ feitos: number; total: number } | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function onSelecionar(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(evento.target.files ?? [])
    evento.target.value = '' // permite reenviar o mesmo arquivo depois
    if (arquivos.length === 0) return

    const restantes = MAX_ARQUIVOS - imovel.fotos.length
    if (restantes <= 0) {
      setErro(`Limite de ${MAX_ARQUIVOS} fotos por imóvel atingido.`)
      return
    }

    const invalidos = arquivos.filter((a) => !TIPOS_ACEITOS.includes(a.type))
    if (invalidos.length > 0) {
      setErro('Envie apenas imagens JPG, PNG ou WebP.')
      return
    }

    setErro(null)
    setEnviando(true)
    const lote = arquivos.slice(0, restantes)
    setProgresso({ feitos: 0, total: lote.length })

    const supabase = createClient()
    let ordem = imovel.fotos.length

    for (const [indice, arquivo] of lote.entries()) {
      try {
        const comprimido = await imageCompression(arquivo, {
          maxSizeMB: 0.6,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/webp',
        })

        // Nome gerado no cliente, nunca o nome original: evita colisão e
        // impede que um nome hostil ("../x") escape do prefixo do imóvel.
        const caminho = `${imovel.id}/${crypto.randomUUID()}.webp`

        const { error: erroUpload } = await supabase.storage
          .from('imoveis')
          .upload(caminho, comprimido, { contentType: 'image/webp', upsert: false })

        if (erroUpload) throw new Error(erroUpload.message)

        const r = await registrarFoto({
          imovel_id: imovel.id,
          storage_path: caminho,
          ordem: ordem + 1,
          // A primeira foto do imóvel vira capa automaticamente.
          capa: imovel.fotos.length === 0 && indice === 0,
        })

        if (!r.ok) throw new Error(r.erro ?? 'Falha ao registrar a foto')

        ordem += 1
        setProgresso({ feitos: indice + 1, total: lote.length })
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Falha ao enviar uma das fotos.')
        break
      }
    }

    setEnviando(false)
    setProgresso(null)
    router.refresh()
  }

  async function excluir(fotoId: string) {
    // Remoção apaga o arquivo do Storage e não tem desfazer.
    if (!window.confirm('Remover esta foto? A ação não pode ser desfeita.')) return

    const r = await removerFoto(fotoId)
    if (!r.ok) setErro(r.erro ?? 'Não foi possível remover a foto.')
    else router.refresh()
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg">Fotos</h2>
          <p className="mt-0.5 text-sm text-navy-500">
            {imovel.fotos.length} de {MAX_ARQUIVOS} · comprimidas automaticamente no envio
          </p>
        </div>

        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-pill bg-navy-800 px-5 text-sm font-medium text-white transition-colors hover:bg-navy-700">
          {enviando ? (
            <Loader2 size={16} className="animate-spin" aria-hidden />
          ) : (
            <ImagePlus size={16} aria-hidden />
          )}
          {enviando
            ? `Enviando ${progresso?.feitos ?? 0}/${progresso?.total ?? 0}`
            : 'Adicionar fotos'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={enviando}
            onChange={onSelecionar}
            className="sr-only"
          />
        </label>
      </div>

      {erro && (
        <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </p>
      )}

      {imovel.fotos.length > 0 ? (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {imovel.fotos.map((foto) => (
            <li
              key={foto.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-navy-100 bg-navy-50"
            >
              <Image
                src={foto.url}
                alt={foto.legenda ?? ''}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
              />

              {foto.capa && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-pill bg-white/95 px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-wider text-navy-700">
                  <Star size={10} aria-hidden />
                  Capa
                </span>
              )}

              <button
                type="button"
                onClick={() => excluir(foto.id)}
                aria-label="Remover foto"
                /* No mobile não existe hover: o botão fica sempre visível lá. */
                className="absolute right-2 top-2 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/95 text-red-600 transition-opacity hover:bg-white sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100"
              >
                <Trash2 size={15} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-card border border-dashed border-navy-200 px-6 py-10 text-center text-sm text-navy-400">
          Nenhuma foto ainda. A primeira enviada vira a capa do imóvel.
        </p>
      )}
    </section>
  )
}
