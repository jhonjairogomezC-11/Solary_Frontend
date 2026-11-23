import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Repeat } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { parseApiError } from '@/lib/apiClient'
import { formatDate } from '@/lib/utils'
import { programacionService } from '@/services/alineacionService'
import type { Programacion } from '@/types/alineacion'

const UNIDAD: Record<string, string> = { DIAS: 'día(s)', SEMANAS: 'semana(s)', MESES: 'mes(es)' }

export function ProgramacionesPage() {
  const [items, setItems] = useState<Programacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accion, setAccion] = useState<string | null>(null)

  const recargar = useCallback(async () => {
    try {
      setItems(await programacionService.mias())
    } catch (e) {
      setError(parseApiError(e).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    programacionService
      .mias()
      .then((r) => active && setItems(r))
      .catch((e) => active && setError(parseApiError(e).message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const ejecutar = async (id: string, fn: (id: string) => Promise<unknown>) => {
    setAccion(id)
    setError(null)
    try {
      await fn(id)
      await recargar()
    } catch (e) {
      setError(parseApiError(e).message)
    } finally {
      setAccion(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
        Actividades recurrentes
      </h1>
      <p className="mt-1 text-ink-500 dark:text-ink-400">
        Cada ciclo publica hasta 3 convocatorias. Al completarlo, la programación se pausa hasta que
        la autorices de nuevo.
      </p>
      {error && <Alert tone="error" className="mt-4">{error}</Alert>}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-solar-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-ink-300 py-16 text-center dark:border-ink-700">
          <Repeat className="mx-auto size-10 text-ink-300" />
          <p className="mt-3 text-ink-500">No tienes actividades recurrentes.</p>
          <Link to="/app/convocatorias/nueva" className="mt-4 inline-block">
            <Button>Crear una</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-ink-200/60 bg-white/70 p-4 dark:border-ink-700/60 dark:bg-ink-900/50"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-lg font-bold text-ink-900 dark:text-white">
                  {p.titulo}
                </p>
                <Badge tone={p.estado === 'ACTIVA' ? 'green' : p.estado === 'PAUSADA' ? 'amber' : 'gray'}>
                  {p.estado === 'PAUSADA' ? 'Pausada: requiere autorización' : p.estado}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-ink-500">
                Cada {p.intervalo} {UNIDAD[p.unidad_intervalo] ?? p.unidad_intervalo} · {p.duracion_dias}{' '}
                día(s) por actividad · {p.cupo_maximo} cupos · generadas en este ciclo:{' '}
                {p.ciclo_generadas}/3 · total: {p.total_generadas}
              </p>
              {p.estado !== 'TERMINADA' && (
                <p className="text-xs text-ink-500">Próxima fecha: {formatDate(p.proxima_fecha)}</p>
              )}
              {p.convocatorias.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-xs text-ink-500">
                  {p.convocatorias.slice(-5).map((c) => (
                    <li key={c.id}>
                      <Link to={`/app/convocatorias/${c.id}`} className="hover:text-solar-600">
                        {formatDate(c.fecha_inicio)} → {formatDate(c.fecha_fin)} · {c.estado}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 flex gap-2">
                {p.estado === 'PAUSADA' && (
                  <Button
                    size="sm"
                    loading={accion === p.id}
                    onClick={() => ejecutar(p.id, programacionService.autorizar)}
                  >
                    Autorizar nuevo ciclo
                  </Button>
                )}
                {p.estado !== 'TERMINADA' && (
                  <Button
                    size="sm"
                    variant="outline"
                    loading={accion === p.id}
                    className="text-red-500"
                    onClick={() => {
                      if (window.confirm('¿Finalizar esta programación? No se generarán más convocatorias.'))
                        ejecutar(p.id, programacionService.finalizar)
                    }}
                  >
                    Finalizar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
