import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, FileText, Users, XCircle } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/badgeHelpers'
import { parseApiError } from '@/lib/apiClient'
import { abrirArchivoPrivado } from '@/lib/archivos'
import { formatDate } from '@/lib/utils'
import {
  menoresService,
  PARENTESCOS,
  type AdminAutorizacion,
  type AdminAutorizacionesPage,
  type FiltroAutorizaciones,
} from '@/services/menoresService'

const FILTROS: { value: FiltroAutorizaciones; label: string }[] = [
  { value: 'PENDIENTE', label: 'Pendientes de revisión' },
  { value: 'APROBADA', label: 'Aprobadas' },
  { value: 'RECHAZADA', label: 'Rechazadas' },
  { value: 'TODOS', label: 'Todas' },
]

const ESTADO_BADGE: Record<string, { tone: BadgeTone; label: string }> = {
  PENDIENTE: { tone: 'amber', label: 'Pendiente' },
  APROBADA: { tone: 'green', label: 'Aprobada' },
  RECHAZADA: { tone: 'red', label: 'Rechazada' },
}

const PARENTESCO_LABEL = Object.fromEntries(PARENTESCOS.map((p) => [p.value, p.label]))

export function AdminAutorizacionesPage() {
  const [res, setRes] = useState<AdminAutorizacionesPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<FiltroAutorizaciones>('PENDIENTE')
  const [page, setPage] = useState(1)
  const [accion, setAccion] = useState<string | null>(null)
  const [notas, setNotas] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      setRes(await menoresService.listarAdmin({ estado: filtro, page, per_page: 12 }))
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setLoading(false)
    }
  }, [filtro, page])

  useEffect(() => {
    const t = setTimeout(() => void cargar(), 0)
    return () => clearTimeout(t)
  }, [cargar])

  const resolver = async (a: AdminAutorizacion, decision: 'APROBADA' | 'RECHAZADA') => {
    const nota = notas[a.voluntario_id]?.trim()
    if (decision === 'RECHAZADA' && !nota) {
      setError('Escribe el motivo del rechazo para que el voluntario pueda corregirlo.')
      return
    }
    setError(null)
    setAccion(a.voluntario_id)
    try {
      await menoresService.resolver(a.voluntario_id, decision, nota)
      await cargar()
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setAccion(null)
    }
  }

  const verArchivo = (ruta: string) =>
    abrirArchivoPrivado(ruta).catch(() => setError('No se pudo abrir el archivo.'))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">
          Autorizaciones de acudientes
        </h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Revisa la autorización firmada de los voluntarios menores de edad. Mientras no esté
          aprobada, las organizaciones no pueden aceptarlos en convocatorias.
        </p>
      </div>

      <select
        value={filtro}
        onChange={(e) => {
          setPage(1)
          setFiltro(e.target.value as FiltroAutorizaciones)
        }}
        className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-900"
      >
        {FILTROS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />
          ))
        ) : res && res.data.length > 0 ? (
          res.data.map((a) => {
            const badge = a.estado ? ESTADO_BADGE[a.estado] : undefined
            const pendiente = a.estado === 'PENDIENTE'
            return (
              <div
                key={a.voluntario_id}
                className="rounded-2xl border border-ink-200/60 bg-white p-5 dark:border-ink-800 dark:bg-ink-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-white">
                      <Users className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink-900 dark:text-white">
                        {a.nombre}
                      </p>
                      <p className="truncate text-xs text-ink-400">{a.email}</p>
                    </div>
                  </div>
                  {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
                </div>

                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm text-ink-600 dark:text-ink-300">
                  <dt className="text-ink-400">Edad</dt>
                  <dd>
                    {a.edad} años {a.edad >= 18 && <span className="text-xs">(ya es mayor)</span>}
                  </dd>
                  <dt className="text-ink-400">Documento</dt>
                  <dd>
                    {a.tipo_documento} {a.numero_documento}
                  </dd>
                  <dt className="text-ink-400">Acudiente</dt>
                  <dd>
                    {a.acudiente_nombre ?? '—'}
                    {a.acudiente_parentesco && (
                      <span className="text-ink-400">
                        {' '}
                        · {PARENTESCO_LABEL[a.acudiente_parentesco]}
                      </span>
                    )}
                  </dd>
                  <dt className="text-ink-400">Doc. acudiente</dt>
                  <dd>{a.acudiente_documento ?? '—'}</dd>
                  <dt className="text-ink-400">Teléfono</dt>
                  <dd>{a.acudiente_telefono ?? '—'}</dd>
                  {a.fecha && (
                    <>
                      <dt className="text-ink-400">{pendiente ? 'Enviada' : 'Resuelta'}</dt>
                      <dd>{formatDate(a.fecha)}</dd>
                    </>
                  )}
                </dl>

                {a.archivo && (
                  <button
                    type="button"
                    onClick={() => verArchivo(a.archivo as string)}
                    className="mt-2 inline-flex items-center gap-1.5 text-sm text-solar-600 hover:underline dark:text-solar-400"
                  >
                    <FileText className="size-4" /> Ver autorización firmada
                  </button>
                )}

                {!pendiente && a.nota && (
                  <p className="mt-2 text-xs italic text-ink-500">Nota: {a.nota}</p>
                )}

                {pendiente && (
                  <div className="mt-4 space-y-2">
                    <textarea
                      rows={2}
                      maxLength={500}
                      value={notas[a.voluntario_id] ?? ''}
                      onChange={(e) =>
                        setNotas((n) => ({ ...n, [a.voluntario_id]: e.target.value }))
                      }
                      placeholder="Nota para el voluntario (obligatoria si rechazas)"
                      className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-900"
                    />
                    <div className="flex gap-2">
                      <button
                        disabled={accion === a.voluntario_id}
                        onClick={() => resolver(a, 'APROBADA')}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-40"
                      >
                        <CheckCircle2 className="size-4" /> Aprobar
                      </button>
                      <button
                        disabled={accion === a.voluntario_id}
                        onClick={() => resolver(a, 'RECHAZADA')}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-40 dark:border-red-500/30 dark:hover:bg-red-500/10"
                      >
                        <XCircle className="size-4" /> Rechazar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <p className="col-span-full rounded-2xl border border-dashed border-ink-200 p-10 text-center text-sm text-ink-400 dark:border-ink-800">
            No hay autorizaciones con ese filtro.
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
