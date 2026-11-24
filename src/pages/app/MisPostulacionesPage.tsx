import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  CalendarDays,
  Clock,
  HeartHandshake,
  Loader2,
  MapPin,
  MessageCircle,
} from 'lucide-react'

import { DescargarCertificadoButton } from '@/components/certificados/DescargarCertificadoButton'
import { ChatPostulacion } from '@/components/mensajes/ChatPostulacion'
import { ESTADOS_CON_CHAT } from '@/services/mensajeService'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { estadoPostulacionBadge, modalidadBadge } from '@/components/ui/badgeHelpers'
import { Button } from '@/components/ui/Button'
import { parseApiError } from '@/lib/apiClient'
import { cn, formatDate, formatTime } from '@/lib/utils'
import { convocatoriaService } from '@/services/convocatoriaService'
import type { Convocatoria, Postulacion } from '@/types/convocatoria'

interface PostConv extends Postulacion {
  convocatoria?: Convocatoria
}

const ESTADOS_ACTIVOS = ['PENDIENTE', 'EN_REVISION', 'LISTA_ESPERA', 'ACEPTADO']

type Filtro = 'activas' | 'historial' | 'todas'

/** Franja de color lateral según el estado de la postulación. */
const FRANJA: Record<string, string> = {
  PENDIENTE: 'before:bg-amber-400',
  EN_REVISION: 'before:bg-purple-400',
  LISTA_ESPERA: 'before:bg-amber-400',
  ACEPTADO: 'before:bg-emerald-500',
  ASISTIO: 'before:bg-sky-500',
  RECHAZADO: 'before:bg-red-400',
  NO_ASISTIO: 'before:bg-red-400',
  CANCELADO_FUNDACION: 'before:bg-red-400',
  RETIRADO: 'before:bg-ink-300',
}

function rangoFechas(inicio: string, fin: string): string {
  return inicio === fin ? formatDate(inicio) : `${formatDate(inicio)} – ${formatDate(fin)}`
}

