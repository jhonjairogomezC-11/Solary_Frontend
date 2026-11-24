import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Loader2,
  MapPin,
  Users,
  Video,
} from 'lucide-react'

import { useAuth } from '@/auth/AuthContext'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { parseApiError } from '@/lib/apiClient'
import { cn } from '@/lib/utils'
import { calendarioService, type EventoCalendario } from '@/services/calendarioService'

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]
const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const DIAS_LARGOS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const DIAS_PROXIMOS = 60

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_REVISION: 'En revisión',
  LISTA_ESPERA: 'Lista de espera',
}

/** Fecha local en formato YYYY-MM-DD (sin conversión a UTC). */
function iso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function desdeIso(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function sumarDias(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

/** Días de la cuadrícula del mes: de lunes a domingo, semanas completas. */
function diasDeCuadricula(mes: Date): Date[] {
  const primero = new Date(mes.getFullYear(), mes.getMonth(), 1)
  const desfase = (primero.getDay() + 6) % 7 // lunes = 0
  const inicio = sumarDias(primero, -desfase)
  const ultimo = new Date(mes.getFullYear(), mes.getMonth() + 1, 0)
  const total = Math.ceil((desfase + ultimo.getDate()) / 7) * 7
  return Array.from({ length: total }, (_, i) => sumarDias(inicio, i))
}

function hora(h: string | null): string {
  return h ? h.slice(0, 5) : ''
}

function fechaLarga(s: string): string {
  const d = desdeIso(s)
  return `${DIAS_LARGOS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`
}

interface Carga {
  clave: string
  eventos: EventoCalendario[]
  error: string | null
}

export function CalendarioPage() {
  const { usuario } = useAuth()
  const esFundacion = usuario?.rol === 'FUNDACION'
  const hoy = useMemo(() => iso(new Date()), [])

  const [mes, setMes] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const dias = useMemo(() => diasDeCuadricula(mes), [mes])
  const rangoMes = useMemo(
    () => ({ desde: iso(dias[0]), hasta: iso(dias[dias.length - 1]) }),
    [dias],
  )
  const claveMes = `${rangoMes.desde}_${rangoMes.hasta}`

  const [cargaMes, setCargaMes] = useState<Carga | null>(null)
  const [proximos, setProximos] = useState<Carga | null>(null)
  const [descargando, setDescargando] = useState(false)
  const [errorIcs, setErrorIcs] = useState<string | null>(null)

  const cargar = esFundacion ? calendarioService.fundacion : calendarioService.voluntario

  useEffect(() => {
    let activo = true
    cargar(rangoMes)
      .then((eventos) => activo && setCargaMes({ clave: claveMes, eventos, error: null }))
      .catch(
        (err) =>
          activo && setCargaMes({ clave: claveMes, eventos: [], error: parseApiError(err).message }),
      )
    return () => {
      activo = false
    }
  }, [cargar, rangoMes, claveMes])

  useEffect(() => {
    let activo = true
    const rango = { desde: hoy, hasta: iso(sumarDias(desdeIso(hoy), DIAS_PROXIMOS)) }
    cargar(rango)
      .then((eventos) => activo && setProximos({ clave: hoy, eventos, error: null }))
      .catch(
        (err) =>
          activo && setProximos({ clave: hoy, eventos: [], error: parseApiError(err).message }),
      )
    return () => {
      activo = false
    }
  }, [cargar, hoy])

  const cargandoMes = cargaMes?.clave !== claveMes
  const eventosMes = useMemo(
    () => (cargaMes && cargaMes.clave === claveMes ? cargaMes.eventos : []),
    [cargaMes, claveMes],
  )

  const porDia = useMemo(() => {
    const mapa = new Map<string, EventoCalendario[]>()
    for (const d of dias) {
      const k = iso(d)
      const delDia = eventosMes.filter((e) => e.fecha_inicio <= k && e.fecha_fin >= k)
      if (delDia.length) mapa.set(k, delDia)
    }
    return mapa
  }, [dias, eventosMes])

  const cambiarMes = (delta: number) =>
    setMes((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1))

  const irAHoy = () => {
    const d = new Date()
    setMes(new Date(d.getFullYear(), d.getMonth(), 1))
  }

  const descargarIcs = async () => {
    setDescargando(true)
    setErrorIcs(null)
    try {
      await calendarioService.descargarIcs()
    } catch (err) {
      setErrorIcs(parseApiError(err).message)
    } finally {
      setDescargando(false)
    }
  }

  const error = cargaMes?.error ?? proximos?.error ?? errorIcs

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
            Calendario
          </h1>
          <p className="mt-1 text-ink-500 dark:text-ink-400">
            {esFundacion
              ? 'Tus convocatorias publicadas y cuántos voluntarios tienes aceptados.'
              : 'Tus actividades de voluntariado aceptadas y las postulaciones en espera.'}
          </p>
        </div>
        {!esFundacion && (
          <Button variant="outline" size="sm" onClick={descargarIcs} loading={descargando}>
            {!descargando && <Download className="size-4" />} Agregar a mi calendario (.ics)
          </Button>
        )}
      </div>

      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      <section className="rounded-2xl border border-ink-200/60 bg-white/70 p-4 dark:border-ink-700/60 dark:bg-ink-900/50 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="font-display text-xl font-bold capitalize text-ink-900 dark:text-white">
            {MESES[mes.getMonth()]} {mes.getFullYear()}
          </h2>
          <div className="flex items-center gap-1">
            {cargandoMes && <Loader2 className="mr-2 size-4 animate-spin text-solar-500" />}
            <Button variant="ghost" size="sm" onClick={() => cambiarMes(-1)} aria-label="Mes anterior">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={irAHoy}>
              Hoy
            </Button>
            <Button variant="ghost" size="sm" onClick={() => cambiarMes(1)} aria-label="Mes siguiente">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-ink-400">
          {DIAS_CORTOS.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {dias.map((d) => {
            const k = iso(d)
            const delMes = d.getMonth() === mes.getMonth()
            const esHoy = k === hoy
            const eventos = porDia.get(k) ?? []
            return (
              <div
                key={k}
                className={cn(
                  'min-h-20 rounded-xl border p-1.5 text-left sm:min-h-24',
                  delMes
                    ? 'border-ink-200/70 bg-white dark:border-ink-700/70 dark:bg-ink-900/60'
                    : 'border-transparent bg-ink-50/50 opacity-60 dark:bg-ink-800/30',
                  esHoy && 'border-solar-400 ring-2 ring-solar-300/60 dark:border-solar-500',
                )}
              >
                <span
                  className={cn(
                    'inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold',
                    esHoy
                      ? 'bg-solar-500 text-white'
                      : 'text-ink-600 dark:text-ink-300',
                  )}
                  aria-label={esHoy ? 'Hoy' : undefined}
                >
                  {d.getDate()}
                </span>
                <div className="mt-1 space-y-1">
                  {eventos.slice(0, 2).map((e) => (
                    <Link
                      key={`${e.publicacion_id}-${k}`}
                      to={`/app/convocatorias/${e.publicacion_id}`}
                      title={e.titulo}
                      className={cn(
                        'block truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium',
                        e.confirmada
                          ? 'bg-solar-100 text-solar-800 hover:bg-solar-200 dark:bg-solar-500/20 dark:text-solar-200'
                          : 'border border-dashed border-ink-300 text-ink-600 hover:bg-ink-100 dark:border-ink-600 dark:text-ink-300',
                      )}
                    >
                      {hora(e.hora_inicio) && k === e.fecha_inicio ? `${hora(e.hora_inicio)} ` : ''}
                      {e.titulo}
                    </Link>
                  ))}
                  {eventos.length > 2 && (
                    <p className="px-1 text-[11px] font-medium text-ink-500">
                      +{eventos.length - 2} más
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        {!esFundacion && (
          <p className="mt-3 flex items-center gap-2 text-xs text-ink-500">
            <span className="inline-block size-3 rounded bg-solar-200 dark:bg-solar-500/40" /> Aceptada
            <span className="ml-3 inline-block size-3 rounded border border-dashed border-ink-400" /> En espera de respuesta
          </p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-xl font-bold text-ink-900 dark:text-white">
          Próximas actividades
        </h2>
        {!proximos ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-7 animate-spin text-solar-500" />
          </div>
        ) : proximos.eventos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-300 py-12 text-center dark:border-ink-700">
            <CalendarDays className="mx-auto size-10 text-ink-300" />
            <p className="mt-3 text-ink-500 dark:text-ink-400">
              No tienes actividades en los próximos {DIAS_PROXIMOS} días.
            </p>
            {!esFundacion && (
              <Link
                to="/app/convocatorias"
                className="mt-2 inline-block text-sm font-semibold text-solar-600 hover:underline"
              >
                Explorar convocatorias
              </Link>
            )}
          </div>
        ) : (
          <ul className="space-y-2">
            {proximos.eventos.map((e) => (
              <li key={e.postulacion_id ?? e.publicacion_id}>
                <ItemProximo evento={e} esFundacion={esFundacion} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function ItemProximo({ evento: e, esFundacion }: { evento: EventoCalendario; esFundacion: boolean }) {
  const horario =
    e.hora_inicio && e.hora_fin
      ? `${hora(e.hora_inicio)} – ${hora(e.hora_fin)}`
      : hora(e.hora_inicio)
  const varios = e.fecha_fin !== e.fecha_inicio
  return (
    <Link
      to={`/app/convocatorias/${e.publicacion_id}`}
      className="flex items-start gap-4 rounded-2xl border border-ink-200/60 bg-white/70 p-4 transition hover:border-solar-300 hover:bg-solar-50/60 dark:border-ink-700/60 dark:bg-ink-900/50 dark:hover:border-solar-500/40"
    >
      <div className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-gradient-to-br from-solar-400 to-solar-600 py-1.5 text-white">
        <span className="text-[11px] font-semibold uppercase">
          {MESES[desdeIso(e.fecha_inicio).getMonth()].slice(0, 3)}
        </span>
        <span className="font-display text-xl font-extrabold leading-none">
          {desdeIso(e.fecha_inicio).getDate()}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-ink-900 dark:text-white">{e.titulo}</p>
          {!e.confirmada && e.estado_postulacion && (
            <Badge tone="amber">{ESTADO_LABEL[e.estado_postulacion] ?? e.estado_postulacion}</Badge>
          )}
        </div>
        <p className="mt-0.5 text-sm text-ink-500 dark:text-ink-400">{e.organizacion}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-600 dark:text-ink-300">
          <span className="inline-flex items-center gap-1 first-letter:uppercase">
            <CalendarDays className="size-3.5" />
            {fechaLarga(e.fecha_inicio)}
            {varios && ` al ${fechaLarga(e.fecha_fin)}`}
          </span>
          {horario && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" /> {horario}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            {e.modalidad === 'VIRTUAL' ? <Video className="size-3.5" /> : <MapPin className="size-3.5" />}
            {e.modalidad === 'VIRTUAL'
              ? 'Virtual'
              : [e.direccion_exacta, e.municipio].filter(Boolean).join(', ') || 'Presencial'}
            {e.modalidad === 'HIBRIDA' && ' · Híbrida'}
          </span>
          {esFundacion && e.cupo_maximo != null && (
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" /> {e.voluntarios_aceptados ?? 0}/{e.cupo_maximo} aceptados
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
