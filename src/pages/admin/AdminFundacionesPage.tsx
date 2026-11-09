import { useCallback, useEffect, useState } from 'react'
import { Building2, Check, Search, X } from 'lucide-react'

import { adminService } from '@/services/adminService'
import type { AdminFundacion, PaginatedAdmin } from '@/types/admin'
import { cn } from '@/lib/utils'

const ESTADOS = ['', 'PENDIENTE', 'APROBADA', 'RECHAZADA', 'SUSPENDIDA']

const estadoColor: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  APROBADA: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  RECHAZADA: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  SUSPENDIDA: 'bg-ink-200 text-ink-700 dark:bg-ink-700 dark:text-ink-200',
}

export function AdminFundacionesPage() {
  const [res, setRes] = useState<PaginatedAdmin<AdminFundacion> | null>(null)
  const [loading, setLoading] = useState(true)
  const [estado, setEstado] = useState('')
  const [buscar, setBuscar] = useState('')
  const [page, setPage] = useState(1)
  const [sel, setSel] = useState<AdminFundacion | null>(null)
  const [accion, setAccion] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminService.fundaciones({
        estado_verificacion: estado || undefined,
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

  const verificar = async (f: AdminFundacion, nuevo: string) => {
    let motivo: string | undefined
    if (nuevo === 'RECHAZADA' || nuevo === 'SUSPENDIDA') {
      motivo = window.prompt(`Motivo para ${nuevo.toLowerCase()} a ${f.nombre}:`) || undefined
      if (!motivo) return
    }
    setAccion(true)
    try {
      await adminService.verificarFundacion(f.id, nuevo, motivo)
      setSel(null)
      await cargar()
    } catch {
      window.alert('No se pudo actualizar la verificación.')
    } finally {
      setAccion(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">Fundaciones</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Revisa y verifica las organizaciones registradas.
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
            placeholder="Buscar por nombre o NIT…"
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

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Lista */}
        <div className="space-y-3 lg:col-span-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />
            ))
          ) : res && res.data.length > 0 ? (
            res.data.map((f) => (
              <button
                key={f.id}
                onClick={() => setSel(f)}
                className={cn(
                  'flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left transition hover:border-solar-300 dark:bg-ink-900',
                  sel?.id === f.id
                    ? 'border-solar-400 ring-2 ring-solar-200 dark:ring-solar-500/30'
                    : 'border-ink-200/60 dark:border-ink-800',
                )}
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 text-white">
                  <Building2 className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink-900 dark:text-white">{f.nombre}</p>
                  <p className="truncate text-xs text-ink-400">
                    NIT {f.nit} · {f.representante_legal}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-semibold',
                    estadoColor[f.estado_verificacion],
                  )}
                >
                  {f.estado_verificacion}
                </span>
              </button>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-ink-200 p-10 text-center text-sm text-ink-400 dark:border-ink-800">
              No hay fundaciones con esos filtros.
            </p>
          )}

          {res && res.pages > 1 && (
            <div className="flex items-center justify-between pt-2 text-sm">
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

        {/* Detalle */}
        <div className="lg:col-span-1">
          {sel ? (
            <div className="sticky top-24 space-y-4 rounded-2xl border border-ink-200/60 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
              <div>
                <h3 className="text-lg font-bold text-ink-900 dark:text-white">{sel.nombre}</h3>
                <span
                  className={cn(
                    'mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold',
                    estadoColor[sel.estado_verificacion],
                  )}
                >
                  {sel.estado_verificacion}
                </span>
              </div>
              <dl className="space-y-2 text-sm">
                <Campo k="NIT" v={sel.nit} />
                <Campo k="Representante" v={sel.representante_legal} />
                <Campo k="Teléfono" v={sel.telefono} />
                <Campo k="Correo" v={sel.correo_institucional || '—'} />
                <Campo k="Dirección" v={sel.direccion} />
                {sel.pagina_web && <Campo k="Web" v={sel.pagina_web} />}
                <div>
                  <dt className="text-xs text-ink-400">Descripción</dt>
                  <dd className="mt-0.5 text-ink-700 dark:text-ink-200">{sel.descripcion}</dd>
                </div>
                {sel.motivo_rechazo && (
                  <div>
                    <dt className="text-xs text-red-400">Motivo rechazo/suspensión</dt>
                    <dd className="mt-0.5 text-red-600 dark:text-red-300">{sel.motivo_rechazo}</dd>
                  </div>
                )}
              </dl>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  disabled={accion || sel.estado_verificacion === 'APROBADA'}
                  onClick={() => verificar(sel, 'APROBADA')}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-40"
                >
                  <Check className="size-4" /> Aprobar
                </button>
                <button
                  disabled={accion || sel.estado_verificacion === 'RECHAZADA'}
                  onClick={() => verificar(sel, 'RECHAZADA')}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-40"
                >
                  <X className="size-4" /> Rechazar
                </button>
                <button
                  disabled={accion}
                  onClick={() => verificar(sel, 'SUSPENDIDA')}
                  className="rounded-xl border border-ink-200 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 disabled:opacity-40 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"
                >
                  Suspender
                </button>
                <button
                  disabled={accion}
                  onClick={() => verificar(sel, 'PENDIENTE')}
                  className="rounded-xl border border-ink-200 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 disabled:opacity-40 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"
                >
                  Pendiente
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-ink-200 p-10 text-center text-sm text-ink-400 dark:border-ink-800">
              Selecciona una fundación para ver el detalle y verificarla.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Campo({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-xs text-ink-400">{k}</dt>
      <dd className="text-right text-ink-700 dark:text-ink-200">{v}</dd>
    </div>
  )
}
