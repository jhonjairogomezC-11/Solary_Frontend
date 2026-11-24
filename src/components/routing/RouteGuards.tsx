import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/auth/AuthContext'
import { convocatoriaService } from '@/services/convocatoriaService'
import { Logo } from '@/components/ui/Logo'

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-solar-50 dark:bg-ink-950">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse">
          <Logo size={44} />
        </div>
        <span className="size-6 animate-spin rounded-full border-2 border-solar-400 border-t-transparent" />
      </div>
    </div>
  )
}

const RUTA_VERIFICAR = '/verifica-tu-correo'
const RUTA_ONBOARDING = '/completar-perfil'

/**
 * Solo usuarios autenticados. Además encadena los pasos previos a entrar a Solari:
 * 1) confirmar el correo, 2) (voluntarios) completar teléfono y dirección del perfil.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading, usuario } = useAuth()
  const location = useLocation()
  // null = sin comprobar todavía; true/false = perfil de voluntario completo o no.
  const [perfilCompleto, setPerfilCompleto] = useState<boolean | null>(null)

  const esAdmin = usuario?.rol === 'ADMIN'
  const esVoluntario = usuario?.rol === 'VOLUNTARIO'
  const verificado = Boolean(usuario?.email_verificado)

  useEffect(() => {
    if (!isAuthenticated || !esVoluntario || !verificado) return
    let active = true
    convocatoriaService.miPerfilVoluntario().then((p) => {
      if (!active) return
      // Sin perfil (p. ej. registro con Google): lo gestiona la pantalla /app/perfil.
      setPerfilCompleto(
        p === null
          ? true
          : Boolean(
              p.telefono_contacto?.trim() &&
                p.direccion?.trim() &&
                p.contacto_emergencia_nombre?.trim() &&
                p.contacto_emergencia_telefono?.trim(),
            ),
      )
    })
    return () => {
      active = false
    }
  }, [isAuthenticated, esVoluntario, verificado, usuario?.id])

  if (isLoading) return <FullScreenLoader />
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!esAdmin) {
    const ruta = location.pathname
    if (!verificado) {
      if (ruta !== RUTA_VERIFICAR) return <Navigate to={RUTA_VERIFICAR} replace />
      return <Outlet />
    }
    if (ruta === RUTA_VERIFICAR) return <Navigate to="/app" replace />

    if (esVoluntario) {
      if (perfilCompleto === null) return <FullScreenLoader />
      if (!perfilCompleto && ruta !== RUTA_ONBOARDING) {
        return <Navigate to={RUTA_ONBOARDING} replace />
      }
      if (perfilCompleto && ruta === RUTA_ONBOARDING) return <Navigate to="/app" replace />
    } else if (ruta === RUTA_ONBOARDING) {
      return <Navigate to="/app" replace />
    }
  }

  return <Outlet context={{ marcarPerfilCompleto: () => setPerfilCompleto(true) }} />
}

/** Solo usuarios NO autenticados (login, registro, etc.). */
export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading, usuario } = useAuth()

  if (isLoading) return <FullScreenLoader />
  if (isAuthenticated) {
    return <Navigate to={usuario?.rol === 'ADMIN' ? '/admin' : '/app'} replace />
  }
  return <Outlet />
}

/** Solo administradores. */
export function AdminRoute() {
  const { isAuthenticated, isLoading, usuario } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullScreenLoader />
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (usuario?.rol !== 'ADMIN') {
    return <Navigate to="/app" replace />
  }
  return <Outlet />
}
