import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { KeyRound, Lock, Mail } from 'lucide-react'

import { GoogleButton } from '@/components/auth/GoogleButton'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/auth/AuthContext'
import { parseApiError } from '@/lib/apiClient'
import { loginSchema, type LoginForm } from '@/lib/validators'
import { isGoogleEnabled } from '@/lib/config'
import { authService, esMfaRequerido } from '@/services/authService'
import type { TokenResponse } from '@/types/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setSession } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  // Segundo paso pendiente (también puede llegar desde el registro con Google).
  const [mfaToken, setMfaToken] = useState<string | null>(
    (location.state as { mfaToken?: string } | null)?.mfaToken ?? null,
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const completarSesion = (data: TokenResponse) => {
    setSession(data)
    navigate('/app', { replace: true })
  }

  const onSubmit = async (values: LoginForm) => {
    setServerError(null)
    try {
      const data = await authService.login(values)
      if (esMfaRequerido(data)) {
        setMfaToken(data.mfa_token)
        return
      }
      completarSesion(data)
    } catch (err) {
      setServerError(parseApiError(err).message)
    }
  }

  const handleGoogle = async (idToken: string) => {
    setServerError(null)
    setGoogleLoading(true)
    try {
      const data = await authService.loginWithGoogle(idToken)
      if (esMfaRequerido(data)) {
        setMfaToken(data.mfa_token)
        return
      }
      completarSesion(data)
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

  if (mfaToken) {
    return (
      <AuthLayout
        title="Verificación en dos pasos"
        subtitle="Ingresa el código de tu app autenticadora para continuar."
      >
        <MfaStep
          mfaToken={mfaToken}
          onSuccess={completarSesion}
          onCancel={(mensaje) => {
            setMfaToken(null)
            setServerError(mensaje ?? null)
          }}
        />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Bienvenido de vuelta" subtitle="Inicia sesión para continuar en Solari.">
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

/** Segundo paso del login: código TOTP de 6 dígitos o código de respaldo. */
function MfaStep({
  mfaToken,
  onSuccess,
  onCancel,
}: {
  mfaToken: string
  onSuccess: (data: TokenResponse) => void
  onCancel: (mensaje?: string) => void
}) {
  const [usarRespaldo, setUsarRespaldo] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const limpio = usarRespaldo ? codigo.trim() : codigo.replace(/\D/g, '')
  const valido = usarRespaldo ? limpio.replace(/[\s-]/g, '').length >= 10 : limpio.length === 6

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valido) return
    setError(null)
    setEnviando(true)
    try {
      onSuccess(await authService.loginMfa(mfaToken, limpio))
    } catch (err) {
      const mensaje = parseApiError(err).message
      if (mensaje.toLowerCase().includes('expiró')) {
        onCancel(mensaje)
        return
      }
      setError(mensaje)
      setCodigo('')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4" noValidate>
      {error && <Alert tone="error">{error}</Alert>}

      {usarRespaldo ? (
        <Input
          label="Código de respaldo"
          autoComplete="one-time-code"
          placeholder="XXXXX-XXXXX"
          icon={<KeyRound className="size-4.5" />}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          maxLength={20}
          autoFocus
          hint="Cada código de respaldo funciona una sola vez."
        />
      ) : (
        <Input
          label="Código de verificación"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          icon={<KeyRound className="size-4.5" />}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength={6}
          autoFocus
          className="tracking-[0.4em]"
          hint="Abre tu app autenticadora y escribe el código de 6 dígitos."
        />
      )}

      <Button type="submit" size="lg" fullWidth loading={enviando} disabled={!valido}>
        Verificar e ingresar
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => {
            setUsarRespaldo((v) => !v)
            setCodigo('')
            setError(null)
          }}
          className="font-medium text-solar-600 hover:text-solar-700 dark:text-solar-400"
        >
          {usarRespaldo ? 'Usar la app autenticadora' : 'Usar un código de respaldo'}
        </button>
        <button
          type="button"
          onClick={() => onCancel()}
          className="font-medium text-ink-500 hover:text-ink-700 dark:text-ink-400"
        >
          Volver
        </button>
      </div>
    </form>
  )
}
