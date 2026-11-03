import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HeartHandshake, Loader2 } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { estadoPostulacionBadge } from '@/components/ui/badgeHelpers'
import { Button } from '@/components/ui/Button'
import { parseApiError } from '@/lib/apiClient'
import { formatDate } from '@/lib/utils'
import { convocatoriaService } from '@/services/convocatoriaService'
import type { Convocatoria, Postulacion } from '@/types/convocatoria'

interface PostConv extends Postulacion {
  convocatoria?: Convocatoria
}

export function MisPostulacionesPage() {
  const [items, setItems] = useState<PostConv[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accion, setAccion] = useState<string | null>(null)

  const cargar = () => {
    setLoading(true)
    convocatoriaService
      .misPostulaciones()
      .then(async (res) => {
        // Enriquecer con el título de cada convocatoria.
        const enriquecidas = await Promise.all(
          res.data.map(async (p) => {
            try {
              const conv = await convocatoriaService.detalle(p.publicacion_id)
              return { ...p, convocatoria: conv }
            } catch {
              return p
            }
          }),
        )
        setItems(enriquecidas)
      })
      .catch((err) => setError(parseApiError(err).message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let active = true
    convocatoriaService
      .misPostulaciones()
      .then(async (res) => {
        const enriquecidas = await Promise.all(
          res.data.map(async (p) => {
            try {
              const conv = await convocatoriaService.detalle(p.publicacion_id)
              return { ...p, convocatoria: conv }
            } catch {
              return p
            }
          }),
        )
        if (active) setItems(enriquecidas)
      })
      .catch((err) => active && setError(parseApiError(err).message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const retirar = async (pid: string) => {
    setAccion(pid)
    try {
      await convocatoriaService.retirar(pid)
      cargar()
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setAccion(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
        Mis postulaciones
      </h1>
      <p className="mt-1 text-ink-500 dark:text-ink-400">
        Haz seguimiento al estado de tus solicitudes.
      </p>

      {error && <Alert tone="error" className="mt-4">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-solar-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-ink-300 py-16 text-center dark:border-ink-700">
          <HeartHandshake className="mx-auto size-10 text-ink-300" />
          <p className="mt-3 text-ink-500 dark:text-ink-400">Aún no te has postulado a ninguna convocatoria.</p>
          <Link to="/app/convocatorias" className="mt-4 inline-block">
            <Button>Explorar convocatorias</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((p) => {
            const est = estadoPostulacionBadge(p.estado)
            return (
              <div
                key={p.id}
                className="rounded-2xl border border-ink-200/60 bg-white/70 p-4 backdrop-blur dark:border-ink-700/60 dark:bg-ink-900/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <Badge tone={est.tone}>{est.label}</Badge>
                  <span className="text-xs text-ink-400">{formatDate(p.fecha_postulacion)}</span>
                </div>
                {p.convocatoria ? (
                  <Link
                    to={`/app/convocatorias/${p.publicacion_id}`}
                    className="mt-1.5 block font-display text-lg font-bold text-ink-900 hover:text-solar-600 dark:text-white"
                  >
                    {p.convocatoria.titulo}
                  </Link>
                ) : (
                  <p className="mt-1.5 font-display text-lg font-bold text-ink-900 dark:text-white">
                    Convocatoria
                  </p>
                )}
                {p.motivo_rechazo && p.estado === 'RECHAZADO' && (
                  <p className="mt-1 text-xs text-red-500">Motivo: {p.motivo_rechazo}</p>
                )}
                {(p.estado === 'PENDIENTE' || p.estado === 'ACEPTADO') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={accion === p.id}
                    onClick={() => retirar(p.id)}
                    className="mt-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    Retirar postulación
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
