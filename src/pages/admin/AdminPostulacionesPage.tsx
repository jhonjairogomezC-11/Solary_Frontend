import { useCallback, useEffect, useState } from 'react'

import { adminService } from '@/services/adminService'
import type { AdminPostulacion, PaginatedAdmin } from '@/types/admin'
import { cn } from '@/lib/utils'

const ESTADOS = ['', 'PENDIENTE', 'ACEPTADO', 'RECHAZADO', 'RETIRADO', 'ASISTIO', 'NO_ASISTIO']

const estadoColor: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  ACEPTADO: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  RECHAZADO: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  RETIRADO: 'bg-ink-200 text-ink-700 dark:bg-ink-700 dark:text-ink-200',
  ASISTIO: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  NO_ASISTIO: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
}

export function AdminPostulacionesPage() {
  const [res, setRes] = useState<PaginatedAdmin<AdminPostulacion> | null>(null)
  const [loading, setLoading] = useState(true)
  const [estado, setEstado] = useState('')
  const [page, setPage] = useState(1)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      setRes(await adminService.postulaciones(page, estado || undefined))
    } finally {
      setLoading(false)
    }
  }, [estado, page])

  useEffect(() => {
    const t = setTimeout(() => void cargar(), 0)
    return () => clearTimeout(t)
  }, [cargar])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">Postulaciones</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Vista global de todas las postulaciones del sistema.
        </p>
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

      <div className="overflow-x-auto rounded-2xl border border-ink-200/60 bg-white dark:border-ink-800 dark:bg-ink-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-200/60 text-xs uppercase text-ink-400 dark:border-ink-800">
            <tr>
              <th className="px-4 py-3">Voluntario</th>
              <th className="px-4 py-3">Convocatoria</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-ink-400">
                  Cargando…
                </td>
              </tr>
            ) : res && res.data.length > 0 ? (
              res.data.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-ink-100 last:border-0 dark:border-ink-800/60"
                >
                  <td className="px-4 py-3 font-medium text-ink-900 dark:text-white">
                    {p.voluntario_nombre || '—'}
                  </td>
                  <td className="px-4 py-3 text-ink-600 dark:text-ink-300">
                    {p.publicacion_titulo || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-semibold',
                        estadoColor[p.estado] ?? 'bg-ink-200 text-ink-700',
                      )}
                    >
                      {p.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-500">
                    {new Date(p.fecha_postulacion).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-ink-400">
                  No hay postulaciones con ese filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {res && res.pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-500">
            {res.total} postulaciones · página {res.page} de {res.pages}
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
