import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  tone?: 'solar' | 'sky' | 'emerald' | 'violet' | 'red' | 'amber'
  hint?: string
}

const tones: Record<string, string> = {
  solar: 'from-solar-400 to-solar-600',
  sky: 'from-sky-400 to-sky-600',
  emerald: 'from-emerald-400 to-emerald-600',
  violet: 'from-violet-400 to-violet-600',
  red: 'from-red-400 to-red-600',
  amber: 'from-amber-400 to-amber-600',
}

export function StatCard({ label, value, icon: Icon, tone = 'solar', hint }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-ink-200/60 bg-white p-5 shadow-sm dark:border-ink-800 dark:bg-ink-900">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm text-ink-500 dark:text-ink-400">{label}</p>
          <p className="mt-1 text-3xl font-bold text-ink-900 dark:text-white">{value}</p>
          {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
        </div>
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white',
            tones[tone],
          )}
        >
          <Icon className="size-5.5" />
        </span>
      </div>
    </div>
  )
}
