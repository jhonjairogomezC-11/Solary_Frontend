import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: number
}

export function Logo({ className, showText = true, size = 36 }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className="relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-solar-400 to-solar-600 shadow-glow"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 64 64" width={size * 0.62} height={size * 0.62} fill="none">
          <circle cx="32" cy="32" r="11" fill="#FFF7ED" />
          <g stroke="#FFF7ED" strokeWidth="3.4" strokeLinecap="round">
            <line x1="32" y1="8" x2="32" y2="15" />
            <line x1="32" y1="49" x2="32" y2="56" />
            <line x1="8" y1="32" x2="15" y2="32" />
            <line x1="49" y1="32" x2="56" y2="32" />
            <line x1="15" y1="15" x2="20" y2="20" />
            <line x1="44" y1="44" x2="49" y2="49" />
            <line x1="49" y1="15" x2="44" y2="20" />
            <line x1="20" y1="44" x2="15" y2="49" />
          </g>
        </svg>
      </span>
      {showText && (
        <span className="font-display text-xl font-extrabold tracking-tight text-ink-900 dark:text-white">
          Solari
        </span>
      )}
    </div>
  )
}
