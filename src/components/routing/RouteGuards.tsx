import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/auth/AuthContext'
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

/** Solo usuarios autenticados. */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullScreenLoader />
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}

/** Solo usuarios NO autenticados (login, registro, etc.). */
export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <FullScreenLoader />
  if (isAuthenticated) return <Navigate to="/app" replace />
  return <Outlet />
}
