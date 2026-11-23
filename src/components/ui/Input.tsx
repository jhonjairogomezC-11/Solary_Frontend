import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, hint, type = 'text', id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const [show, setShow] = useState(false)
    const isPassword = type === 'password'
    const actualType = isPassword ? (show ? 'text' : 'password') : type

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={actualType}
            aria-invalid={Boolean(error)}
            className={cn(
              'h-11 w-full rounded-xl border bg-white/80 px-3.5 text-sm text-ink-900 shadow-sm backdrop-blur transition',
              'placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-solar-400/70 focus:border-solar-400',
              'dark:bg-ink-900/60 dark:text-white dark:placeholder:text-ink-500',
              'disabled:cursor-not-allowed disabled:border-ink-200 disabled:bg-ink-100 disabled:text-ink-500 disabled:shadow-none',
              'dark:disabled:border-ink-700 dark:disabled:bg-ink-800 dark:disabled:text-ink-400',
              icon && 'pl-10',
              isPassword && 'pr-11',
              error
                ? 'border-red-400 focus:ring-red-300'
                : 'border-ink-200 dark:border-ink-700',
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition hover:text-ink-600 dark:hover:text-ink-200"
              aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              tabIndex={-1}
            >
              {show ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
            </button>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-ink-400">{hint}</p>
        ) : null}
      </div>
    )
  },
)
Input.displayName = 'Input'
