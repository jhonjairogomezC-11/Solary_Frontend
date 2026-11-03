import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

import { cn } from '@/lib/utils'

type Tone = 'error' | 'success' | 'info'

const toneStyles: Record<Tone, { wrap: string; icon: typeof Info }> = {
  error: {
    wrap: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
    icon: AlertCircle,
  },
  success: {
    wrap: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    icon: CheckCircle2,
  },
  info: {
    wrap: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
    icon: Info,
  },
}

export function Alert({ tone = 'info', children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  const { wrap, icon: Icon } = toneStyles[tone]
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm', wrap, className)}
    >
      <Icon className="mt-0.5 size-4.5 shrink-0" />
      <div className="leading-relaxed">{children}</div>
    </div>
  )
}
