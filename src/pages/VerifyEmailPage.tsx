import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { parseApiError } from '@/lib/apiClient'
import { authService } from '@/services/authService'

type Status = 'loading' | 'success' | 'error'

export function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>()
  const [status, setStatus] = useState<Status>(token ? 'loading' : 'error')
  const [message, setMessage] = useState(
    token ? '' : 'El enlace de verificación no es válido.',
  )
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current || !token) return
    ran.current = true

    authService
      .verifyEmail(token)
      .then((res) => {
        setStatus('success')
        setMessage(res.message ?? 'Tu correo fue verificado correctamente.')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(parseApiError(err).message)
      })
  }, [token])

  return (
    <AuthLayout title="Verificación de correo" subtitle="Confirmando tu dirección…">
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-ink-200 bg-white/70 p-8 text-center dark:border-ink-700 dark:bg-ink-900/60">
        {status === 'loading' && (
          <>
            <Loader2 className="size-12 animate-spin text-solar-500" />
            <p className="text-ink-500 dark:text-ink-400">Verificando tu correo…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="size-12 text-emerald-500" />
            <p className="text-ink-600 dark:text-ink-300">{message}</p>
            <Link to="/login" className="w-full">
              <Button size="lg" fullWidth>
                Iniciar sesión
              </Button>
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="size-12 text-red-500" />
            <p className="text-ink-600 dark:text-ink-300">{message}</p>
            <Link to="/login" className="w-full">
              <Button variant="outline" size="lg" fullWidth>
                Volver a iniciar sesión
              </Button>
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
