import { cn } from '@/lib/utils'

/** Fondo decorativo con manchas de color difuminadas y animadas. */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <div className="absolute -left-24 -top-24 size-96 rounded-full bg-solar-400/40 blur-3xl animate-float-slow" />
      <div
        className="absolute right-0 top-1/3 size-80 rounded-full bg-amber-300/40 blur-3xl animate-float-slow"
        style={{ animationDelay: '-4s' }}
      />
      <div
        className="absolute -bottom-32 left-1/3 size-[28rem] rounded-full bg-orange-400/30 blur-3xl animate-float-slow"
        style={{ animationDelay: '-8s' }}
      />
    </div>
  )
}
