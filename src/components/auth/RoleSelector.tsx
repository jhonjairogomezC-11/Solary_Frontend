import { motion } from 'framer-motion'
import { Building2, HeartHandshake } from 'lucide-react'

import { cn } from '@/lib/utils'

export type RolRegistro = 'VOLUNTARIO' | 'FUNDACION'

interface RoleSelectorProps {
  value: RolRegistro
  onChange: (role: RolRegistro) => void
}

const options = [
  {
    role: 'VOLUNTARIO' as const,
    icon: HeartHandshake,
    title: 'Soy voluntario',
    desc: 'Quiero donar mi tiempo y habilidades a causas sociales.',
  },
  {
    role: 'FUNDACION' as const,
    icon: Building2,
    title: 'Somos una fundación',
    desc: 'Buscamos voluntarios para nuestros proyectos.',
  },
]

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map(({ role, icon: Icon, title, desc }) => {
        const active = value === role
        return (
          <button
            key={role}
            type="button"
            onClick={() => onChange(role)}
            aria-pressed={active}
            className={cn(
              'relative flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition',
              active
                ? 'border-solar-400 bg-solar-50 shadow-glow dark:bg-solar-500/10'
                : 'border-ink-200 bg-white/70 hover:border-solar-300 dark:border-ink-700 dark:bg-ink-900/60',
            )}
          >
            {active && (
              <motion.span
                layoutId="role-ring"
                className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-solar-400"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span
              className={cn(
                'flex size-10 items-center justify-center rounded-xl',
                active
                  ? 'bg-gradient-to-br from-solar-400 to-solar-600 text-white'
                  : 'bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-300',
              )}
            >
              <Icon className="size-5" />
            </span>
            <span className="font-display font-bold text-ink-900 dark:text-white">{title}</span>
            <span className="text-xs leading-relaxed text-ink-500 dark:text-ink-400">{desc}</span>
          </button>
        )
      })}
    </div>
  )
}
