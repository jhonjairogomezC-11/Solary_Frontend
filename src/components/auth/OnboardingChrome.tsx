import { Check, LogOut, UserRound } from 'lucide-react'

import { useAuth } from '@/auth/AuthContext'
import { cn } from '@/lib/utils'

/** Banda que deja claro que la sesión está iniciada, con salida rápida. */
export function SessionBar() {
  const { usuario, logout } = useAuth()
  if (!usuario) return null
  return (
    <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-solar-200 bg-solar-50 px-3.5 py-2.5 dark:border-solar-500/30 dark:bg-solar-500/10">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-solar-500 text-white">
          <UserRound className="size-4" />
        </span>
        <div className="min-w-0 text-xs leading-tight">
          <p className="font-semibold text-ink-800 dark:text-ink-100">Sesión iniciada</p>
          <p className="truncate text-ink-500 dark:text-ink-400">{usuario.email}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => void logout()}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:bg-ink-50 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200"
      >
        <LogOut className="size-3.5" /> Cerrar sesión
      </button>
    </div>
  )
}

const PASOS = ['Cuenta creada', 'Confirmar correo', 'Completar perfil']

/** Indicador de progreso: `actual` es el índice (0-2) del paso en curso. */
export function PasosRegistro({ actual }: { actual: number }) {
  return (
    <ol className="mb-5 flex items-center gap-2">
      {PASOS.map((p, i) => {
        const hecho = i < actual
        const activo = i === actual
        return (
          <li key={p} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                hecho && 'bg-emerald-500 text-white',
                activo && 'bg-solar-500 text-white',
                !hecho && !activo && 'bg-ink-200 text-ink-500 dark:bg-ink-700 dark:text-ink-300',
              )}
            >
              {hecho ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                'text-xs font-medium',
                activo ? 'text-ink-900 dark:text-white' : 'text-ink-400',
              )}
            >
              {p}
            </span>
            {i < PASOS.length - 1 && <span className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />}
          </li>
        )
      })}
    </ol>
  )
}
