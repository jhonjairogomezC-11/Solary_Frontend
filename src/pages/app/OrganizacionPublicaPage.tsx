import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, Loader2, Star } from 'lucide-react'

import { useAuth } from '@/auth/AuthContext'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { parseApiError } from '@/lib/apiClient'
import { formatDate } from '@/lib/utils'
import { organizacionService } from '@/services/alineacionService'
import { voluntarioService } from '@/services/voluntarioService'
import type { OrganizacionPublica, Resena } from '@/types/alineacion'

export function OrganizacionPublicaPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const [org, setOrg] = useState<OrganizacionPublica | null>(null)
  const [resenas, setResenas] = useState<Resena[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nota, setNota] = useState(5)
  const [comentario, setComentario] = useState('')
  const [respuestas, setRespuestas] = useState<Record<string, string>>({})

  const cargar = useCallback(async () => {
    if (!id) return
    try {
      const [o, r] = await Promise.all([organizacionService.perfil(id), organizacionService.resenas(id)])
      setOrg(o)
      setResenas(r.data)
    } catch (e) {
      setError(parseApiError(e).message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    let active = true
    if (!id) return
    Promise.all([organizacionService.perfil(id), organizacionService.resenas(id)])
      .then(([o, r]) => {
        if (!active) return
        setOrg(o)
        setResenas(r.data)
      })
      .catch((e) => active && setError(parseApiError(e).message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id])

  const run = async (fn: () => Promise<unknown>) => {
    setError(null)
    try {
      await fn()
      await cargar()
    } catch (e) {
      setError(parseApiError(e).message)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-solar-500" />
      </div>
    )
  if (!org) return <Alert tone="error">{error ?? 'Organización no encontrada.'}</Alert>

  const e = org.estadisticas
  const stats: [string, number][] = [
    ['Convocatorias creadas', e.convocatorias_creadas],
    ['Actividades realizadas', e.individuales_realizadas + e.recurrentes_realizadas],
    ['Actividades canceladas', e.individuales_canceladas + e.recurrentes_canceladas],
    ['Voluntarios participantes', e.voluntarios_participantes],
    ['Participaciones confirmadas', e.participaciones_confirmadas],
    ['Días en Solari', e.antiguedad_dias],
  ]

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-solar-600"
      >
        <ArrowLeft className="size-4" /> Volver
      </button>

      <div className="flex items-start gap-4">
        {org.logo && <img src={org.logo} alt={org.nombre} className="size-20 rounded-2xl object-cover" />}
        <div className="flex-1">
          <h1 className="flex items-center gap-2 font-display text-3xl font-extrabold text-ink-900 dark:text-white">
            {org.nombre}
            {org.verificacion.verificada && <BadgeCheck className="size-6 text-blue-500" aria-label="Verificada" />}
          </h1>
          <p className="text-sm text-ink-500">
            {org.tipo_organizacion}
            {org.municipio && ` · ${org.municipio}`}
            {!org.constituida_legalmente && ' · Sin constitución legal'}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {org.areas.map((a) => (
              <Badge key={a.id} tone="solar">{a.nombre}</Badge>
            ))}
          </div>
        </div>
        {usuario?.rol === 'VOLUNTARIO' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => run(() => voluntarioService.toggleFavoritoFundacion(org.id))}
          >
            {org.es_favorita ? '♥ En favoritos' : '♡ Favorita'}
          </Button>
        )}
        {org.es_mia && (
          <Link to="/app/perfil-publico">
            <Button size="sm" variant="outline">Editar</Button>
          </Link>
        )}
      </div>

      {error && <Alert tone="error" className="mt-4">{error}</Alert>}

      {org.verificacion.verificada && (
        <p className="mt-3 rounded-xl bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
          {org.verificacion.aviso}
        </p>
      )}

      <p className="mt-4 text-ink-700 dark:text-ink-200">{org.descripcion}</p>
      {org.historia && (
        <section className="mt-4">
          <h2 className="font-semibold text-ink-900 dark:text-white">Nuestra historia</h2>
          <p className="text-sm text-ink-600 dark:text-ink-300">{org.historia}</p>
        </section>
      )}
      {org.mision && (
        <section className="mt-4">
          <h2 className="font-semibold text-ink-900 dark:text-white">Misión</h2>
          <p className="text-sm text-ink-600 dark:text-ink-300">{org.mision}</p>
        </section>
      )}

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {stats.map(([k, v]) => (
          <div key={k} className="rounded-xl border border-ink-200/60 bg-white/70 p-3 text-center dark:border-ink-700/60 dark:bg-ink-900/50">
            <p className="text-xl font-bold text-ink-900 dark:text-white">{v}</p>
            <p className="text-xs text-ink-500">{k}</p>
          </div>
        ))}
      </div>

      {(org.contacto.telefono || org.contacto.correo || org.contacto.direccion || org.contacto.pagina_web) && (
        <section className="mt-6 text-sm text-ink-600 dark:text-ink-300">
          <h2 className="font-semibold text-ink-900 dark:text-white">Contacto</h2>
          {org.contacto.telefono && <p>Teléfono: {org.contacto.telefono}</p>}
          {org.contacto.correo && <p>Correo: {org.contacto.correo}</p>}
          {org.contacto.direccion && <p>Dirección: {org.contacto.direccion}</p>}
          {org.contacto.pagina_web && <p>Web: {org.contacto.pagina_web}</p>}
        </section>
      )}

      {org.galeria.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 font-semibold text-ink-900 dark:text-white">Galería</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {org.galeria.map((g) => (
              <img key={g.id} src={g.ruta} alt={g.descripcion ?? 'Foto'} className="h-32 w-full rounded-xl object-cover" />
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="flex items-center gap-2 font-semibold text-ink-900 dark:text-white">
          Reseñas
          {org.resenas.promedio != null && (
            <span className="flex items-center gap-1 text-sm text-ink-500">
              <Star className="size-4 fill-solar-500 text-solar-500" /> {org.resenas.promedio} ({org.resenas.total})
            </span>
          )}
        </h2>

        {org.puede_resenar && !org.mi_resena && (
          <div className="mt-3 rounded-xl border border-ink-200/60 p-3 dark:border-ink-700/60">
            <p className="text-sm text-ink-600 dark:text-ink-300">Participaste en una actividad de esta organización. Cuéntanos tu experiencia.</p>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setNota(n)} aria-label={`${n} estrellas`}>
                  <Star className={`size-6 ${n <= nota ? 'fill-solar-500 text-solar-500' : 'text-ink-300'}`} />
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              value={comentario}
              onChange={(ev) => setComentario(ev.target.value)}
              placeholder="Mínimo 10 caracteres"
              className="mt-2 w-full rounded-xl border border-ink-200 px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-white"
            />
            <Button
              size="sm"
              className="mt-2"
              disabled={comentario.trim().length < 10}
              onClick={() =>
                run(async () => {
                  await organizacionService.resenar(org.id, nota, comentario.trim())
                  setComentario('')
                })
              }
            >
              Publicar reseña
            </Button>
          </div>
        )}
        {usuario?.rol === 'VOLUNTARIO' && !org.puede_resenar && !org.mi_resena && (
          <p className="mt-2 text-xs text-ink-500">Podrás reseñar esta organización cuando tu participación en una de sus actividades sea confirmada.</p>
        )}

        <div className="mt-3 space-y-3">
          {resenas.length === 0 && <p className="text-sm text-ink-500">Aún no hay reseñas.</p>}
          {resenas.map((r) => (
            <div key={r.id} className="rounded-xl border border-ink-200/60 bg-white/70 p-3 dark:border-ink-700/60 dark:bg-ink-900/50">
              <p className="text-sm font-semibold text-ink-900 dark:text-white">
                {r.voluntario_nombre} · {'★'.repeat(r.calificacion)}
                <span className="ml-2 text-xs font-normal text-ink-400">{formatDate(r.fecha_creacion)}</span>
              </p>
              <p className="text-sm text-ink-600 dark:text-ink-300">{r.comentario}</p>
              {r.respuesta && (
                <p className="mt-2 border-l-2 border-solar-400 pl-3 text-sm text-ink-600 dark:text-ink-300">
                  <strong>Respuesta de la organización:</strong> {r.respuesta}
                </p>
              )}
              {org.es_mia && !r.respuesta && (
                <div className="mt-2 flex gap-2">
                  <input
                    value={respuestas[r.id] ?? ''}
                    onChange={(ev) => setRespuestas({ ...respuestas, [r.id]: ev.target.value })}
                    placeholder="Responder…"
                    className="flex-1 rounded-lg border border-ink-200 px-3 py-1.5 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-white"
                  />
                  <Button size="sm" onClick={() => run(() => organizacionService.responderResena(r.id, respuestas[r.id] ?? ''))}>
                    Responder
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
