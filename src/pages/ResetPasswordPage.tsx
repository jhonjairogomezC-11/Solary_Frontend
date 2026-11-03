import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Lock } from 'lucide-react'

import { AuthLayout } from '@/components/layout/AuthLayout'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { resetSchema, type ResetForm } from '@/lib/validators'
import { parseApiError } from '@/lib/apiClient'
import { authService } from '@/services/authService'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''
  const [serverError, setServerError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({ resolver: zodResolver(resetSchema) })

  const onSubmit = async (values: ResetForm) => {
    setServerError(null)
    try {
      await authService.resetPassword({
        token,
        password: values.password,
        password_confirmation: values.password_confirmation,
      })
      setDone(true)
      setTimeout(() => navigate('/login', { replace: true }), 2500)
    } catch (err) {
      setServerError(parseApiError(err).message)
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Enlace no válido" subtitle="Falta el token de restablecimiento.">
        <Alert tone="error">
          Este enlace no es válido o está incompleto. Solicita uno nuevo desde la página de
          recuperación.
        </Alert>
        <Link to="/recuperar" className="mt-6 block">
          <Button variant="outline" size="lg" fullWidth>
            Solicitar nuevo enlace
          </Button>
        </Link>
      </AuthLayout>
    )
  }

  if (done) {
    return (
      <AuthLayout title="¡Contraseña actualizada!" subtitle="Ya puedes iniciar sesión.">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <CheckCircle2 className="size-12 text-emerald-500" />
          <p className="text-ink-600 dark:text-ink-300">
            Tu contraseña se cambió correctamente. Te llevamos al inicio de sesión…
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Nueva contraseña" subtitle="Elige una contraseña segura para tu cuenta.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && <Alert tone="error">{serverError}</Alert>}
        <Input
          label="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          icon={<Lock className="size-4.5" />}
          hint="Mín. 8, con mayúscula, minúscula y número."
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          icon={<Lock className="size-4.5" />}
          error={errors.password_confirmation?.message}
          {...register('password_confirmation')}
        />
        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          Cambiar contraseña
        </Button>
      </form>
    </AuthLayout>
  )
}
