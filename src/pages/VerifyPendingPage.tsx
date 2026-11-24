import { useState } from 'react'
import { MailCheck } from 'lucide-react'

import { PasosRegistro, SessionBar } from '@/components/auth/OnboardingChrome'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/auth/AuthContext'
import { parseApiError } from '@/lib/apiClient'
import { authService } from '@/services/authService'

/** Paso intermedio: la cuenta existe pero el correo aún no está confirmado. */
export function VerifyPendingPage() {
  const { usuario, refreshUsuario } = useAuth()
  const [enviando, setEnviando] = useState(false)
  const [comprobando, setComprobando] = useState(false)
  const [ok, setOk] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reenviar = async () => {
    setEnviando(true)
    setOk(null)
    setError(null)
    try {
      const res = await authService.resendVerification()
      setOk(res.message)
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setEnviando(false)
    }
  }

  const yaVerifique = async () => {
    setComprobando(true)
    setOk(null)
    setError(null)
    try {
      await refreshUsuario()
      // Si ya está verificado, el guardia de rutas nos lleva al siguiente paso.
      setError('Todavía no vemos tu correo confirmado. Abre el enlace del mensaje y vuelve aquí.')
    } finally {
      setComprobando(false)
    }
  }

  return (
    <AuthLayout
      title="Confirma tu correo"
      subtitle="Tu cuenta ya está creada y tu sesión iniciada. Falta confirmar tu correo para entrar a Solari."
    >
      <SessionBar />
      <PasosRegistro actual={1} />
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-ink-200 bg-white/70 p-8 text-center dark:border-ink-700 dark:bg-ink-900/60">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-solar-400 to-solar-600 text-white shadow-glow">
          <MailCheck className="size-7" />
        </span>
        <div>
          <p className="text-ink-700 dark:text-ink-200">Enviamos un enlace de confirmación a</p>
          <p className="mt-1 font-semibold text-ink-900 dark:text-white">{usuario?.email}</p>
          <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">
            Ábrelo para activar tu cuenta. Después completarás tu perfil y podrás entrar. Si no lo
            ves, revisa la carpeta de spam.
          </p>
        </div>

        {ok && <Alert tone="success">{ok}</Alert>}
        {error && <Alert tone="error">{error}</Alert>}

        <div className="flex w-full flex-col gap-2">
          <Button size="lg" fullWidth loading={comprobando} onClick={yaVerifique}>
            Ya confirmé mi correo
          </Button>
          <Button variant="outline" size="lg" fullWidth loading={enviando} onClick={reenviar}>
            Reenviar correo
          </Button>
        </div>
      </div>
    </AuthLayout>
  )
}
