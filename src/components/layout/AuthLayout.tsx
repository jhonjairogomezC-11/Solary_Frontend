import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

import { AuroraBackground } from '@/components/ui/AuroraBackground'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

const highlights = [
  { icon: HeartHandshake, text: 'Conecta con fundaciones que necesitan tu ayuda' },
  { icon: ShieldCheck, text: 'Tus datos protegidos con seguridad de nivel profesional' },
  { icon: Sparkles, text: 'Suma impacto real a causas que transforman vidas' },
]

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen w-full bg-solar-50 dark:bg-ink-950">
      {/* Panel izquierdo — branding (solo desktop) */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-solar-500 via-solar-600 to-orange-700 p-12 text-white lg:flex">
        <AuroraBackground className="opacity-60 mix-blend-overlay" />
        <Link to="/" className="relative z-10">
          <Logo className="[&_span]:text-white" />
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 max-w-md"
        >
          <h2 className="font-display text-4xl font-extrabold leading-tight">
            Tu energía puede cambiar el mundo.
          </h2>
          <p className="mt-4 text-lg text-white/85">
            Solary une a voluntarios y fundaciones para crear impacto donde más se necesita.
          </p>

          <ul className="mt-10 space-y-4">
            {highlights.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <Icon className="size-5" />
                </span>
                <span className="text-white/90">{text}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <p className="relative z-10 text-sm text-white/60">
          © {new Date().getFullYear()} Solary. Voluntariado con propósito.
        </p>
      </aside>

      {/* Panel derecho — formulario */}
      <main className="relative flex w-full flex-col items-center justify-center px-5 py-10 lg:w-1/2">
        <AuroraBackground className="opacity-40 lg:hidden" />
        <div className="absolute right-5 top-5 z-10">
          <ThemeToggle />
        </div>

        <div className="relative z-10 flex w-full max-w-md flex-col">
          <div className="mb-8 lg:hidden">
            <Link to="/">
              <Logo />
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
              {title}
            </h1>
            {subtitle && <p className="mt-2 text-ink-500 dark:text-ink-400">{subtitle}</p>}

            <div className="mt-8">{children}</div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
