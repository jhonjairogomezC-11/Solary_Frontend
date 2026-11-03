import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Megaphone, Plus } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { estadoPublicacionBadge, modalidadBadge } from '@/components/ui/badgeHelpers'
import { Button } from '@/components/ui/Button'
import { parseApiError } from '@/lib/apiClient'
import { formatDate } from '@/lib/utils'
import { convocatoriaService } from '@/services/convocatoriaService'
import type { Convocatoria } from '@/types/convocatoria'

export function MisConvocatoriasPage() {
  const [items, setItems] = useState<Convocatoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accion, setAccion] = useState<string | null>(null)

  const cargar = () => {
    setLoading(true)
    convocatoriaService
      .misConvocatorias()
      .then((res) => setItems(res.data))
      .catch((err) => setError(parseApiError(err).message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let active = true
    convocatoriaService
      .misConvocatorias()
      .then((res) => active && setItems(res.data))
      .catch((err) => active && setError(parseApiError(err).message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const publicar = async (id: string) => {
    setAccion(id)
    try {
      await convocatoriaService.publicar(id)
      cargar()
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setAccion(null)
    }
  }

  const cancelar = async (id: string) => {
    setAccion(id)
    try {
      await convocatoriaService.cancelar(id)
      cargar()
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setAccion(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
            Mis convocatorias
          </h1>
          <p className="mt-1 text-ink-500 dark:text-ink-400">Gestiona las oportunidades que publicas.</p>
        </div>
        <Link to="/app/convocatorias/nueva">
          <Button>
            <Plus className="size-4" /> Nueva
          </Button>
        </Link>
      </div>

      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-solar-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 py-16 text-center dark:border-ink-700">
          <Megaphone className="mx-auto size-10 text-ink-300" />
          <p className="mt-3 text-ink-500 dark:text-ink-400">Aún no has creado convocatorias.</p>
          <Link to="/app/convocatorias/nueva" className="mt-4 inline-block">
            <Button>Crear la primera</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((c) => {
            const est = estadoPublicacionBadge(c.estado)
            const mod = modalidadBadge(c.modalidad)
            return (
              <div
                key={c.id}
                className="flex flex-col gap-3 rounded-2xl border border-ink-200/60 bg-white/70 p-4 backdrop-blur sm:flex-row sm:items-center dark:border-ink-700/60 dark:bg-ink-900/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={est.tone}>{est.label}</Badge>
                    <Badge tone={mod.tone}>{mod.label}</Badge>
                  </div>
                  <Link
                    to={`/app/convocatorias/${c.id}`}
                    className="mt-1.5 block font-display text-lg font-bold text-ink-900 hover:text-solar-600 dark:text-white"
                  >
                    {c.titulo}
                  </Link>
                  <p className="text-sm text-ink-400">
                    {formatDate(c.fecha_inicio)} · {c.cupo_maximo} cupos
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link to={`/app/convocatorias/${c.id}/postulaciones`}>
                    <Button variant="outline" size="sm">Postulaciones</Button>
                  </Link>
                  {(c.estado === 'BORRADOR' || c.estado === 'PENDIENTE_APROBACION') && (
                    <Button size="sm" loading={accion === c.id} onClick={() => publicar(c.id)}>
                      Publicar
                    </Button>
                  )}
                  {c.estado !== 'CANCELADA' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={accion === c.id}
                      onClick={() => cancelar(c.id)}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
