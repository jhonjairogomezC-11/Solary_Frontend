import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Clock, Eye, History, Loader2, MessageCircle, Star, X } from 'lucide-react'

import { ChatPostulacion } from '@/components/mensajes/ChatPostulacion'
import { ESTADOS_CON_CHAT } from '@/services/mensajeService'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { estadoPostulacionBadge } from '@/components/ui/badgeHelpers'
import { Button } from '@/components/ui/Button'
import { parseApiError } from '@/lib/apiClient'
import { formatDate } from '@/lib/utils'
import { convocatoriaService } from '@/services/convocatoriaService'
import type { HistorialPostulacion, Postulante, ResumenCupos } from '@/types/alineacion'

type Decision = 'ACEPTADO' | 'RECHAZADO' | 'EN_REVISION' | 'LISTA_ESPERA'

const DECISIONES_POR_ESTADO: Record<string, Decision[]> = {
  PENDIENTE: ['ACEPTADO', 'EN_REVISION', 'LISTA_ESPERA', 'RECHAZADO'],
  EN_REVISION: ['ACEPTADO', 'LISTA_ESPERA', 'RECHAZADO'],
  LISTA_ESPERA: ['ACEPTADO', 'RECHAZADO'],
  ACEPTADO: ['RECHAZADO'],
}

const ETIQUETA: Record<Decision, string> = {
  ACEPTADO: 'Aceptar',
  RECHAZADO: 'Rechazar',
  EN_REVISION: 'En revisión',
  LISTA_ESPERA: 'Lista de espera',
}