export function MisPostulacionesPage() {
  const [items, setItems] = useState<PostConv[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accion, setAccion] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<Filtro>('activas')
  // Si llegamos desde una notificación (?chat=<id>), el chat se abre solo.
  const [chatAbierto, setChatAbierto] = useState<string | null>(
    () => new URLSearchParams(window.location.search).get('chat'),
  )

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

  const retirar = async (pid: string, estado: string) => {
    if (
      estado === 'ACEPTADO' &&
      !window.confirm(
        'Ya fuiste aceptado. Si te retiras se liberará tu cupo para otra persona. ¿Confirmas el retiro?',
      )
    ) {
      return
    }
    setAccion(pid)
    try {
      await convocatoriaService.retirar(pid, estado === 'ACEPTADO')
      cargar()
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setAccion(null)
    }
  }

  const activas = items.filter((p) => ESTADOS_ACTIVOS.includes(p.estado))
  const visibles =
    filtro === 'activas' ? activas : filtro === 'historial' ? items.filter((p) => !ESTADOS_ACTIVOS.includes(p.estado)) : items
  const TABS: { id: Filtro; label: string; n: number }[] = [
    { id: 'activas', label: 'Activas', n: activas.length },
    { id: 'historial', label: 'Historial', n: items.length - activas.length },
    { id: 'todas', label: 'Todas', n: items.length },
  ]

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
        Mis postulaciones
      </h1>
      <p className="mt-1 text-ink-500 dark:text-ink-400">
        Haz seguimiento al estado de tus solicitudes.
      </p>

      {!loading && !error && items.length > 0 && (
        <div className="mt-5 flex gap-1 rounded-xl bg-ink-100 p-1 dark:bg-ink-800/60">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFiltro(t.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                filtro === t.id
                  ? 'bg-white text-ink-900 shadow-sm dark:bg-ink-900 dark:text-white'
                  : 'text-ink-500 hover:text-ink-700 dark:text-ink-400',
              )}
            >
              {t.label}
              <span
                className={cn(
                  'rounded-full px-1.5 text-xs',
                  filtro === t.id ? 'bg-solar-100 text-solar-700' : 'bg-ink-200/70 text-ink-500',
                )}
              >
                {t.n}
              </span>
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4">
          <Alert tone={error.includes('perfil') ? 'info' : 'error'}>{error}</Alert>
          {error.includes('perfil') && (
            <Link to="/app/perfil" className="mt-3 inline-block">
              <Button>Completar mi perfil</Button>
            </Link>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-solar-500" />
        </div>
      ) : error ? null : items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-ink-300 py-16 text-center dark:border-ink-700">
          <HeartHandshake className="mx-auto size-10 text-ink-300" />
          <p className="mt-3 text-ink-500 dark:text-ink-400">Aún no te has postulado a ninguna convocatoria.</p>
          <Link to="/app/convocatorias" className="mt-4 inline-block">
            <Button>Explorar convocatorias</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {visibles.length === 0 && (
            <div className="rounded-2xl border border-dashed border-ink-300 py-12 text-center text-sm text-ink-500 dark:border-ink-700 dark:text-ink-400">
              {filtro === 'activas'
                ? 'No tienes postulaciones activas.'
                : 'Todavía no tienes postulaciones en el historial.'}
            </div>
          )}
          {visibles.map((p) => {
            const est = estadoPostulacionBadge(p.estado)
            const c = p.convocatoria
            const mod = c ? modalidadBadge(c.modalidad) : null
            const hora = c ? formatTime(c.hora_inicio) : null
            const puedeRetirar = ESTADOS_ACTIVOS.includes(p.estado)
            const puedeChat = ESTADOS_CON_CHAT.includes(p.estado)
            const certificado = p.estado === 'ASISTIO' && c?.otorga_certificado
            return (
              <article
                key={p.id}
                className={cn(
                  'relative overflow-hidden rounded-2xl border border-ink-200/60 bg-white/80 p-5 pl-6 shadow-sm backdrop-blur transition hover:shadow-md dark:border-ink-700/60 dark:bg-ink-900/50',
                  'before:absolute before:inset-y-0 before:left-0 before:w-1.5',
                  FRANJA[p.estado] ?? 'before:bg-ink-300',
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge tone={est.tone}>{est.label}</Badge>
                  <span className="text-xs text-ink-400">
                    Postulado el {formatDate(p.fecha_postulacion)}
                  </span>
                </div>

                {c ? (
                  <Link
                    to={`/app/convocatorias/${p.publicacion_id}`}
                    className="mt-2 block font-display text-xl font-bold leading-snug text-ink-900 hover:text-solar-600 dark:text-white"
                  >
                    {c.titulo}
                  </Link>
                ) : (
                  <p className="mt-2 font-display text-xl font-bold text-ink-900 dark:text-white">
                    Convocatoria no disponible
                  </p>
                )}

                {c && (
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-500 dark:text-ink-400">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-4 text-solar-500" />
                      {rangoFechas(c.fecha_inicio, c.fecha_fin)}
                    </span>
                    {hora && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-4 text-solar-500" />
                        {hora}
                      </span>
                    )}
                    {mod && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-4 text-solar-500" />
                        {mod.label}
                      </span>
                    )}
                    {c.otorga_certificado && (
                      <span className="inline-flex items-center gap-1.5">
                        <Award className="size-4 text-solar-500" />
                        Certificado
                      </span>
                    )}
                  </div>
                )}

                {p.motivo_rechazo && p.estado === 'RECHAZADO' && (
                  <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-300">
                    Motivo: {p.motivo_rechazo}
                  </p>
                )}

                {(puedeRetirar || puedeChat || certificado) && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3 dark:border-ink-800">
                    {puedeChat && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setChatAbierto(chatAbierto === p.id ? null : p.id)}
                      >
                        <MessageCircle className="size-4" /> Mensajes
                      </Button>
                    )}
                    {certificado && <DescargarCertificadoButton postulacionId={p.id} />}
                    {puedeRetirar && (
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={accion === p.id}
                        onClick={() => retirar(p.id, p.estado)}
                        className="ml-auto text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        Retirar postulación
                      </Button>
                    )}
                  </div>
                )}

                {chatAbierto === p.id && (
                  <ChatPostulacion postulacionId={p.id} onClose={() => setChatAbierto(null)} />
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
