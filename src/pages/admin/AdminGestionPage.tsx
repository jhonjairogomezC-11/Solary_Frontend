import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { abrirArchivoPrivado } from '@/lib/archivos'
import { parseApiError } from '@/lib/apiClient'
import { formatDate } from '@/lib/utils'
import { adminGestionService as api } from '@/services/alineacionService'
import type {
  AdminAuditoria,
  AdminResena,
  AdminSolicitud,
  AdminTicket,
  AdminTicketDetalle,
  AdminVerificacion,
} from '@/types/alineacion'

type Tab = 'tickets' | 'privacidad' | 'verificaciones' | 'resenas' | 'auditoria'
const TABS: [Tab, string][] = [
  ['tickets', 'Soporte'],
  ['privacidad', 'Privacidad'],
  ['verificaciones', 'Verificaciones'],
  ['resenas', 'Reseñas'],
  ['auditoria', 'Auditoría'],
]

/** Carga una lista paginada y expone `recargar`. */
function useLista<T>(fn: () => Promise<{ data: T[] }>) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const recargar = useCallback(async () => {
    try {
      setItems((await fn()).data)
    } catch (e) {
      setError(parseApiError(e).message)
    } finally {
      setLoading(false)
    }
  }, [fn])
  useEffect(() => {
    let active = true
    fn()
      .then((r) => active && setItems(r.data))
      .catch((e) => active && setError(parseApiError(e).message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [fn])
  return { items, loading, error, setError, recargar }
}

const Cargando = () => (
  <div className="flex justify-center py-12">
    <Loader2 className="size-7 animate-spin text-solar-500" />
  </div>
)

const fTickets = () => api.tickets()
const fSolicitudes = () => api.solicitudes()
const fVerif = () => api.verificaciones()
const fResenas = () => api.resenas()
const fAudit = () => api.auditoria()

function Tickets() {
  const { items, loading, error, setError, recargar } = useLista<AdminTicket>(fTickets)
  const [det, setDet] = useState<AdminTicketDetalle | null>(null)
  const [texto, setTexto] = useState('')

  const abrir = async (id: string) => {
    try {
      setDet(await api.ticket(id))
    } catch (e) {
      setError(parseApiError(e).message)
    }
  }
  const responder = async (estado?: string) => {
    if (!det || !texto.trim()) return
    try {
      setDet(await api.responderTicket(det.id, texto.trim(), estado))
      setTexto('')
      await recargar()
    } catch (e) {
      setError(parseApiError(e).message)
    }
  }

  if (loading) return <Cargando />
  return (
    <div className="space-y-3">
      {error && <Alert tone="error">{error}</Alert>}
      {items.length === 0 && <p className="text-sm text-ink-500">No hay tickets.</p>}
      {items.map((t) => (
        <div key={t.id} className="rounded-xl border border-ink-200/60 bg-white/70 p-3 dark:border-ink-700/60 dark:bg-ink-900/50">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-ink-900 dark:text-white">#{t.numero} · {t.asunto}</p>
            <Badge tone={t.estado === 'RESUELTO' || t.estado === 'CERRADO' ? 'green' : 'amber'}>{t.estado}</Badge>
          </div>
          <p className="text-xs text-ink-500">{t.usuario_nombre} ({t.usuario_email}) · {t.categoria} · {formatDate(t.fecha_creacion)}</p>
          <Button size="sm" variant="outline" className="mt-2" onClick={() => abrir(t.id)}>Abrir</Button>
          {det?.id === t.id && (
            <div className="mt-3 space-y-2 rounded-lg bg-ink-50 p-3 dark:bg-ink-800/50">
              <p className="text-sm text-ink-700 dark:text-ink-200">{det.descripcion}</p>
              {det.mensajes.map((m) => (
                <p key={m.id} className={`text-sm ${m.es_admin ? 'text-solar-700' : 'text-ink-600 dark:text-ink-300'}`}>
                  <strong>{m.es_admin ? 'Soporte' : 'Usuario'}:</strong> {m.mensaje}
                </p>
              ))}
              <textarea rows={2} value={texto} onChange={(e) => setTexto(e.target.value)} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-white" placeholder="Respuesta…" />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => responder()}>Responder</Button>
                <Button size="sm" variant="outline" onClick={() => responder('RESUELTO')}>Responder y resolver</Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function Privacidad() {
  const { items, loading, error, setError, recargar } = useLista<AdminSolicitud>(fSolicitudes)
  const [resp, setResp] = useState<Record<string, string>>({})

  const resolver = async (s: AdminSolicitud, decision: 'EN_PROCESO' | 'APROBAR' | 'RECHAZAR', ejecutar = false) => {
    const respuesta = resp[s.id]
    if (decision !== 'EN_PROCESO' && !respuesta?.trim()) {
      setError('Escribe una respuesta para el usuario.')
      return
    }
    if (ejecutar && !window.confirm('Se ejecutará la acción sobre la cuenta. ¿Continuar?')) return
    try {
      await api.resolverSolicitud(s.id, decision, respuesta, ejecutar)
      setError(null)
      await recargar()
    } catch (e) {
      setError(parseApiError(e).message)
    }
  }

  if (loading) return <Cargando />
  return (
    <div className="space-y-3">
      {error && <Alert tone="error">{error}</Alert>}
      {items.length === 0 && <p className="text-sm text-ink-500">No hay solicitudes.</p>}
      {items.map((s) => {
        const abierta = s.estado === 'PENDIENTE' || s.estado === 'EN_PROCESO'
        return (
          <div key={s.id} className="rounded-xl border border-ink-200/60 bg-white/70 p-3 dark:border-ink-700/60 dark:bg-ink-900/50">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-ink-900 dark:text-white">{s.tipo} · {s.usuario_nombre} ({s.usuario_rol})</p>
              <Badge tone={abierta ? 'amber' : 'gray'}>{s.estado}</Badge>
            </div>
            <p className="text-xs text-ink-500">{s.usuario_email} · {formatDate(s.fecha_creacion)}</p>
            {s.motivo && <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">{s.motivo}</p>}
            {s.respuesta_admin && <p className="mt-1 text-sm text-solar-700">Respuesta: {s.respuesta_admin}</p>}
            {abierta && (
              <div className="mt-2 space-y-2">
                <input value={resp[s.id] ?? ''} onChange={(e) => setResp({ ...resp, [s.id]: e.target.value })} placeholder="Respuesta al usuario" className="w-full rounded-lg border border-ink-200 px-3 py-1.5 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-white" />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => resolver(s, 'EN_PROCESO')}>En proceso</Button>
                  <Button size="sm" onClick={() => resolver(s, 'APROBAR')}>Aprobar</Button>
                  <Button size="sm" variant="outline" className="text-amber-600" onClick={() => resolver(s, 'APROBAR', true)}>Aprobar y ejecutar</Button>
                  <Button size="sm" variant="outline" className="text-red-500" onClick={() => resolver(s, 'RECHAZAR')}>Rechazar</Button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Verificaciones() {
  const { items, loading, error, setError, recargar } = useLista<AdminVerificacion>(fVerif)
  const [nota, setNota] = useState<Record<string, string>>({})

  const resolver = async (v: AdminVerificacion, accion: string) => {
    try {
      await api.resolverVerificacion(v.fundacion_id, accion, nota[v.fundacion_id])
      setError(null)
      await recargar()
    } catch (e) {
      setError(parseApiError(e).message)
    }
  }

  if (loading) return <Cargando />
  return (
    <div className="space-y-3">
      {error && <Alert tone="error">{error}</Alert>}
      {items.length === 0 && <p className="text-sm text-ink-500">No hay verificaciones pendientes.</p>}
      {items.map((v) => (
        <div key={v.fundacion_id} className="rounded-xl border border-ink-200/60 bg-white/70 p-3 dark:border-ink-700/60 dark:bg-ink-900/50">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-ink-900 dark:text-white">{v.nombre}</p>
            <Badge tone={v.estado === 'VERIFICADA' ? 'green' : 'amber'}>{v.estado}</Badge>
          </div>
          <p className="text-xs text-ink-500">
            {v.tipo_organizacion} · {v.constituida_legalmente ? `NIT ${v.nit ?? '—'}` : 'Sin constitución legal'}
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {v.documentos.map((d) => (
              <li key={d.id}>
                <button className="text-solar-600 hover:underline" onClick={() => abrirArchivoPrivado(d.ruta_archivo)}>
                  {d.tipo_documento} · {d.nombre_original}
                </button>
              </li>
            ))}
          </ul>
          <input value={nota[v.fundacion_id] ?? ''} onChange={(e) => setNota({ ...nota, [v.fundacion_id]: e.target.value })} placeholder="Nota (obligatoria al rechazar, pedir info o revocar)" className="mt-2 w-full rounded-lg border border-ink-200 px-3 py-1.5 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-white" />
          <div className="mt-2 flex flex-wrap gap-2">
            {v.estado === 'EN_REVISION' && (
              <>
                <Button size="sm" onClick={() => resolver(v, 'APROBAR')}>Aprobar</Button>
                <Button size="sm" variant="outline" onClick={() => resolver(v, 'PEDIR_INFO')}>Pedir información</Button>
                <Button size="sm" variant="outline" className="text-red-500" onClick={() => resolver(v, 'RECHAZAR')}>Rechazar</Button>
              </>
            )}
            {v.estado === 'VERIFICADA' && (
              <Button size="sm" variant="outline" className="text-red-500" onClick={() => resolver(v, 'REVOCAR')}>Revocar</Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function Resenas() {
  const { items, loading, error, setError, recargar } = useLista<AdminResena>(fResenas)

  const moderar = async (r: AdminResena, accion: 'APROBAR' | 'OCULTAR') => {
    let motivo: string | undefined
    if (accion === 'OCULTAR') {
      motivo = window.prompt('Motivo para ocultar la reseña:') ?? undefined
      if (!motivo?.trim()) return
    }
    try {
      await api.moderarResena(r.id, accion, motivo)
      setError(null)
      await recargar()
    } catch (e) {
      setError(parseApiError(e).message)
    }
  }

  if (loading) return <Cargando />
  return (
    <div className="space-y-3">
      {error && <Alert tone="error">{error}</Alert>}
      {items.length === 0 && <p className="text-sm text-ink-500">No hay reseñas.</p>}
      {items.map((r) => (
        <div key={r.id} className="rounded-xl border border-ink-200/60 bg-white/70 p-3 dark:border-ink-700/60 dark:bg-ink-900/50">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-900 dark:text-white">
              {r.voluntario_nombre} → {r.fundacion_nombre} · {'★'.repeat(r.calificacion)}
            </p>
            <Badge tone={r.estado === 'VISIBLE' ? 'green' : 'gray'}>{r.estado}</Badge>
          </div>
          <p className="text-sm text-ink-600 dark:text-ink-300">{r.comentario}</p>
          {r.motivo_moderacion && <p className="text-xs text-red-500">Motivo: {r.motivo_moderacion}</p>}
          <div className="mt-2 flex gap-2">
            {r.estado !== 'VISIBLE' && <Button size="sm" onClick={() => moderar(r, 'APROBAR')}>Mostrar</Button>}
            {r.estado === 'VISIBLE' && <Button size="sm" variant="outline" className="text-red-500" onClick={() => moderar(r, 'OCULTAR')}>Ocultar</Button>}
          </div>
        </div>
      ))}
    </div>
  )
}

function Auditoria() {
  const { items, loading, error } = useLista<AdminAuditoria>(fAudit)
  if (loading) return <Cargando />
  return (
    <div className="space-y-2">
      {error && <Alert tone="error">{error}</Alert>}
      {items.length === 0 && <p className="text-sm text-ink-500">Sin registros.</p>}
      {items.map((a) => (
        <div key={a.id} className="rounded-xl border border-ink-200/60 bg-white/70 p-3 text-sm dark:border-ink-700/60 dark:bg-ink-900/50">
          <p className="font-semibold text-ink-900 dark:text-white">{a.tipo}{a.objeto_descripcion && ` · ${a.objeto_descripcion}`}</p>
          <p className="text-xs text-ink-500">{a.admin_nombre} · {formatDate(a.fecha_accion)}{a.motivo && ` · ${a.motivo}`}</p>
        </div>
      ))}
    </div>
  )
}

export function AdminGestionPage() {
  const [tab, setTab] = useState<Tab>('tickets')
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">Gestión</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map(([k, l]) => (
          <Button key={k} size="sm" variant={tab === k ? 'primary' : 'outline'} onClick={() => setTab(k)}>
            {l}
          </Button>
        ))}
      </div>
      <div className="mt-5">
        {tab === 'tickets' && <Tickets />}
        {tab === 'privacidad' && <Privacidad />}
        {tab === 'verificaciones' && <Verificaciones />}
        {tab === 'resenas' && <Resenas />}
        {tab === 'auditoria' && <Auditoria />}
      </div>
    </div>
  )
}
