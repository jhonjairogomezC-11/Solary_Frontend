import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { parseApiError } from '@/lib/apiClient'
import { formatDate } from '@/lib/utils'
import { ofrecimientoService } from '@/services/alineacionService'
import type { MensajeInteres, SolicitudInteres } from '@/types/alineacion'

const ABIERTAS = ['PENDIENTE', 'ACEPTADA', 'EN_COORDINACION']
const ACEPTADAS = ['ACEPTADA', 'EN_COORDINACION']

export function SolicitudesInteresPage() {
  const [items, setItems] = useState<SolicitudInteres[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chat, setChat] = useState<{ id: string; msgs: MensajeInteres[] } | null>(null)
  const [texto, setTexto] = useState('')

  // Si llegamos desde una notificación (?chat=<id>), abre ese chat.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('chat')
    if (!id) return
    let active = true
    ofrecimientoService
      .mensajes(id)
      .then((msgs) => active && setChat({ id, msgs }))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const recargar = useCallback(async () => {
    try {
      setItems(await ofrecimientoService.solicitudes())
    } catch (e) {
      setError(parseApiError(e).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    ofrecimientoService
      .solicitudes()
      .then((r) => active && setItems(r))
      .catch((e) => active && setError(parseApiError(e).message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const run = async (fn: () => Promise<unknown>) => {
    setError(null)
    try {
      await fn()
      await recargar()
    } catch (e) {
      setError(parseApiError(e).message)
    }
  }

  const abrirChat = async (id: string) => {
    if (chat?.id === id) return setChat(null)
    try {
      setChat({ id, msgs: await ofrecimientoService.mensajes(id) })
    } catch (e) {
      setError(parseApiError(e).message)
    }
  }

  const enviar = async () => {
    if (!chat || !texto.trim()) return
    try {
      const msgs = await ofrecimientoService.enviarMensaje(chat.id, texto.trim())
      setChat({ id: chat.id, msgs })
      setTexto('')
    } catch (e) {
      setError(parseApiError(e).message)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/app/ofrecimientos"
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-solar-600 hover:underline"
      >
        <ArrowLeft className="size-4" /> Volver a objetos y servicios
      </Link>
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
        Solicitudes de interés
      </h1>
      <p className="mt-1 text-ink-500 dark:text-ink-400">
        Coordinen la entrega por mensajes. La entrega se marca completada solo cuando ambas partes la
        confirman.
      </p>
      {error && <Alert tone="error" className="mt-4">{error}</Alert>}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-solar-500" />
        </div>
      ) : items.length === 0 ? (
        <p className="mt-8 text-center text-ink-500">No tienes solicitudes.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((s) => {
            const yoConfirme = s.soy_voluntario ? s.confirmada_voluntario : s.confirmada_fundacion
            return (
              <div
                key={s.id}
                className="rounded-2xl border border-ink-200/60 bg-white/70 p-4 dark:border-ink-700/60 dark:bg-ink-900/50"
              >
                <div className="flex items-center justify-between">
                  <Badge tone={s.estado === 'COMPLETADA' ? 'blue' : s.estado === 'ACEPTADA' ? 'green' : s.estado === 'PENDIENTE' ? 'amber' : 'gray'}>
                    {s.estado}
                  </Badge>
                  <span className="text-xs text-ink-400">{formatDate(s.fecha_creacion)}</span>
                </div>
                <p className="mt-1 font-display text-lg font-bold text-ink-900 dark:text-white">
                  {s.ofrecimiento_titulo}
                </p>
                <p className="text-xs text-ink-500">
                  {s.soy_voluntario ? `Organización: ${s.fundacion_nombre}` : `Voluntario: ${s.voluntario_nombre}`}
                  {s.ofrecimiento_tipo === 'OBJETO' && ` · cantidad: ${s.cantidad}`}
                </p>
                {s.mensaje && <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">“{s.mensaje}”</p>}

                <div className="mt-3 flex flex-wrap gap-2">
                  {s.soy_voluntario && s.estado === 'PENDIENTE' && (
                    <>
                      <Button size="sm" onClick={() => run(() => ofrecimientoService.responder(s.id, 'ACEPTAR'))}>
                        Aceptar
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-500" onClick={() => run(() => ofrecimientoService.responder(s.id, 'RECHAZAR'))}>
                        Rechazar
                      </Button>
                    </>
                  )}
                  {ACEPTADAS.includes(s.estado) && !yoConfirme && (
                    <Button size="sm" onClick={() => run(() => ofrecimientoService.confirmar(s.id))}>
                      Confirmar entrega
                    </Button>
                  )}
                  {ACEPTADAS.includes(s.estado) && yoConfirme && (
                    <span className="text-xs text-ink-500">Esperando la confirmación de la otra parte.</span>
                  )}
                  {ABIERTAS.includes(s.estado) && (
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => run(() => ofrecimientoService.cancelar(s.id))}>
                      Cancelar
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => abrirChat(s.id)}>
                    Mensajes
                  </Button>
                </div>

                {chat?.id === s.id && (
                  <div className="mt-3 rounded-xl bg-ink-50 p-3 dark:bg-ink-800/50">
                    <div className="max-h-56 space-y-2 overflow-y-auto">
                      {chat.msgs.length === 0 && <p className="text-xs text-ink-500">Sin mensajes todavía.</p>}
                      {chat.msgs.map((m) => (
                        <div key={m.id} className={m.es_mio ? 'text-right' : ''}>
                          <span
                            className={`inline-block rounded-xl px-3 py-1.5 text-sm ${
                              m.es_mio ? 'bg-solar-500 text-white' : 'bg-white text-ink-800 dark:bg-ink-900 dark:text-ink-100'
                            }`}
                          >
                            {m.mensaje}
                          </span>
                          <p className="text-[10px] text-ink-400">{m.autor_nombre} · {formatDate(m.fecha_creacion)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <input
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && enviar()}
                        maxLength={1000}
                        placeholder="Escribe un mensaje…"
                        className="flex-1 rounded-lg border border-ink-200 px-3 py-1.5 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-white"
                      />
                      <Button size="sm" onClick={enviar}>Enviar</Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
