import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, MailCheck } from 'lucide-react'

import { AuthLayout } from '@/components/layout/AuthLayout'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { forgotSchema, type ForgotForm } from '@/lib/validators'
import { parseApiError } from '@/lib/apiClient'
import { authService } from '@/services/authService'

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) })

  const onSubmit = async (values: ForgotForm) => {
    setServerError(null)
    try {
      await authService.forgotPassword(values.email)
      setSent(true)
    } catch (err) {
      setServerError(parseApiError(err).message)
    }
  }

  if (sent) {
    return (
      <AuthLayout title="Revisa tu correo" subtitle="Te enviamos las instrucciones.">
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-ink-200 bg-white/70 p-8 text-center dark:border-ink-700 dark:bg-ink-900/60">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-solar-400 to-solar-600 text-white shadow-glow">
              <MailCheck className="size-7" />
            </span>
            <p className="text-ink-600 dark:text-ink-300">
              Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu
              contraseña. El enlace caduca en 1 hora.
            </p>
          </div>
          <Link to="/login">
            <Button variant="outline" size="lg" fullWidth>
              <ArrowLeft className="size-4" /> Volver a iniciar sesión
            </Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Recupera tu contraseña"
      subtitle="Ingresa tu correo y te enviaremos un enlace para restablecerla."
    >
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
        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          Enviar enlace
        </Button>
      </form>

      <Link
        to="/login"
        className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-ink-500 hover:text-solar-600 dark:text-ink-400"
      >
        <ArrowLeft className="size-4" /> Volver a iniciar sesión
      </Link>
    </AuthLayout>
  )
}
