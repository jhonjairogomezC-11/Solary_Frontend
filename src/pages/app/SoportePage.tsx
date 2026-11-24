import { useEffect, useState } from 'react'
import {
  Loader2,
  MessageSquarePlus,
  Plus,
  ShieldAlert,
  Ticket as TicketIcon,
} from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/badgeHelpers'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { parseApiError } from '@/lib/apiClient'
import { cn, formatDate } from '@/lib/utils'
import { voluntarioService } from '@/services/voluntarioService'
import type {
  SolicitudCuenta,
  Ticket,
  TicketDetalle,
  TipoSolicitudCuenta,
} from '@/types/voluntario'

const CATEGORIAS = [
  { value: 'PROBLEMAS_ACCESO', label: 'Problemas de acceso' },
  { value: 'PROBLEMAS_CUENTA', label: 'Problemas con mi cuenta' },
  { value: 'ERRORES_PLATAFORMA', label: 'Errores de la plataforma' },
  { value: 'PROBLEMAS_POSTULACIONES', label: 'Problemas con postulaciones' },
  { value: 'PROBLEMAS_CONVOCATORIAS', label: 'Problemas con convocatorias' },
  { value: 'PROBLEMAS_NOTIFICACIONES', label: 'Problemas con notificaciones' },
  { value: 'PROTECCION_DATOS', label: 'Protección de datos personales' },
  { value: 'SOLICITUDES_ADMINISTRATIVAS', label: 'Solicitudes administrativas' },
  { value: 'OTROS', label: 'Otros' },
]

const ESTADO_TICKET: Record<string, { label: string; tone: BadgeTone }> = {
  ABIERTO: { label: 'Abierto', tone: 'blue' },
  EN_REVISION: { label: 'En revisión', tone: 'amber' },
  PENDIENTE_INFORMACION: { label: 'Pendiente de info', tone: 'amber' },
  RESUELTO: { label: 'Resuelto', tone: 'green' },
  CERRADO: { label: 'Cerrado', tone: 'gray' },
}

const SOLICITUDES: { value: TipoSolicitudCuenta; label: string; peligro?: boolean }[] = [
  { value: 'BLOQUEO_TEMPORAL', label: 'Bloqueo temporal de cuenta' },
  { value: 'INHABILITACION', label: 'Inhabilitar mi cuenta' },
  { value: 'ELIMINACION_CUENTA', label: 'Eliminar mi cuenta', peligro: true },
  { value: 'ELIMINACION_DATOS', label: 'Eliminar mis datos personales', peligro: true },
  { value: 'REPORTE_ACCESO_SOSPECHOSO', label: 'Reportar acceso sospechoso' },
  { value: 'REPORTE_ACTIVIDAD_NO_AUTORIZADA', label: 'Reportar actividad no autorizada' },
]

type Tab = 'tickets' | 'privacidad'

export function SoportePage() {
  const [tab, setTab] = useState<Tab>('tickets')

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
          Centro de ayuda
        </h1>
        <p className="mt-1 text-ink-500 dark:text-ink-400">
          Comunícate con el equipo de Solari y gestiona tu cuenta.
        </p>
      </div>

      <div className="mb-6 flex gap-2 rounded-xl bg-ink-100 p-1 dark:bg-ink-800/60">
        <TabBtn activo={tab === 'tickets'} onClick={() => setTab('tickets')}>
          <TicketIcon className="size-4" /> Mis solicitudes
        </TabBtn>
        <TabBtn activo={tab === 'privacidad'} onClick={() => setTab('privacidad')}>
          <ShieldAlert className="size-4" /> Cuenta y privacidad
        </TabBtn>
      </div>

      {tab === 'tickets' ? <TicketsTab /> : <PrivacidadTab />}
    </div>
  )
}

function TabBtn({
  activo,
  onClick,
  children,
}: {
  activo: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
        activo
          ? 'bg-white text-ink-900 shadow-sm dark:bg-ink-900 dark:text-white'
          : 'text-ink-500 hover:text-ink-700 dark:text-ink-400',
      )}
    >
      {children}
    </button>
  )
}

/* ─────────────── Tickets ─────────────── */

