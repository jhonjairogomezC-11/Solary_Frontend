import { Moon, Sun } from 'lucide-react'

import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
      className={cn(
        'inline-flex size-10 items-center justify-center rounded-xl border border-ink-200 bg-white/70 text-ink-600 backdrop-blur transition hover:bg-white hover:text-solar-600',
        'dark:border-ink-700 dark:bg-ink-900/60 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-solar-400',
        className,
      )}
    >
      {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  )
}
