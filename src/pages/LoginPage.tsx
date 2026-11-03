import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'

import { GoogleButton } from '@/components/auth/GoogleButton'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/auth/AuthContext'
import { parseApiError } from '@/lib/apiClient'
import { loginSchema, type LoginForm } from '@/lib/validators'
import { isGoogleEnabled } from '@/lib/config'
import { authService } from '@/services/authService'

export function LoginPage() {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginForm) => {
    setServerError(null)
    try {
      const data = await authService.login(values)
      setSession(data)
      navigate('/app', { replace: true })
    } catch (err) {
      setServerError(parseApiError(err).message)
    }
  }

  const handleGoogle = async (idToken: string) => {
    setServerError(null)
    setGoogleLoading(true)
    try {
      const data = await authService.loginWithGoogle(idToken)
      setSession(data)
      navigate('/app', { replace: true })
    } catch (err) {
      const parsed = parseApiError(err)
      const esCuentaNueva =
        parsed.message.toLowerCase().includes('rol') ||
        parsed.message.toLowerCase().includes('tipo de cuenta')

      if (esCuentaNueva) {
        // La cuenta de Google aún no existe: hay que elegir el tipo de cuenta.
        // Llevamos al usuario a registro, donde sí puede seleccionar el rol.
        navigate('/registro', {
          replace: true,
          state: {
            info: 'Parece que es tu primera vez con Google. Elige tu tipo de cuenta para continuar.',
          },
        })
        return
      }
      setServerError(parsed.message)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <AuthLayout title="Bienvenido de vuelta" subtitle="Inicia sesión para continuar en Solary.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && <Alert tone="error">{serverError}</Alert>}

        <Input
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          icon={<Mail className="size-4.5" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div>
          <Input
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            icon={<Lock className="size-4.5" />}
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="mt-2 text-right">
            <Link
              to="/recuperar"
              className="text-sm font-medium text-solar-600 hover:text-solar-700 dark:text-solar-400"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          Iniciar sesión
        </Button>
      </form>

      {isGoogleEnabled && (
        <>
          <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-ink-400">
            <span className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
            o continúa con
            <span className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
          </div>
          <div className={googleLoading ? 'pointer-events-none opacity-60' : ''}>
            <GoogleButton onCredential={handleGoogle} text="signin_with" />
          </div>
        </>
      )}

      <p className="mt-8 text-center text-sm text-ink-500 dark:text-ink-400">
        ¿Aún no tienes cuenta?{' '}
        <Link to="/registro" className="font-semibold text-solar-600 hover:text-solar-700 dark:text-solar-400">
          Regístrate gratis
        </Link>
      </p>
    </AuthLayout>
  )
}
