import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
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
  const [fotoActiva, setFotoActiva] = useState(0)

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
  const fotos = conv.imagenes?.length ? conv.imagenes.map((i) => i.ruta) : conv.imagen ? [conv.imagen] : []

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-solar-600 dark:text-ink-400"
      >
        <ArrowLeft className="size-4" /> Volver
      </button>

      <div className="overflow-hidden rounded-3xl border border-ink-200/60 bg-white/80 backdrop-blur dark:border-ink-700/60 dark:bg-ink-900/50">
        <div className="relative h-56 bg-gradient-to-br from-solar-400 to-orange-600 sm:h-80">
          {fotos.length > 0 ? (
            <img
              src={fotos[Math.min(fotoActiva, fotos.length - 1)]}
              alt={conv.titulo}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <span className="font-display text-5xl font-black text-white/30">Solari</span>
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

        {fotos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-b border-ink-200/60 bg-ink-50/60 p-3 dark:border-ink-700/60 dark:bg-ink-900/40">
            {fotos.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setFotoActiva(i)}
                aria-label={`Ver foto ${i + 1}`}
                className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${i === fotoActiva ? 'border-solar-500' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                <img src={src} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="p-6 sm:p-8">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-3xl">
            {conv.titulo}
          </h1>

          {conv.fundacion && (
            <Link
              to={`/app/organizaciones/${conv.fundacion.id}`}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-solar-600 hover:underline dark:text-solar-400"
            >
              {conv.fundacion.nombre}
              {conv.fundacion.verificada && <BadgeCheck className="size-4 text-blue-500" aria-label="Organización verificada" />}
            </Link>
          )}
          {conv.coincidencia != null && (
            <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
              <strong>{conv.coincidencia}% de compatibilidad</strong> con tus habilidades. Es solo una
              referencia: puedes postularte igual.
            </p>
          )}

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

          {/* Chips informativos de beneficios/certificado/horas */}
          <div className="mt-5 flex flex-wrap gap-2">
            {conv.urgente && <Badge tone="red">Urgente</Badge>}
            {conv.otorga_certificado && <Badge tone="green">Otorga certificado</Badge>}
            {conv.horas_reconocidas > 0 && (
              <Badge tone="solar">{conv.horas_reconocidas} h reconocidas</Badge>
            )}
            {conv.incluye_transporte && <Badge tone="blue">Transporte incluido</Badge>}
            {conv.incluye_alimentacion && <Badge tone="blue">Alimentación incluida</Badge>}
            {conv.incluye_seguro && <Badge tone="blue">Seguro / cobertura</Badge>}
            {conv.nivel_experiencia && <Badge tone="gray">Nivel: {conv.nivel_experiencia}</Badge>}
          </div>

          {conv.fecha_limite_postulacion && (
            <div className="mt-4">
              <Info icon={CalendarDays} label="Fecha límite de postulación">
                {formatDate(conv.fecha_limite_postulacion)}
              </Info>
            </div>
          )}

          <div className="mt-6">
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Descripción</h2>
            <p className="mt-2 whitespace-pre-line text-ink-600 dark:text-ink-300">{conv.descripcion}</p>
          </div>

          <Seccion titulo="Objetivo de la actividad" texto={conv.objetivo} />
          <Seccion titulo="Impacto social esperado" texto={conv.impacto_esperado} />
          <Seccion titulo="¿Qué harás como voluntario?" texto={conv.actividades_voluntario} />
          <Seccion titulo="Perfil de los beneficiarios" texto={conv.perfil_beneficiarios} />
          <Seccion titulo="¿Qué debes llevar?" texto={conv.que_llevar} />
          <Seccion titulo="Recomendaciones" texto={conv.recomendaciones} />
          <Seccion titulo="Política de cancelación" texto={conv.politica_cancelacion} />

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
                  <Badge key={h.id} tone={conv.habilidades_coinciden?.includes(h.id) ? 'green' : 'solar'}>
                    {conv.habilidades_coinciden?.includes(h.id) ? '✓ ' : ''}
                    {h.nombre}
                  </Badge>
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

function Seccion({ titulo, texto }: { titulo: string; texto: string | null }) {
  if (!texto) return null
  return (
    <div className="mt-5">
      <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">{titulo}</h2>
      <p className="mt-2 whitespace-pre-line text-ink-600 dark:text-ink-300">{texto}</p>
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
