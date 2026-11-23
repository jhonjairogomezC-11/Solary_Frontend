import { forwardRef, useId, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

interface Option {
  value: string | number
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Option[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const generatedId = useId()
    const selectId = id ?? generatedId
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={Boolean(error)}
            className={cn(
              'h-11 w-full appearance-none rounded-xl border bg-white/80 px-3.5 pr-10 text-sm text-ink-900 shadow-sm backdrop-blur transition',
              'focus:outline-none focus:ring-2 focus:ring-solar-400/70 focus:border-solar-400',
              'dark:bg-ink-900/60 dark:text-white',
              'disabled:cursor-not-allowed disabled:border-ink-200 disabled:bg-ink-100 disabled:text-ink-500 disabled:shadow-none',
              'dark:disabled:border-ink-700 dark:disabled:bg-ink-800 dark:disabled:text-ink-400',
              error ? 'border-red-400 focus:ring-red-300' : 'border-ink-200 dark:border-ink-700',
              className,
            )}
            defaultValue=""
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
        </div>
        {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
      </div>
    )
  },
)
Select.displayName = 'Select'
