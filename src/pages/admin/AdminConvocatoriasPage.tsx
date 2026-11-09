import { useCallback, useEffect, useState } from 'react'
import { Eye, EyeOff, Search } from 'lucide-react'

import { adminService } from '@/services/adminService'
import type { AdminConvocatoria, PaginatedAdmin } from '@/types/admin'
import { cn } from '@/lib/utils'

const ESTADOS = ['', 'BORRADOR', 'PUBLICADA', 'CERRADA', 'CANCELADA', 'COMPLETADA', 'FINALIZADA']

const estadoColor: Record<string, string> = {
  PUBLICADA: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  BORRADOR: 'bg-ink-200 text-ink-700 dark:bg-ink-700 dark:text-ink-200',
  CANCELADA: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  CERRADA: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  COMPLETADA: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  FINALIZADA: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
}

export function AdminConvocatoriasPage() {
  const [res, setRes] = useState<PaginatedAdmin<AdminConvocatoria> | null>(null)
  const [loading, setLoading] = useState(true)
  const [estado, setEstado] = useState('')
  const [buscar, setBuscar] = useState('')
  const [page, setPage] = useState(1)
  const [accion, setAccion] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminService.convocatorias({
        estado: estado || undefined,
        buscar: buscar || undefined,
        page,
        per_page: 15,
      })
      setRes(data)
    } finally {
      setLoading(false)
    }
  }, [estado, buscar, page])

  useEffect(() => {
    const t = setTimeout(() => void cargar(), 0)
    return () => clearTimeout(t)
  }, [cargar])

  const moderar = async (c: AdminConvocatoria) => {
    const ocultar = !c.oculta_por_admin
    let motivo: string | undefined
    if (ocultar) {
      motivo = window.prompt(`Motivo para ocultar "${c.titulo}":`) || undefined
      if (!motivo) return
    }
    setAccion(c.id)
    try {
      await adminService.moderarConvocatoria(c.id, ocultar, motivo)
      await cargar()
    } catch {
      window.alert('No se pudo moderar la convocatoria.')
    } finally {
      setAccion(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">Convocatorias</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Modera el contenido publicado por las fundaciones.
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
            placeholder="Buscar por título…"
            className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-3 text-sm dark:border-ink-700 dark:bg-ink-900"
          />
        </div>
        <select
          value={estado}
          onChange={(e) => {
            setPage(1)
            setEstado(e.target.value)
          }}
          className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-900"
        >
          {ESTADOS.map((s) => (
            <option key={s} value={s}>
              {s || 'Todos los estados'}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-ink-200/60 bg-white dark:border-ink-800 dark:bg-ink-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-200/60 text-xs uppercase text-ink-400 dark:border-ink-800">
            <tr>
              <th className="px-4 py-3">Convocatoria</th>
              <th className="px-4 py-3">Fundación</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Postul.</th>
              <th className="px-4 py-3 text-right">Moderación</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-400">
                  Cargando…
                </td>
              </tr>
            ) : res && res.data.length > 0 ? (
              res.data.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-ink-100 last:border-0 dark:border-ink-800/60"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900 dark:text-white">{c.titulo}</p>
                    <p className="text-xs text-ink-400">
                      {c.modalidad} · {new Date(c.fecha_inicio).toLocaleDateString()}
                    </p>
                    {c.oculta_por_admin && (
                      <span className="mt-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">
                        OCULTA
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-600 dark:text-ink-300">
                    {c.fundacion_nombre || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-semibold',
                        estadoColor[c.estado] ?? 'bg-ink-200 text-ink-700',
                      )}
                    >
                      {c.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-600 dark:text-ink-300">
                    {c.total_postulaciones}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      disabled={accion === c.id}
                      onClick={() => moderar(c)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40',
                        c.oculta_por_admin
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300'
                          : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/15 dark:text-red-300',
                      )}
                    >
                      {c.oculta_por_admin ? (
                        <>
                          <Eye className="size-3.5" /> Mostrar
                        </>
                      ) : (
                        <>
                          <EyeOff className="size-3.5" /> Ocultar
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-400">
                  No hay convocatorias con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {res && res.pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-500">
            {res.total} convocatorias · página {res.page} de {res.pages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-ink-200 px-3 py-1.5 disabled:opacity-40 dark:border-ink-700"
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
