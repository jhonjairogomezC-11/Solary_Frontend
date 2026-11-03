import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Loader2, X } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { estadoPostulacionBadge } from '@/components/ui/badgeHelpers'
import { Button } from '@/components/ui/Button'
import { parseApiError } from '@/lib/apiClient'
import { formatDate } from '@/lib/utils'
import { convocatoriaService } from '@/services/convocatoriaService'
import type { Postulacion } from '@/types/convocatoria'

export function PostulacionesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [items, setItems] = useState<Postulacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accion, setAccion] = useState<string | null>(null)

  const cargar = () => {
    if (!id) return
    setLoading(true)
    convocatoriaService
      .postulacionesDe(id)
      .then((res) => setItems(res.data))
      .catch((err) => setError(parseApiError(err).message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let active = true
    if (!id) return
    convocatoriaService
      .postulacionesDe(id)
      .then((res) => active && setItems(res.data))
      .catch((err) => active && setError(parseApiError(err).message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id])

  const responder = async (pid: string, estado: 'ACEPTADO' | 'RECHAZADO') => {
    setAccion(pid)
    setError(null)
    try {
      const extra =
        estado === 'RECHAZADO' ? { motivo_rechazo: 'No cumple con el perfil requerido.' } : {}
      await convocatoriaService.responder(pid, estado, extra)
      cargar()
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setAccion(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-solar-600 dark:text-ink-400"
      >
        <ArrowLeft className="size-4" /> Volver
      </button>

      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
        Postulaciones
      </h1>
      <p className="mt-1 text-ink-500 dark:text-ink-400">
        Revisa y responde a los voluntarios interesados.
      </p>

      {error && <Alert tone="error" className="mt-4">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-solar-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-ink-300 py-16 text-center dark:border-ink-700">
          <p className="text-ink-500 dark:text-ink-400">Aún no hay postulaciones.</p>
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
                {p.mensaje_voluntario && (
                  <p className="mt-3 rounded-xl bg-ink-50 p-3 text-sm text-ink-600 dark:bg-ink-800/50 dark:text-ink-300">
                    “{p.mensaje_voluntario}”
                  </p>
                )}
                {p.estado === 'PENDIENTE' && (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" loading={accion === p.id} onClick={() => responder(p.id, 'ACEPTADO')}>
                      <Check className="size-4" /> Aceptar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      loading={accion === p.id}
                      onClick={() => responder(p.id, 'RECHAZADO')}
                      className="text-red-500"
                    >
                      <X className="size-4" /> Rechazar
                    </Button>
                  </div>
                )}
                {p.motivo_rechazo && p.estado === 'RECHAZADO' && (
                  <p className="mt-2 text-xs text-red-500">Motivo: {p.motivo_rechazo}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
