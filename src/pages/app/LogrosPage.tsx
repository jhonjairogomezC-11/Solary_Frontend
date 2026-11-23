import { useEffect, useState } from 'react'
import { Award, Clock, Loader2, Lock, Sparkles, Star, TrendingUp } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { parseApiError } from '@/lib/apiClient'
import { cn, formatDate } from '@/lib/utils'
import { voluntarioService } from '@/services/voluntarioService'
import type { LogroEstado, ResumenGamificacion, TransaccionXp } from '@/types/voluntario'

const ICONO_LOGRO: Record<string, string> = {
  participaciones: '🤝',
  puntos: '⭐',
  dificultad: '🔥',
  urgente: '⚡',
}

export function LogrosPage() {
  const [resumen, setResumen] = useState<ResumenGamificacion | null>(null)
  const [logros, setLogros] = useState<LogroEstado[]>([])
  const [historial, setHistorial] = useState<TransaccionXp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([
      voluntarioService.resumen(),
      voluntarioService.logros(),
      voluntarioService.historialXp(),
    ])
      .then(([r, l, h]) => {
        if (!active) return
        setResumen(r)
        setLogros(l)
        setHistorial(h)
      })
      .catch((err) => active && setError(parseApiError(err).message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-solar-500" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
          Experiencia y logros
        </h1>
        <p className="mt-1 text-ink-500 dark:text-ink-400">
          Acumula XP participando en actividades verificadas.
        </p>
      </div>

      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      {/* Resumen de XP */}
      {resumen && (
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-solar-500 to-orange-600 p-6 text-white sm:p-8">
          <div className="flex items-center gap-2 text-white/80">
            <Sparkles className="size-5" />
            <span className="text-sm font-medium">Tu experiencia total</span>
          </div>
          <p className="mt-1 font-display text-5xl font-black">{resumen.xp_total.toLocaleString()} XP</p>
          <p className="mt-1 text-sm font-semibold text-white/90">
            Nivel {resumen.nivel} · {resumen.nivel_nombre}
          </p>
          {resumen.xp_siguiente_nivel != null && (
            <div className="mt-2">
              <div className="h-2 overflow-hidden rounded-full bg-white/25">
                <div
                  className="h-full rounded-full bg-white"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        ((resumen.xp_total - resumen.xp_nivel_actual) /
                          Math.max(1, resumen.xp_siguiente_nivel - resumen.xp_nivel_actual)) *
                          100,
                      ),
                    )}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-white/80">
                {resumen.xp_siguiente_nivel - resumen.xp_total} XP para el siguiente nivel. Los
                niveles son solo un reconocimiento visual.
              </p>
            </div>
          )}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={TrendingUp} label="Actividades" valor={resumen.actividades_completadas} />
            <Stat icon={Clock} label="Horas" valor={resumen.horas_acumuladas} />
            <Stat icon={Award} label="Logros" valor={`${resumen.logros_desbloqueados}/${resumen.logros_totales}`} />
            <Stat icon={Star} label="Saldo XP" valor={resumen.xp_saldo} />
          </div>
        </div>
      )}

      {/* Catálogo de logros */}
      <h2 className="mb-4 font-display text-xl font-bold text-ink-900 dark:text-white">Logros</h2>
      {logros.length === 0 ? (
        <p className="text-ink-500 dark:text-ink-400">Aún no hay logros configurados.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {logros.map((logro) => (
            <div
              key={logro.id}
              className={cn(
                'relative flex items-start gap-3 rounded-2xl border p-4 transition',
                logro.desbloqueado
                  ? 'border-solar-300 bg-solar-50 dark:border-solar-500/40 dark:bg-solar-500/10'
                  : 'border-ink-200/60 bg-white/60 opacity-80 dark:border-ink-700/60 dark:bg-ink-900/40',
              )}
            >
              <span
                className={cn(
                  'flex size-12 shrink-0 items-center justify-center rounded-xl text-2xl',
                  logro.desbloqueado ? 'bg-white shadow-soft dark:bg-ink-800' : 'grayscale',
                )}
              >
                {ICONO_LOGRO[logro.tipo] ?? '🏅'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-ink-900 dark:text-white">{logro.nombre}</h3>
                  {!logro.desbloqueado && <Lock className="size-3.5 text-ink-400" />}
                </div>
                <p className="mt-0.5 text-sm text-ink-500 dark:text-ink-400">{logro.descripcion}</p>
                {logro.desbloqueado && logro.fecha_obtencion && (
                  <p className="mt-1 text-xs font-medium text-solar-600 dark:text-solar-400">
                    Desbloqueado el {formatDate(logro.fecha_obtencion)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Historial de XP */}
      {historial.length > 0 && (
        <>
          <h2 className="mb-4 mt-8 font-display text-xl font-bold text-ink-900 dark:text-white">
            Historial de XP
          </h2>
          <div className="divide-y divide-ink-200/60 overflow-hidden rounded-2xl border border-ink-200/60 bg-white/70 dark:divide-ink-800 dark:border-ink-700/60 dark:bg-ink-900/50">
            {historial.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink-700 dark:text-ink-200">{tx.motivo}</p>
                  <p className="text-xs text-ink-400">{formatDate(tx.fecha)}</p>
                </div>
                <span className="shrink-0 font-semibold text-solar-600 dark:text-solar-400">
                  +{tx.puntos_total} XP
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  valor,
}: {
  icon: typeof Award
  label: string
  valor: number | string
}) {
  return (
    <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
      <Icon className="size-4 text-white/80" />
      <p className="mt-1 font-display text-2xl font-bold">{valor}</p>
      <p className="text-xs text-white/70">{label}</p>
    </div>
  )
}
