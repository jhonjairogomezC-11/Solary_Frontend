import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { FoundationForm } from '@/components/auth/FoundationForm'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { RoleSelector, type RolRegistro } from '@/components/auth/RoleSelector'
import { VolunteerForm } from '@/components/auth/VolunteerForm'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Alert } from '@/components/ui/Alert'
import { useAuth } from '@/auth/AuthContext'
import { isGoogleEnabled } from '@/lib/config'
import { parseApiError } from '@/lib/apiClient'
import { authService } from '@/services/authService'
import type { TokenResponse } from '@/types/auth'

export function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setSession } = useAuth()
  const infoMessage = (location.state as { info?: string } | null)?.info ?? null
  const [role, setRole] = useState<RolRegistro>('VOLUNTARIO')
  const [serverError, setServerError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSuccess = (data: TokenResponse) => {
    setSession(data)
    navigate('/app', { replace: true })
  }

  const handleRoleChange = (r: RolRegistro) => {
    setServerError(null)
    setRole(r)
  }

  const handleGoogle = async (idToken: string) => {
    setServerError(null)
    setGoogleLoading(true)
    try {
      // Enviamos el rol elegido: así el backend crea la cuenta nueva con el tipo
      // correcto. Si la cuenta ya existe, el backend ignora el rol y hace login.
      const data = await authService.loginWithGoogle(idToken, role)
      handleSuccess(data)
    } catch (err) {
      const parsed = parseApiError(err)
      // Caso: ya existe una cuenta LOCAL con ese correo.
      setServerError(
        parsed.message.includes('local') || parsed.message.includes('contraseña')
          ? 'Ya tienes una cuenta con ese correo. Inicia sesión con tu contraseña.'
          : parsed.message,
      )
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Únete a Solary y empieza a generar impacto hoy."
    >
      <div className="space-y-6">
        {infoMessage && <Alert tone="info">{infoMessage}</Alert>}

        <RoleSelector value={role} onChange={handleRoleChange} />

        {isGoogleEnabled && (
          <div className="space-y-4">
            <div className={googleLoading ? 'pointer-events-none opacity-60' : ''}>
              <GoogleButton onCredential={handleGoogle} text="signup_with" />
            </div>
            <p className="text-center text-xs text-ink-400">
              Al continuar con Google crearás una cuenta de{' '}
              <span className="font-semibold text-solar-600 dark:text-solar-400">
                {role === 'VOLUNTARIO' ? 'voluntario' : 'fundación'}
              </span>
              .
            </p>
            <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-ink-400">
              <span className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
              o con tu correo
              <span className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {role === 'VOLUNTARIO' ? (
              <VolunteerForm
                onSuccess={handleSuccess}
                serverError={serverError}
                setServerError={setServerError}
              />
            ) : (
              <FoundationForm
                onSuccess={handleSuccess}
                serverError={serverError}
                setServerError={setServerError}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-sm text-ink-500 dark:text-ink-400">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-solar-600 hover:text-solar-700 dark:text-solar-400">
            Inicia sesión
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
