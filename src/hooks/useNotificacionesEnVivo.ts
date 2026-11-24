import { useEffect, useState } from 'react'

import { api } from '@/lib/apiClient'
import { config } from '@/lib/config'
import { convocatoriaService } from '@/services/convocatoriaService'

const POLLING_MS = 30000
const MAX_FALLOS = 5
const BACKOFF_BASE_MS = 1000
const BACKOFF_MAX_MS = 30000

interface EventoNotificacion {
  no_leidas: number
}

async function pedirTicket(): Promise<string> {
  const { data } = await api.post<{ ticket: string }>('/notificaciones/stream-ticket')
  return data.ticket
}

/**
 * Conteo de notificaciones sin leer en tiempo real.
 *
 * Abre un EventSource a `/notificaciones/stream` con un ticket de vida corta
 * (EventSource no puede enviar la cabecera Authorization). Si la conexión se cae,
 * pide un ticket nuevo y reconecta con espera exponencial. Tras varios fallos
 * seguidos, o si el navegador no soporta EventSource, consulta cada 30 s.
 */
export function useNotificacionesEnVivo(): number {
  const [noLeidas, setNoLeidas] = useState(0)

  useEffect(() => {
    let activo = true
    let es: EventSource | null = null
    let reintento: number | undefined
    let polling: number | undefined
    let fallos = 0

    const consultar = () => {
      convocatoriaService
        .noLeidas()
        .then((n) => activo && setNoLeidas(n))
        .catch(() => {})
    }

    const iniciarPolling = () => {
      if (polling !== undefined) return
      polling = window.setInterval(consultar, POLLING_MS)
    }

    const fallo = () => {
      es?.close()
      es = null
      if (!activo) return
      fallos += 1
      if (fallos >= MAX_FALLOS) {
        iniciarPolling()
        return
      }
      const espera = Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * 2 ** fallos)
      reintento = window.setTimeout(() => void conectar(), espera)
    }

    const conectar = async () => {
      let ticket: string
      try {
        ticket = await pedirTicket()
      } catch {
        fallo()
        return
      }
      if (!activo) return
      const url = `${config.apiBaseUrl}/notificaciones/stream?ticket=${encodeURIComponent(ticket)}`
      const fuente = new EventSource(url)
      es = fuente
      fuente.onopen = () => {
        fallos = 0
      }
      fuente.addEventListener('notificacion', (ev) => {
        try {
          const data = JSON.parse((ev as MessageEvent<string>).data) as EventoNotificacion
          if (activo && typeof data.no_leidas === 'number') setNoLeidas(data.no_leidas)
        } catch {
          /* evento malformado: se ignora */
        }
      })
      // El ticket ya no sirve para reconectar (vence en 60 s): se cierra y se pide otro.
      fuente.onerror = () => {
        if (es === fuente) fallo()
      }
    }

    consultar()
    if (typeof EventSource === 'undefined') {
      iniciarPolling()
    } else {
      void conectar()
    }

    return () => {
      activo = false
      es?.close()
      es = null
      window.clearTimeout(reintento)
      window.clearInterval(polling)
    }
  }, [])

  return noLeidas
}
