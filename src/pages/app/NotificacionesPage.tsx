import { useEffect, useState } from 'react'
import { Bell, CheckCheck, Loader2, Settings2 } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { parseApiError } from '@/lib/apiClient'
import { timeAgo } from '@/lib/utils'
import { convocatoriaService } from '@/services/convocatoriaService'
import { voluntarioService } from '@/services/voluntarioService'
import { cn } from '@/lib/utils'
import type { Notificacion } from '@/types/convocatoria'
import type { PreferenciasNotificacion } from '@/types/voluntario'

export function NotificacionesPage() {
  const [items, setItems] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = () => {
    setLoading(true)
    convocatoriaService
      .notificaciones()
      .then((res) => setItems(res.data))
      .catch((err) => setError(parseApiError(err).message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let active = true
    convocatoriaService
      .notificaciones()
      .then((res) => active && setItems(res.data))
      .catch((err) => active && setError(parseApiError(err).message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const marcarTodas = async () => {
    try {
      await convocatoriaService.marcarTodasLeidas()
      cargar()
    } catch (err) {
      setError(parseApiError(err).message)
    }
  }

  const marcarUna = async (id: string) => {
    try {
      await convocatoriaService.marcarLeida(id)
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)))
    } catch {
      /* noop */
    }
  }

  const hayNoLeidas = items.some((n) => !n.leida)

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
            Notificaciones
          </h1>
          <p className="mt-1 text-ink-500 dark:text-ink-400">Novedades sobre tu actividad en Solari.</p>
        </div>
        {hayNoLeidas && (
          <Button variant="outline" size="sm" onClick={marcarTodas}>
            <CheckCheck className="size-4" /> Marcar todas
          </Button>
        )}
      </div>

      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      <PreferenciasPanel />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-solar-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 py-16 text-center dark:border-ink-700">
          <Bell className="mx-auto size-10 text-ink-300" />
          <p className="mt-3 text-ink-500 dark:text-ink-400">No tienes notificaciones.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.leida && marcarUna(n.id)}
              className={cn(
                'flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition',
                n.leida
                  ? 'border-ink-200/60 bg-white/50 dark:border-ink-800 dark:bg-ink-900/30'
                  : 'border-solar-200 bg-solar-50 dark:border-solar-500/30 dark:bg-solar-500/10',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl',
                  n.leida
                    ? 'bg-ink-100 text-ink-400 dark:bg-ink-800'
                    : 'bg-gradient-to-br from-solar-400 to-solar-600 text-white',
                )}
              >
                <Bell className="size-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm', n.leida ? 'text-ink-500 dark:text-ink-400' : 'font-medium text-ink-900 dark:text-white')}>
                  {n.mensaje}
                </p>
                <p className="mt-0.5 text-xs text-ink-400">{timeAgo(n.fecha_creacion)}</p>
              </div>
              {!n.leida && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-solar-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const PREF_LABELS: { key: keyof PreferenciasNotificacion; label: string }[] = [
  { key: 'notif_postulaciones', label: 'Postulaciones y cambios de estado' },
  { key: 'notif_convocatorias', label: 'Nuevas convocatorias compatibles' },
  { key: 'notif_recordatorios', label: 'Recordatorios de actividades' },
  { key: 'notif_logros', label: 'Logros y experiencia (XP)' },
  { key: 'notif_soporte', label: 'Respuestas de soporte' },
]

function PreferenciasPanel() {
  const [prefs, setPrefs] = useState<PreferenciasNotificacion | null>(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    voluntarioService
      .preferencias()
      .then(setPrefs)
      .catch(() => {})
  }, [])

  const toggle = async (key: keyof PreferenciasNotificacion) => {
    if (!prefs || guardando) return
    const actualizado = { ...prefs, [key]: !prefs[key] }
    setPrefs(actualizado)
    setGuardando(true)
    try {
      await voluntarioService.guardarPreferencias(actualizado)
    } catch {
      setPrefs(prefs) // revierte
    } finally {
      setGuardando(false)
    }
  }

  if (!prefs) return null

  return (
    <details className="mb-5 rounded-2xl border border-ink-200/60 bg-white/70 p-4 dark:border-ink-700/60 dark:bg-ink-900/50">
      <summary className="flex cursor-pointer select-none items-center gap-2 text-sm font-semibold text-ink-800 dark:text-ink-100">
        <Settings2 className="size-4 text-solar-500" /> Preferencias de notificación
      </summary>
      <div className="mt-4 space-y-2">
        {PREF_LABELS.map(({ key, label }) => (
          <label
            key={key}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-1 py-1.5 text-sm text-ink-700 dark:text-ink-200"
          >
            {label}
            <input
              type="checkbox"
              checked={prefs[key]}
              onChange={() => toggle(key)}
              className="size-4 rounded border-ink-300 text-solar-500 focus:ring-solar-400"
            />
          </label>
        ))}
      </div>
    </details>
  )
}
