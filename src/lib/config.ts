/** Configuración de entorno del cliente, centralizada y tipada. */
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8001/api/v1',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
} as const

export const isGoogleEnabled = Boolean(config.googleClientId)
