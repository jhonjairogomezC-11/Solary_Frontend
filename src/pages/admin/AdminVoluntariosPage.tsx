import { useCallback, useEffect, useState } from 'react'
import { BadgeCheck, FileText, Search, ShieldCheck, ShieldX, UserCog } from 'lucide-react'

import { adminService } from '@/services/adminService'
import type { AdminVoluntario, PaginatedAdmin } from '@/types/admin'
import { abrirArchivoPrivado } from '@/lib/archivos'
import { cn } from '@/lib/utils'

const FILTROS = [
  { value: 'pendientes', label: 'Con documento sin verificar' },
  { value: 'verificados', label: 'Verificados' },
  { value: 'todos', label: 'Todos' },
]

export function AdminVoluntariosPage() {
  const [res, setRes] = useState<PaginatedAdmin<AdminVoluntario> | null>(null)
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('pendientes')
  const [buscar, setBuscar] = useState('')
  const [page, setPage] = useState(1)
  const [accion, setAccion] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const params: {
        verificado?: boolean
        con_documento?: boolean
        buscar?: string
        page: number
        per_page: number
      } = { page, per_page: 15, buscar: buscar || undefined }
      if (filtro === 'pendientes') {
        params.verificado = false
        params.con_documento = true
      } else if (filtro === 'verificados') {
        params.verificado = true
      }
      setRes(await adminService.voluntarios(params))
    } finally {
      setLoading(false)
    }
  }, [filtro, buscar, page])

  useEffect(() => {
    const t = setTimeout(() => void cargar(), 0)
    return () => clearTimeout(t)
  }, [cargar])

  const verificar = async (v: AdminVoluntario, verificado: boolean) => {
    setAccion(v.id)
    try {
      await adminService.verificarVoluntario(v.id, verificado)
      await cargar()
    } catch {
      window.alert('No se pudo actualizar la verificación.')
    } finally {
      setAccion(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">
          Verificación de voluntarios
        </h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Revisa los documentos de identidad y otorga la insignia de verificado.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <input
            value={buscar}
            onChange={(e) => {
              setPage(1)
              setBuscar(e.target.value)
            }}
            placeholder="Buscar por nombre, email o documento…"
            className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-3 text-sm dark:border-ink-700 dark:bg-ink-900"
          />
        </div>
        <select
          value={filtro}
          onChange={(e) => {
            setPage(1)
            setFiltro(e.target.value)
          }}
          className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-900"
        >
          {FILTROS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />
          ))
        ) : res && res.data.length > 0 ? (
          res.data.map((v) => (
            <div
              key={v.id}
              className="rounded-2xl border border-ink-200/60 bg-white p-5 dark:border-ink-800 dark:bg-ink-900"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-solar-300 to-solar-500 text-white">
                  {v.foto_perfil ? (
                    <img src={v.foto_perfil} alt="" className="size-full object-cover" />
                  ) : (
                    <UserCog className="size-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate font-semibold text-ink-900 dark:text-white">
                    {v.nombre || '—'}
                    {v.esta_verificado && <BadgeCheck className="size-4 shrink-0 text-sky-500" />}
                  </p>
                  <p className="truncate text-xs text-ink-400">{v.email}</p>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-sm text-ink-600 dark:text-ink-300">
                <p>
                  <span className="text-ink-400">Documento:</span> {v.tipo_documento}{' '}
                  {v.numero_documento}
                </p>
                {v.documento_identidad ? (
                  <button
                    type="button"
                    onClick={() => abrirArchivoPrivado(v.documento_identidad as string)}
                    className="inline-flex items-center gap-1.5 text-solar-600 hover:underline dark:text-solar-400"
                  >
                    <FileText className="size-4" /> Ver documento subido
                  </button>
                ) : (
                  <p className="text-xs italic text-ink-400">No ha subido documento.</p>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                {!v.esta_verificado ? (
                  <button
                    disabled={accion === v.id || !v.documento_identidad}
                    onClick={() => verificar(v, true)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-sky-500 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-40"
                  >
                    <ShieldCheck className="size-4" /> Verificar
                  </button>
                ) : (
                  <button
                    disabled={accion === v.id}
                    onClick={() => verificar(v, false)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-ink-200 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 disabled:opacity-40 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"
                  >
                    <ShieldX className="size-4" /> Revocar
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full rounded-2xl border border-dashed border-ink-200 p-10 text-center text-sm text-ink-400 dark:border-ink-800">
            No hay voluntarios con esos filtros.
          </p>
        )}
      </div>

      {res && res.pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-500">
            {res.total} · página {res.page} de {res.pages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className={cn(
                'rounded-lg border border-ink-200 px-3 py-1.5 disabled:opacity-40 dark:border-ink-700',
              )}
            >
              Anterior
            </button>
            <button
              disabled={page >= res.pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-ink-200 px-3 py-1.5 disabled:opacity-40 dark:border-ink-700"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
