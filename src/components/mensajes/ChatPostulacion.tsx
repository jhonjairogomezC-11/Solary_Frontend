import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Loader2, Lock, MessageCircle, Send, X } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { parseApiError } from '@/lib/apiClient'
import { cn } from '@/lib/utils'
import {
  MAX_MENSAJE,
  mensajeService,
  type ConversacionPostulacion,
} from '@/services/mensajeService'

const REFRESCO_MS = 10000

function hora(fecha: string) {
  return new Date(fecha).toLocaleString('es-CO', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface Props {
  postulacionId: string
  onClose: () => void
  className?: string
}

/** Chat entre el voluntario y la organización dentro de una postulación. */
export function ChatPostulacion({ postulacionId, onClose, className }: Props) {
  const [conv, setConv] = useState<ConversacionPostulacion | null>(null)
  const [cargando, setCargando] = useState(true)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listaRef = useRef<HTMLDivElement>(null)
  const totalRef = useRef(0)

  const cargar = useCallback(async () => {
    try {
      const data = await mensajeService.conversacion(postulacionId)
      setConv(data)
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setCargando(false)
    }
  }, [postulacionId])

  // Carga inicial y refresco cada 10 s mientras el panel está abierto.
  useEffect(() => {
    let activo = true
    const tick = () => {
      if (!activo || document.hidden) return
      mensajeService
        .conversacion(postulacionId)
        .then((data) => activo && setConv(data))
        .catch((err) => activo && setError(parseApiError(err).message))
        .finally(() => activo && setCargando(false))
    }
    tick()
    const id = window.setInterval(tick, REFRESCO_MS)
    return () => {
      activo = false
      window.clearInterval(id)
    }
  }, [postulacionId])

  // Baja al último mensaje cuando llegan mensajes nuevos.
  useEffect(() => {
    const total = conv?.mensajes.length ?? 0
    if (total !== totalRef.current && listaRef.current) {
      listaRef.current.scrollTop = listaRef.current.scrollHeight
    }
    totalRef.current = total
  }, [conv])

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    const mensaje = texto.trim()
    if (!mensaje || enviando) return
    setEnviando(true)
    setError(null)
    try {
      setConv(await mensajeService.enviar(postulacionId, mensaje))
      setTexto('')
    } catch (err) {
      setError(parseApiError(err).message)
      // El estado pudo cambiar (por ejemplo, la postulación pasó a solo lectura).
      void cargar()
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div
      className={cn(
        'mt-3 flex flex-col rounded-2xl border border-ink-200/60 bg-white dark:border-ink-700/60 dark:bg-ink-900',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-ink-200/60 px-4 py-2.5 dark:border-ink-700/60">
        <div className="flex min-w-0 items-center gap-2">
          <MessageCircle className="size-4 shrink-0 text-solar-500" />
          <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">
            {conv ? `Mensajes con ${conv.contraparte_nombre}` : 'Mensajes'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
          aria-label="Cerrar mensajes"
        >
          <X className="size-4" />
        </button>
      </div>

      <div ref={listaRef} className="max-h-80 min-h-32 space-y-2 overflow-y-auto px-4 py-3" aria-live="polite">
        {cargando ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-5 animate-spin text-solar-500" />
          </div>
        ) : !conv || conv.mensajes.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-500 dark:text-ink-400">
            Aún no hay mensajes. Escribe para coordinar los detalles de la actividad.
          </p>
        ) : (
          conv.mensajes.map((m) => (
            <div key={m.id} className={cn('flex', m.es_mio ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                  m.es_mio
                    ? 'bg-solar-500 text-white'
                    : 'bg-ink-100 text-ink-800 dark:bg-ink-800 dark:text-ink-100',
                )}
              >
                {!m.es_mio && <p className="text-xs font-semibold opacity-80">{m.autor_nombre}</p>}
                <p className="whitespace-pre-wrap break-words">{m.mensaje}</p>
                <p className={cn('mt-0.5 text-[10px]', m.es_mio ? 'text-white/80' : 'text-ink-400')}>
                  {hora(m.fecha_creacion)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {error && (
        <Alert tone="error" className="mx-4 mb-2">
          {error}
        </Alert>
      )}

      {conv && !conv.puede_escribir ? (
        <p className="flex items-center gap-1.5 border-t border-ink-200/60 px-4 py-3 text-xs text-ink-500 dark:border-ink-700/60 dark:text-ink-400">
          <Lock className="size-3.5" /> Esta conversación es de solo lectura por el estado de la
          postulación.
        </p>
      ) : (
        <form
          onSubmit={enviar}
          className="flex items-end gap-2 border-t border-ink-200/60 px-4 py-3 dark:border-ink-700/60"
        >
          <div className="flex-1">
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  e.currentTarget.form?.requestSubmit()
                }
              }}
              maxLength={MAX_MENSAJE}
              rows={2}
              disabled={cargando}
              placeholder="Escribe un mensaje. No compartas correos, teléfonos ni enlaces."
              aria-label="Mensaje"
              className="w-full resize-none rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-solar-400 focus:ring-2 focus:ring-solar-400/30 dark:border-ink-700 dark:bg-ink-950 dark:text-white"
            />
            <p className="text-right text-[10px] text-ink-400">
              {texto.length}/{MAX_MENSAJE}
            </p>
          </div>
          <Button type="submit" size="sm" loading={enviando} disabled={!texto.trim()} aria-label="Enviar">
            <Send className="size-4" />
            Enviar
          </Button>
        </form>
      )}
    </div>
  )
}
