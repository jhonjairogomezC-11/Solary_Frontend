import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { setSessionExpiredHandler } from '@/lib/apiClient'
import { tokenStore } from '@/lib/tokenStore'
import { authService } from '@/services/authService'
import type { TokenResponse, Usuario } from '@/types/auth'

interface AuthContextValue {
  usuario: Usuario | null
  isAuthenticated: boolean
  isLoading: boolean
  setSession: (data: TokenResponse) => void
  refreshUsuario: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const clearSession = useCallback(() => {
    tokenStore.clear()
    setUsuario(null)
  }, [])

  const setSession = useCallback((data: TokenResponse) => {
    tokenStore.set(data.token, data.refresh_token)
    setUsuario(data.usuario)
  }, [])

  const refreshUsuario = useCallback(async () => {
    const me = await authService.me()
    setUsuario(me)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Aunque falle en el servidor, limpiamos la sesión local.
    } finally {
      clearSession()
    }
  }, [clearSession])

  // Cuando el refresh falla definitivamente, la sesión expira.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUsuario(null)
    })
  }, [])

  // Rehidratación al cargar la app: si hay token, recupera el usuario.
  useEffect(() => {
    let cancelled = false
    async function bootstrap() {
      if (!tokenStore.has()) {
        setIsLoading(false)
        return
      }
      try {
        const me = await authService.me()
        if (!cancelled) setUsuario(me)
      } catch {
        if (!cancelled) clearSession()
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      isAuthenticated: Boolean(usuario),
      isLoading,
      setSession,
      refreshUsuario,
      logout,
    }),
    [usuario, isLoading, setSession, refreshUsuario, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
