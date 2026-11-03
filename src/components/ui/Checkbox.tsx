import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
  error?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = useId()
    const checkId = id ?? generatedId
    return (
      <div className="w-full">
        <label htmlFor={checkId} className="flex cursor-pointer items-start gap-3">
          <span className="relative mt-0.5 inline-flex">
            <input
              ref={ref}
              id={checkId}
              type="checkbox"
              className={cn('peer size-5 cursor-pointer appearance-none rounded-md border transition', error ? 'border-red-400' : 'border-ink-300 dark:border-ink-600', 'checked:border-solar-500 checked:bg-solar-500 focus:outline-none focus:ring-2 focus:ring-solar-400/60', className)}
              {...props}
            />
            <Check className="pointer-events-none absolute left-0.5 top-0.5 size-4 text-white opacity-0 peer-checked:opacity-100" />
          </span>
          <span className="text-sm leading-relaxed text-ink-600 dark:text-ink-300">{label}</span>
        </label>
        {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
      </div>
    )
  },
)
Checkbox.displayName = 'Checkbox'