function TicketsTab() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)
  const [abierto, setAbierto] = useState<TicketDetalle | null>(null)

  const cargar = () => {
    setLoading(true)
    voluntarioService
      .misTickets()
      .then(setTickets)
      .catch((err) => setError(parseApiError(err).message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    voluntarioService
      .misTickets()
      .then(setTickets)
      .catch((err) => setError(parseApiError(err).message))
      .finally(() => setLoading(false))
    // Si llegamos desde una notificación (?ticket=<id>), abre ese ticket.
    const ticketId = new URLSearchParams(window.location.search).get('ticket')
    if (ticketId) {
      voluntarioService.detalleTicket(ticketId).then(setAbierto).catch(() => {})
    }
  }, [])

  if (abierto) {
    return <TicketDetalleView ticket={abierto} onVolver={() => { setAbierto(null); cargar() }} />
  }

  if (creando) {
    return (
      <NuevoTicket
        onCancelar={() => setCreando(false)}
        onCreado={() => { setCreando(false); cargar() }}
      />
    )
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreando(true)}>
          <Plus className="size-4" /> Nueva solicitud
        </Button>
      </div>

      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-7 animate-spin text-solar-500" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 py-16 text-center dark:border-ink-700">
          <TicketIcon className="mx-auto size-10 text-ink-300" />
          <p className="mt-3 text-ink-500 dark:text-ink-400">No tienes solicitudes de soporte.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => {
            const info = ESTADO_TICKET[t.estado] ?? { label: t.estado, tone: 'gray' as BadgeTone }
            return (
              <button
                key={t.id}
                onClick={() => voluntarioService.detalleTicket(t.id).then(setAbierto)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-ink-200/60 bg-white/70 p-4 text-left transition hover:border-solar-300 hover:shadow-soft dark:border-ink-700/60 dark:bg-ink-900/50"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold text-ink-900 dark:text-white">
                    <span className="text-xs font-mono text-ink-400">#{t.numero}</span>
                    <span className="truncate">{t.asunto}</span>
                  </p>
                  <p className="mt-0.5 truncate text-sm text-ink-500 dark:text-ink-400">
                    {t.descripcion}
                  </p>
                  <p className="mt-1 text-xs text-ink-400">{formatDate(t.fecha_creacion)}</p>
                </div>
                <Badge tone={info.tone}>{info.label}</Badge>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function NuevoTicket({
  onCancelar,
  onCreado,
}: {
  onCancelar: () => void
  onCreado: () => void
}) {
  const [categoria, setCategoria] = useState('')
  const [asunto, setAsunto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const crear = async () => {
    setError(null)
    setSaving(true)
    try {
      await voluntarioService.crearTicket({ categoria, asunto, descripcion })
      onCreado()
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-ink-200/60 bg-white/70 p-6 dark:border-ink-700/60 dark:bg-ink-900/50">
      <h2 className="mb-4 font-display text-lg font-bold text-ink-900 dark:text-white">
        Nueva solicitud de soporte
      </h2>
      {error && <Alert tone="error" className="mb-4">{error}</Alert>}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          crear()
        }}
        className="space-y-4"
      >
        <Select
          label="Categoría"
          placeholder="Selecciona el tipo de problema"
          options={CATEGORIAS}
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          required
        />
        <Input
          label="Asunto"
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          placeholder="Resume tu solicitud"
          required
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
            Descripción
          </label>
          <textarea
            rows={5}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Describe con detalle lo que sucede."
            className="w-full rounded-xl border border-ink-200 bg-white/80 px-3.5 py-2.5 text-sm text-ink-900 shadow-sm focus:border-solar-400 focus:outline-none focus:ring-2 focus:ring-solar-400/70 dark:border-ink-700 dark:bg-ink-900/60 dark:text-white"
            required
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving}>
            Enviar solicitud
          </Button>
        </div>
      </form>
    </div>
  )
}

function TicketDetalleView({
  ticket,
  onVolver,
}: {
  ticket: TicketDetalle
  onVolver: () => void
}) {
  const [detalle, setDetalle] = useState<TicketDetalle>(ticket)
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cerrado = detalle.estado === 'CERRADO'

  const responder = async () => {
    if (!mensaje.trim()) return
    setEnviando(true)
    setError(null)
    try {
      await voluntarioService.responderTicket(detalle.id, mensaje)
      const actualizado = await voluntarioService.detalleTicket(detalle.id)
      setDetalle(actualizado)
      setMensaje('')
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setEnviando(false)
    }
  }

  const info = ESTADO_TICKET[detalle.estado] ?? { label: detalle.estado, tone: 'gray' as BadgeTone }

  return (
    <div>
      <button
        onClick={onVolver}
        className="mb-4 text-sm font-medium text-ink-500 hover:text-solar-600 dark:text-ink-400"
      >
        ← Volver a solicitudes
      </button>

      <div className="rounded-2xl border border-ink-200/60 bg-white/70 p-6 dark:border-ink-700/60 dark:bg-ink-900/50">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-mono text-ink-400">#{detalle.numero}</p>
            <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">
              {detalle.asunto}
            </h2>
          </div>
          <Badge tone={info.tone}>{info.label}</Badge>
        </div>
        <p className="mt-3 whitespace-pre-line text-ink-600 dark:text-ink-300">
          {detalle.descripcion}
        </p>

        {/* Hilo de mensajes */}
        {detalle.mensajes.length > 0 && (
          <div className="mt-6 space-y-3 border-t border-ink-200/60 pt-4 dark:border-ink-700">
            {detalle.mensajes.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
                  m.es_admin
                    ? 'bg-ink-100 text-ink-800 dark:bg-ink-800 dark:text-ink-100'
                    : 'ml-auto bg-solar-500 text-white',
                )}
              >
                <p className="mb-0.5 text-xs font-semibold opacity-80">
                  {m.es_admin ? 'Soporte Solari' : 'Tú'}
                </p>
                <p className="whitespace-pre-line">{m.mensaje}</p>
              </div>
            ))}
          </div>
        )}

        {/* Responder */}
        {cerrado ? (
          <Alert tone="info" className="mt-5">
            Esta solicitud está cerrada. Si necesitas más ayuda, crea una nueva.
          </Alert>
        ) : (
          <div className="mt-5 border-t border-ink-200/60 pt-4 dark:border-ink-700">
            {error && <Alert tone="error" className="mb-3">{error}</Alert>}
            <textarea
              rows={3}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe un mensaje o aporta más información."
              className="w-full rounded-xl border border-ink-200 bg-white/80 px-3.5 py-2.5 text-sm text-ink-900 shadow-sm focus:border-solar-400 focus:outline-none focus:ring-2 focus:ring-solar-400/70 dark:border-ink-700 dark:bg-ink-900/60 dark:text-white"
            />
            <div className="mt-3 flex justify-between">
              <Button
                variant="ghost"
                onClick={() => voluntarioService.cerrarTicket(detalle.id).then(onVolver)}
              >
                Cerrar solicitud
              </Button>
              <Button onClick={responder} loading={enviando} disabled={!mensaje.trim()}>
                <MessageSquarePlus className="size-4" /> Responder
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────── Privacidad / cuenta ─────────────── */

function PrivacidadTab() {
  const [solicitudes, setSolicitudes] = useState<SolicitudCuenta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [tipo, setTipo] = useState<TipoSolicitudCuenta | ''>('')
  const [motivo, setMotivo] = useState('')
  const [saving, setSaving] = useState(false)

  const cargar = () => {
    setLoading(true)
    voluntarioService
      .misSolicitudes()
      .then(setSolicitudes)
      .catch((err) => setError(parseApiError(err).message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    voluntarioService
      .misSolicitudes()
      .then(setSolicitudes)
      .catch((err) => setError(parseApiError(err).message))
      .finally(() => setLoading(false))
  }, [])

  const crear = async () => {
    if (!tipo) return
    setSaving(true)
    setError(null)
    setOk(null)
    try {
      await voluntarioService.crearSolicitud(tipo, motivo || undefined)
      setOk('Tu solicitud fue registrada. El equipo la revisará y te responderá.')
      setTipo('')
      setMotivo('')
      cargar()
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setSaving(false)
    }
  }

  const esPeligrosa = SOLICITUDES.find((s) => s.value === tipo)?.peligro

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-ink-200/60 bg-white/70 p-6 dark:border-ink-700/60 dark:bg-ink-900/50">
        <h2 className="mb-1 font-display text-lg font-bold text-ink-900 dark:text-white">
          Gestión de cuenta y datos
        </h2>
        <p className="mb-4 text-sm text-ink-500 dark:text-ink-400">
          Conforme a la Ley 1581 de 2012, puedes solicitar acciones sobre tu cuenta y tus datos.
          Estas solicitudes son revisadas por un administrador antes de ejecutarse.
        </p>

        {error && <Alert tone="error" className="mb-3">{error}</Alert>}
        {ok && <Alert tone="success" className="mb-3">{ok}</Alert>}

        <div className="space-y-4">
          <Select
            label="Tipo de solicitud"
            placeholder="Selecciona"
            options={SOLICITUDES.map((s) => ({ value: s.value, label: s.label }))}
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoSolicitudCuenta)}
          />
          {esPeligrosa && (
            <Alert tone="info">
              Esta acción es sensible. No se ejecuta de inmediato: será validada por el equipo y
              algunos datos pueden conservarse por obligaciones legales (anonimizándolos).
            </Alert>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
              Motivo (opcional)
            </label>
            <textarea
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Cuéntanos el motivo de tu solicitud."
              className="w-full rounded-xl border border-ink-200 bg-white/80 px-3.5 py-2.5 text-sm text-ink-900 shadow-sm focus:border-solar-400 focus:outline-none focus:ring-2 focus:ring-solar-400/70 dark:border-ink-700 dark:bg-ink-900/60 dark:text-white"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={crear} loading={saving} disabled={!tipo}>
              Enviar solicitud
            </Button>
          </div>
        </div>
      </div>

      {/* Historial de solicitudes */}
      <div>
        <h3 className="mb-3 font-display text-base font-bold text-ink-900 dark:text-white">
          Mis solicitudes
        </h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-solar-500" />
          </div>
        ) : solicitudes.length === 0 ? (
          <p className="text-sm text-ink-500 dark:text-ink-400">No has hecho solicitudes.</p>
        ) : (
          <div className="space-y-2">
            {solicitudes.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-ink-200/60 bg-white/70 p-3 dark:border-ink-700/60 dark:bg-ink-900/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink-800 dark:text-ink-100">
                    {SOLICITUDES.find((x) => x.value === s.tipo)?.label ?? s.tipo}
                  </span>
                  <Badge tone={s.estado === 'PENDIENTE' ? 'amber' : s.estado === 'RECHAZADA' ? 'red' : 'green'}>
                    {s.estado}
                  </Badge>
                </div>
                {s.respuesta_admin && (
                  <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{s.respuesta_admin}</p>
                )}
                <p className="mt-1 text-xs text-ink-400">{formatDate(s.fecha_creacion)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
