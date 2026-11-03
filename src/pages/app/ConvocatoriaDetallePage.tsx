import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Link2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Users,
} from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { modalidadBadge } from '@/components/ui/badgeHelpers'
import { Button } from '@/components/ui/Button'
import { FavoritoButton } from '@/components/convocatorias/FavoritoButton'
import { useAuth } from '@/auth/AuthContext'
import { parseApiError } from '@/lib/apiClient'
import { formatDate, formatTime } from '@/lib/utils'
import { convocatoriaService } from '@/services/convocatoriaService'
import type { Convocatoria } from '@/types/convocatoria'

export function ConvocatoriaDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const esVoluntario = usuario?.rol === 'VOLUNTARIO'

  const [conv, setConv] = useState<Convocatoria | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [mensaje, setMensaje] = useState('')
  const [postulando, setPostulando] = useState(false)
  const [postulado, setPostulado] = useState(false)
  const [postError, setPostError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let active = true
    convocatoriaService
      .detalle(id)
      .then((c) => active && setConv(c))
      .catch((err) => active && setError(parseApiError(err).message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id])

  const postular = async () => {
    if (!id) return
    setPostulando(true)
    setPostError(null)
    try {
      await convocatoriaService.postular(id, mensaje || undefined)
      setPostulado(true)
    } catch (err) {
      setPostError(parseApiError(err).message)
    } finally {
      setPostulando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-solar-500" />
      </div>
    )
  }

  if (error || !conv) {
    return (
      <div className="mx-auto max-w-3xl">
        <Alert tone="error">{error ?? 'No se encontró la convocatoria.'}</Alert>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4" /> Volver
        </Button>
      </div>
    )
  }

  const mod = modalidadBadge(conv.modalidad)

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-solar-600 dark:text-ink-400"
      >
        <ArrowLeft className="size-4" /> Volver
      </button>

      <div className="overflow-hidden rounded-3xl border border-ink-200/60 bg-white/80 backdrop-blur dark:border-ink-700/60 dark:bg-ink-900/50">
        <div className="relative h-48 bg-gradient-to-br from-solar-400 to-orange-600 sm:h-56">
          {conv.imagen ? (
            <img src={conv.imagen} alt={conv.titulo} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center">
              <span className="font-display text-5xl font-black text-white/30">Solary</span>
            </div>
          )}
          <div className="absolute left-4 top-4">
            <Badge tone={mod.tone}>{mod.label}</Badge>
          </div>
          {esVoluntario && (
            <div className="absolute right-4 top-4">
              <FavoritoButton convocatoriaId={conv.id} />
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-3xl">
            {conv.titulo}
          </h1>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Info icon={CalendarDays} label="Fechas">
              {formatDate(conv.fecha_inicio)}
              {conv.fecha_fin !== conv.fecha_inicio && ` – ${formatDate(conv.fecha_fin)}`}
            </Info>
            {(conv.hora_inicio || conv.hora_fin) && (
              <Info icon={Clock} label="Horario">
                {formatTime(conv.hora_inicio) ?? '—'}
                {conv.hora_fin && ` – ${formatTime(conv.hora_fin)}`}
              </Info>
            )}
            <Info icon={Users} label="Cupos">
              {conv.cupo_maximo} voluntario{conv.cupo_maximo !== 1 ? 's' : ''}
            </Info>
            {conv.modalidad !== 'VIRTUAL' && conv.direccion_exacta && (
              <Info icon={MapPin} label="Ubicación">{conv.direccion_exacta}</Info>
            )}
            {conv.modalidad !== 'PRESENCIAL' && conv.enlace_virtual && (
              <Info icon={Link2} label="Enlace virtual">
                <a href={conv.enlace_virtual} target="_blank" rel="noreferrer" className="text-solar-600 hover:underline dark:text-solar-400">
                  Abrir enlace
                </a>
              </Info>
            )}
          </div>

          <div className="mt-6">
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Descripción</h2>
            <p className="mt-2 whitespace-pre-line text-ink-600 dark:text-ink-300">{conv.descripcion}</p>
          </div>

          {conv.requisitos_adicionales && (
            <div className="mt-5">
              <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Requisitos</h2>
              <p className="mt-2 whitespace-pre-line text-ink-600 dark:text-ink-300">
                {conv.requisitos_adicionales}
              </p>
            </div>
          )}

          {conv.habilidades.length > 0 && (
            <div className="mt-5">
              <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Habilidades</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {conv.habilidades.map((h) => (
                  <Badge key={h.id} tone="solar">{h.nombre}</Badge>
                ))}
              </div>
            </div>
          )}

          {(conv.contacto_nombre || conv.contacto_email || conv.contacto_telefono) && (
            <div className="mt-5 rounded-2xl bg-ink-50 p-4 dark:bg-ink-800/50">
              <h2 className="font-display text-sm font-bold text-ink-900 dark:text-white">Contacto</h2>
              <div className="mt-2 space-y-1 text-sm text-ink-600 dark:text-ink-300">
                {conv.contacto_nombre && <p>{conv.contacto_nombre}</p>}
                {conv.contacto_email && (
                  <p className="flex items-center gap-1.5">
                    <Mail className="size-4 text-solar-500" /> {conv.contacto_email}
                  </p>
                )}
                {conv.contacto_telefono && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="size-4 text-solar-500" /> {conv.contacto_telefono}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Postulación (solo voluntarios) */}
          {esVoluntario && (
            <div className="mt-8 border-t border-ink-200/60 pt-6 dark:border-ink-700">
              {postulado ? (
                <Alert tone="success">
                  ¡Te postulaste con éxito! La fundación revisará tu solicitud y recibirás una
                  notificación con su respuesta.
                </Alert>
              ) : (
                <>
                  <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">
                    Postularme
                  </h2>
                  {postError && (
                    <div className="mt-3">
                      <Alert tone={postError.includes('perfil') ? 'info' : 'error'}>
                        {postError}
                      </Alert>
                      {postError.includes('perfil') && (
                        <Button className="mt-3" onClick={() => navigate('/app/perfil')}>
                          Completar mi perfil
                        </Button>
                      )}
                    </div>
                  )}
                  <textarea
                    rows={3}
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    placeholder="Cuéntale a la fundación por qué quieres participar (opcional)."
                    className="mt-3 w-full rounded-xl border border-ink-200 bg-white/80 px-3.5 py-2.5 text-sm text-ink-900 shadow-sm transition placeholder:text-ink-400 focus:border-solar-400 focus:outline-none focus:ring-2 focus:ring-solar-400/70 dark:border-ink-700 dark:bg-ink-900/60 dark:text-white"
                  />
                  <Button onClick={postular} loading={postulando} size="lg" className="mt-3">
                    Enviar postulación
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Info({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof CalendarDays
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-solar-100 text-solar-600 dark:bg-solar-500/15 dark:text-solar-400">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink-400">{label}</p>
        <p className="text-sm text-ink-700 dark:text-ink-200">{children}</p>
      </div>
    </div>
  )
}
