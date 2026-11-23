import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'

import type { ApiError, TokenResponse } from '@/types/auth'
import { config } from './config'
import { tokenStore } from './tokenStore'

export const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: { Accept: 'application/json' },
  timeout: 20000,
})

/** Adjunta el Bearer token a cada petición saliente. */
api.interceptors.request.use((request: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccess()
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`)
  }
  return request
})

/* --- Refresh automático en 401, con cola para evitar renovaciones paralelas --- */

type RetriableConfig = AxiosRequestConfig & { _retry?: boolean }

let isRefreshing = false
let pendingQueue: Array<(token: string | null) => void> = []

function flushQueue(token: string | null) {
  pendingQueue.forEach((resolve) => resolve(token))
  pendingQueue = []
}

/** Rutas donde un 401 NO debe disparar refresh (son fallos de credenciales). */
const NO_REFRESH_PATHS = ['/auth/login', '/auth/refresh', '/auth/google']

/** Callback para que la capa de sesión sepa que la sesión murió. */
let onSessionExpired: (() => void) | null = null
export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const original = error.config as RetriableConfig | undefined
    const status = error.response?.status
    const url = original?.url ?? ''

    const isAuthEndpoint = NO_REFRESH_PATHS.some((p) => url.includes(p))

    if (status !== 401 || !original || original._retry || isAuthEndpoint) {
      return Promise.reject(error)
    }

    const refresh = tokenStore.getRefresh()
    if (!refresh) {
      tokenStore.clear()
      onSessionExpired?.()
      return Promise.reject(error)
    }

    original._retry = true

    if (isRefreshing) {
      // Espera a que termine el refresh en curso y reintenta.
      return new Promise((resolve, reject) => {
        pendingQueue.push((token) => {
          if (!token) {
            reject(error)
            return
          }
          original.headers = { ...original.headers, Authorization: `Bearer ${token}` }
          resolve(api(original))
        })
      })
    }

    isRefreshing = true
    try {
      const { data } = await axios.post<TokenResponse>(
        `${config.apiBaseUrl}/auth/refresh`,
        { refresh_token: refresh },
        { headers: { Accept: 'application/json' } },
      )
      tokenStore.set(data.token, data.refresh_token)
      flushQueue(data.token)
      original.headers = { ...original.headers, Authorization: `Bearer ${data.token}` }
      return api(original)
    } catch (refreshError) {
      flushQueue(null)
      tokenStore.clear()
      onSessionExpired?.()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

/** Normaliza errores de la API a un shape consistente para la UI. */
export function parseApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined
    if (data?.message) return data
    if (error.code === 'ERR_NETWORK') {
      return { message: 'No se pudo conectar con el servidor. Verifica que Solari esté en línea.' }
    }
  }
  return { message: 'Ocurrió un error inesperado. Inténtalo de nuevo.' }
}
