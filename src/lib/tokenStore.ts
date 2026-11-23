/**
 * Almacenamiento de la sesión en el cliente.
 *
 * Nota de seguridad: para una SPA pura usamos localStorage por simplicidad de
 * integración con la API móvil-compatible. El riesgo principal es XSS; se mitiga
 * con React (escapado por defecto), CSP recomendada en despliegue y tokens de
 * acceso de vida corta con rotación de refresh. Si más adelante se introduce un
 * backend-for-frontend, conviene migrar a cookies httpOnly.
 */
const ACCESS_KEY = 'solari.access'
const REFRESH_KEY = 'solari.refresh'

export const tokenStore = {
  getAccess(): string | null {
    return localStorage.getItem(ACCESS_KEY)
  },
  getRefresh(): string | null {
    return localStorage.getItem(REFRESH_KEY)
  },
  set(access: string, refresh: string): void {
    localStorage.setItem(ACCESS_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear(): void {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
  has(): boolean {
    return Boolean(localStorage.getItem(ACCESS_KEY))
  },
}
