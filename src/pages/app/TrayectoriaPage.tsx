import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  Building2,
  CalendarCheck,
  Clock,
  FileCheck2,
  Loader2,
  Sparkles,
} from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/badgeHelpers'
import { parseApiError } from '@/lib/apiClient'
import { formatDate } from '@/lib/utils'
import { voluntarioService } from '@/services/voluntarioService'
import type { Trayectoria } from '@/types/voluntario'

const ESTADO_INFO: Record<string, { label: string; tone: BadgeTone }> = {
  PENDIENTE: { label: 'Pendiente', tone: 'amber' },
  EN_REVISION: { label: 'En revisión', tone: 'amber' },
  LISTA_ESPERA: { label: 'Lista de espera', tone: 'blue' },
  ACEPTADO: { label: 'Aceptada', tone: 'green' },
  RECHAZADO: { label: 'Rechazada', tone: 'red' },
  RETIRADO: { label: 'Retirada', tone: 'gray' },
  CANCELADO_FUNDACION: { label: 'Cancelada', tone: 'red' },
  ASISTIO: { label: 'Asististe', tone: 'green' },
  NO_ASISTIO: { label: 'No asististe', tone: 'red' },
}

export function TrayectoriaPage() {
  const [data, setData] = useState<Trayectoria | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    voluntarioService
      .trayectoria()
      .then((t) => active && setData(t))
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

  if (error || !data) {
    return <Alert tone="error">{error ?? 'No se pudo cargar tu trayectoria.'}</Alert>
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
          Mi trayectoria
        </h1>
        <p className="mt-1 text-ink-500 dark:text-ink-400">
          Tu recorrido como voluntario en Solari.
        </p>
      </div>

      {/* Estadísticas */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={CalendarCheck} valor={data.actividades_completadas} label="Actividades" />
        <StatCard icon={Clock} valor={data.horas_acumuladas} label="Horas" />
        <StatCard icon={Building2} valor={data.fundaciones_colaboradas} label="Fundaciones" />
        <StatCard icon={Sparkles} valor={data.xp_total} label="XP total" />
      </div>

      <h2 className="mb-4 font-display text-xl font-bold text-ink-900 dark:text-white">
        Historial de participaciones
      </h2>

      {data.historial.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 py-16 text-center dark:border-ink-700">
          <CalendarCheck className="mx-auto size-10 text-ink-300" />
          <p className="mt-3 text-ink-500 dark:text-ink-400">
            Aún no te has postulado a ninguna convocatoria.
          </p>
          <Link
            to="/app/convocatorias"
            className="mt-3 inline-block font-medium text-solar-600 hover:underline dark:text-solar-400"
          >
            Explorar convocatorias
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.historial.map((a) => {
            const info = ESTADO_INFO[a.estado] ?? { label: a.estado, tone: 'gray' as BadgeTone }
            return (
              <div
                key={a.postulacion_id}
                className="flex flex-col gap-2 rounded-2xl border border-ink-200/60 bg-white/70 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-ink-700/60 dark:bg-ink-900/50"
              >
                <div className="min-w-0">
                  <Link
                    to={`/app/convocatorias/${a.publicacion_id}`}
                    className="font-semibold text-ink-900 hover:text-solar-600 dark:text-white dark:hover:text-solar-400"
                  >
                    {a.titulo}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500 dark:text-ink-400">
                    {a.fundacion_nombre && (
                      <span className="flex items-center gap-1">
                        <Building2 className="size-3.5" /> {a.fundacion_nombre}
                      </span>
                    )}
                    {a.fecha_inicio && <span>{formatDate(a.fecha_inicio)}</span>}
                    {a.estado === 'ASISTIO' && a.horas_reconocidas > 0 && (
                      <span className="flex items-center gap-1 text-solar-600 dark:text-solar-400">
                        <Clock className="size-3.5" /> {a.horas_reconocidas} h
                      </span>
                    )}
                    {a.estado === 'ASISTIO' && a.otorga_certificado && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <FileCheck2 className="size-3.5" /> Certificado disponible
                      </span>
                    )}
                    {a.calificacion != null && (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <Award className="size-3.5" /> {a.calificacion}/5
                      </span>
                    )}
                  </div>
                </div>
                <Badge tone={info.tone}>{info.label}</Badge>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  valor,
  label,
}: {
  icon: typeof Clock
  valor: number
  label: string
}) {
  return (
    <div className="rounded-2xl border border-ink-200/60 bg-white/70 p-4 backdrop-blur dark:border-ink-700/60 dark:bg-ink-900/50">
      <span className="flex size-9 items-center justify-center rounded-xl bg-solar-100 text-solar-600 dark:bg-solar-500/15 dark:text-solar-400">
        <Icon className="size-5" />
      </span>
      <p className="mt-2 font-display text-2xl font-extrabold text-ink-900 dark:text-white">
        {valor.toLocaleString()}
      </p>
      <p className="text-xs text-ink-500 dark:text-ink-400">{label}</p>
    </div>
  )
}
