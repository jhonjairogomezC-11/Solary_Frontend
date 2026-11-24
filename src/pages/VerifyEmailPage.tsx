import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { parseApiError } from '@/lib/apiClient'
import { tokenStore } from '@/lib/tokenStore'
import { useAuth } from '@/auth/AuthContext'
import { authService } from '@/services/authService'

type Status = 'loading' | 'success' | 'error'

export function VerifyEmailPage() {
  // El correo trae el token en la query (?token=...); también se acepta /verify-email/:token.
  const { token: tokenRuta } = useParams<{ token: string }>()
  const [params] = useSearchParams()
  const token = params.get('token') ?? tokenRuta
  const [status, setStatus] = useState<Status>(token ? 'loading' : 'error')
  const [message, setMessage] = useState(
    token ? '' : 'El enlace de verificación no es válido.',
  )
  const { refreshUsuario } = useAuth()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current || !token) return
    ran.current = true

    authService
      .verifyEmail(token)
      .then((res) => {
        setStatus('success')
        // Si la sesión sigue abierta en este navegador, actualiza el estado del correo.
        if (tokenStore.getAccess()) void refreshUsuario().catch(() => {})
        setMessage(res.message ?? 'Tu correo fue verificado correctamente.')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(parseApiError(err).message)
      })
  }, [token, refreshUsuario])

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
            <Link to="/app" className="w-full">
              <Button size="lg" fullWidth>
                Continuar
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
