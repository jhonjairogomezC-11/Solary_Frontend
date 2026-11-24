import type { AxiosRequestConfig } from 'axios'

import { api } from '@/lib/apiClient'
import { tokenStore } from '@/lib/tokenStore'

export interface Sesion {
  id: string
  dispositivo: string
  ip: string | null
  fecha_inicio: string | null
  fecha_ultimo_uso: string | null
  expiracion: string
  actual: boolean
}

export interface MfaEstado {
  activo: boolean
  codigos_respaldo_restantes: number
  recomendado: boolean
}

export interface MfaInicio {
  otpauth_uri: string
  /** Data URI SVG del código QR. */
  qr_svg: string
  /** Clave para ingreso manual en la app autenticadora. */
  secreto: string
}

/**
 * Adjunta el refresh token actual en `X-Refresh-Token` para que el backend marque
 * "Esta sesión". Se usa transformRequest (y no un header fijo) para que, si el
 * cliente rota el refresh token y reintenta tras un 401, viaje el valor vigente.
 * Solo se envía a estos endpoints de /cuenta/sesiones.
 */
const conRefreshActual: AxiosRequestConfig = {
  transformRequest: [
    (data, headers) => {
      const refresh = tokenStore.getRefresh()
      if (refresh) headers.set('X-Refresh-Token', refresh)
      return data
    },
  ],
}

export const seguridadService = {
  async sesiones(): Promise<Sesion[]> {
    const { data } = await api.get<Sesion[]>('/cuenta/sesiones', conRefreshActual)
    return data
  },

  async cerrarSesion(id: string): Promise<void> {
    await api.delete(`/cuenta/sesiones/${encodeURIComponent(id)}`)
  },

  async cerrarOtras(): Promise<{ message: string; revocadas: number }> {
    const { data } = await api.post<{ message: string; revocadas: number }>(
      '/cuenta/sesiones/cerrar-otras',
      undefined,
      conRefreshActual,
    )
    return data
  },

  async mfaEstado(): Promise<MfaEstado> {
    const { data } = await api.get<MfaEstado>('/cuenta/mfa')
    return data
  },

  async mfaIniciar(): Promise<MfaInicio> {
    const { data } = await api.post<MfaInicio>('/cuenta/mfa/iniciar')
    return data
  },

  async mfaConfirmar(codigo: string): Promise<{ message: string; codigos_respaldo: string[] }> {
    const { data } = await api.post<{ message: string; codigos_respaldo: string[] }>(
      '/cuenta/mfa/confirmar',
      { codigo },
    )
    return data
  },

  async mfaDesactivar(payload: { password?: string; codigo: string }): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>('/cuenta/mfa/desactivar', payload)
    return data
  },
}