export function PostulacionesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [items, setItems] = useState<Postulante[]>([])
  const [resumen, setResumen] = useState<ResumenCupos | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accion, setAccion] = useState<string | null>(null)
  const [calificando, setCalificando] = useState<string | null>(null)
  const [nota, setNota] = useState(5)
  const [chatAbierto, setChatAbierto] = useState<string | null>(null)
  const [historial, setHistorial] = useState<{ id: string; items: HistorialPostulacion[] } | null>(
    null,
  )

  const recargar = useCallback(async () => {
    if (!id) return
    try {
      const res = await convocatoriaService.postulacionesDe(id)
      setItems(res.data)
      setResumen(res.resumen)
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    let active = true
    if (!id) return
    convocatoriaService
      .postulacionesDe(id)
      .then((res) => {
        if (!active) return
        setItems(res.data)
        setResumen(res.resumen)
      })
      .catch((err) => active && setError(parseApiError(err).message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id])

  const ejecutar = async (pid: string, fn: () => Promise<unknown>) => {
    setAccion(pid)
    setError(null)
    try {
      await fn()
      setCalificando(null)
      await recargar()
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setAccion(null)
    }
  }

  const verHistorial = async (pid: string) => {
    if (historial?.id === pid) {
      setHistorial(null)
      return
    }
    try {
      setHistorial({ id: pid, items: await convocatoriaService.historial(pid) })
    } catch (err) {
      setError(parseApiError(err).message)
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
        Revisa el perfil, la compatibilidad y decide. El voluntario recibe una notificación con cada
        decisión.
      </p>

      {resumen && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            ['Cupo', resumen.cupo_maximo],
            ['Aceptados', resumen.aceptados],
            ['Disponibles', resumen.disponibles],
            ['Pendientes', resumen.pendientes],
            ['En espera', resumen.lista_espera],
          ].map(([k, v]) => (
            <div
              key={k}
              className="rounded-xl border border-ink-200/60 bg-white/70 p-3 text-center dark:border-ink-700/60 dark:bg-ink-900/50"
            >
              <p className="text-xl font-bold text-ink-900 dark:text-white">{v}</p>
              <p className="text-xs text-ink-500">{k}</p>
            </div>
          ))}
        </div>
      )}

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
            const v = p.voluntario
            const decisiones = DECISIONES_POR_ESTADO[p.estado] ?? []
            return (
              <div
                key={p.id}
                className="rounded-2xl border border-ink-200/60 bg-white/70 p-4 backdrop-blur dark:border-ink-700/60 dark:bg-ink-900/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge tone={est.tone}>{est.label}</Badge>
                    {v && (
                      <Badge tone={v.coincidencia >= 60 ? 'green' : 'gray'}>
                        {v.coincidencia}% compatible
                      </Badge>
                    )}
                    {v?.menor_de_edad && (
                      <Badge tone={v.autorizacion_estado === 'APROBADA' ? 'blue' : 'amber'}>
                        Menor de edad · autorización{' '}
                        {v.autorizacion_estado === 'APROBADA' ? 'aprobada' : 'pendiente'}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-ink-400">{formatDate(p.fecha_postulacion)}</span>
                </div>

                {v && (
                  <div className="mt-3 text-sm text-ink-600 dark:text-ink-300">
                    <p className="font-semibold text-ink-900 dark:text-white">
                      {v.nombre}
                      {v.esta_verificado && <span className="ml-1 text-xs text-green-600">✓ verificado</span>}
                    </p>
                    <p className="text-xs text-ink-500">
                      {[v.municipio, v.disponibilidad, v.profesion].filter(Boolean).join(' · ')}
                    </p>
                    <p className="mt-1 text-xs">
                      {v.actividades_completadas} actividades · {v.horas_acumuladas} h · {v.xp_total} XP
                    </p>
                    {v.habilidades.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {v.habilidades.map((h) => (
                          <span
                            key={h}
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              v.habilidades_coinciden.includes(h)
                                ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                                : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300'
                            }`}
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {p.mensaje_voluntario && (
                  <p className="mt-3 rounded-xl bg-ink-50 p-3 text-sm text-ink-600 dark:bg-ink-800/50 dark:text-ink-300">
                    “{p.mensaje_voluntario}”
                  </p>
                )}

                {decisiones.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {decisiones.map((d) => (
                      <Button
                        key={d}
                        size="sm"
                        variant={d === 'ACEPTADO' ? 'primary' : 'outline'}
                        loading={accion === p.id}
                        onClick={() => ejecutar(p.id, () => convocatoriaService.responder(p.id, d))}
                        className={d === 'RECHAZADO' ? 'text-red-500' : ''}
                      >
                        {d === 'ACEPTADO' && <Check className="size-4" />}
                        {d === 'RECHAZADO' && <X className="size-4" />}
                        {d === 'EN_REVISION' && <Eye className="size-4" />}
                        {d === 'LISTA_ESPERA' && <Clock className="size-4" />}
                        {ETIQUETA[d]}
                      </Button>
                    ))}
                  </div>
                )}

                {p.estado === 'ACEPTADO' && (
                  <div className="mt-3 rounded-xl border border-ink-200/60 p-3 dark:border-ink-700/60">
                    {calificando === p.id ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-ink-700 dark:text-ink-200">
                          Califica el desempeño del voluntario
                        </p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button key={n} type="button" onClick={() => setNota(n)} aria-label={`${n} estrellas`}>
                              <Star
                                className={`size-6 ${n <= nota ? 'fill-solar-500 text-solar-500' : 'text-ink-300'}`}
                              />
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            loading={accion === p.id}
                            onClick={() =>
                              ejecutar(p.id, () =>
                                convocatoriaService.confirmarAsistencia(p.id, true, nota),
                              )
                            }
                          >
                            Confirmar asistencia
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            loading={accion === p.id}
                            onClick={() =>
                              ejecutar(p.id, () => convocatoriaService.confirmarAsistencia(p.id, false))
                            }
                          >
                            No asistió
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setCalificando(null)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setCalificando(p.id)}>
                        Registrar asistencia
                      </Button>
                    )}
                  </div>
                )}

                {p.calificacion != null && (
                  <p className="mt-2 text-xs text-ink-500">Calificación: {p.calificacion}/5</p>
                )}

                {ESTADOS_CON_CHAT.includes(p.estado) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setChatAbierto(chatAbierto === p.id ? null : p.id)}
                    className="mt-3"
                  >
                    <MessageCircle className="size-4" /> Mensajes
                  </Button>
                )}
                {chatAbierto === p.id && (
                  <ChatPostulacion postulacionId={p.id} onClose={() => setChatAbierto(null)} />
                )}

                <button
                  onClick={() => verHistorial(p.id)}
                  className="mt-3 flex items-center gap-1 text-xs text-ink-500 hover:text-solar-600"
                >
                  <History className="size-3.5" /> Historial de cambios
                </button>
                {historial?.id === p.id && (
                  <ul className="mt-2 space-y-1 text-xs text-ink-500">
                    {historial.items.map((h, i) => (
                      <li key={i}>
                        {formatDate(h.fecha)}: {h.estado_anterior ?? '—'} → {h.estado_nuevo}
                        {h.rol_actor && ` (${h.rol_actor})`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
