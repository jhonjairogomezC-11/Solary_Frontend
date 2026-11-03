import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Building2, HandHeart, HeartHandshake, ShieldCheck, Sparkles, Users } from 'lucide-react'

import { AuroraBackground } from '@/components/ui/AuroraBackground'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/auth/AuthContext'

const features = [
  {
    icon: HeartHandshake,
    title: 'Conexiones con propósito',
    desc: 'Voluntarios y fundaciones se encuentran según intereses, habilidades y disponibilidad.',
  },
  {
    icon: ShieldCheck,
    title: 'Seguridad primero',
    desc: 'Autenticación robusta, datos cifrados y protección contra abuso desde el diseño.',
  },
  {
    icon: Sparkles,
    title: 'Impacto medible',
    desc: 'Cada acción cuenta. Haz seguimiento al cambio que generas en tu comunidad.',
  },
]

const stats = [
  { value: '+100', label: 'Causas activas', icon: HandHeart },
  { value: '+500', label: 'Voluntarios', icon: Users },
  { value: '+80', label: 'Fundaciones', icon: Building2 },
]

export function LandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="relative min-h-screen overflow-hidden bg-solar-50 dark:bg-ink-950">
      <AuroraBackground className="opacity-70" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <Link to="/app">
              <Button size="sm">Ir a mi panel</Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  Iniciar sesión
                </Button>
              </Link>
              <Link to="/registro">
                <Button size="sm">Empezar</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-16 pt-12 text-center sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-solar-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-solar-700 backdrop-blur dark:border-solar-500/30 dark:bg-ink-900/60 dark:text-solar-300">
            <Sparkles className="size-4" /> Voluntariado con propósito
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-ink-900 dark:text-white sm:text-6xl">
            Tu energía puede{' '}
            <span className="bg-gradient-to-r from-solar-500 to-orange-600 bg-clip-text text-transparent">
              transformar el mundo
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-500 dark:text-ink-300">
            Solary conecta a personas que quieren ayudar con fundaciones que necesitan apoyo. Suma
            tu granito de arena a causas que importan.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/registro">
              <Button size="lg" className="group">
                Únete como voluntario
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/registro">
              <Button variant="outline" size="lg">
                Soy una fundación
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {stats.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-ink-200/60 bg-white/70 p-6 backdrop-blur dark:border-ink-700/60 dark:bg-ink-900/50"
            >
              <Icon className="mx-auto size-6 text-solar-500" />
              <p className="mt-3 font-display text-3xl font-extrabold text-ink-900 dark:text-white">
                {value}
              </p>
              <p className="text-sm text-ink-500 dark:text-ink-400">{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-24">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group rounded-3xl border border-ink-200/60 bg-white/80 p-7 backdrop-blur transition hover:shadow-soft dark:border-ink-700/60 dark:bg-ink-900/50"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-solar-400 to-solar-600 text-white shadow-glow transition-transform group-hover:scale-110">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold text-ink-900 dark:text-white">
                {title}
              </h3>
              <p className="mt-2 text-ink-500 dark:text-ink-400">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-solar-500 via-solar-600 to-orange-700 p-10 text-center text-white sm:p-14"
        >
          <AuroraBackground className="opacity-40 mix-blend-overlay" />
          <h2 className="relative z-10 font-display text-3xl font-extrabold sm:text-4xl">
            Empieza a generar impacto hoy
          </h2>
          <p className="relative z-10 mx-auto mt-3 max-w-lg text-white/85">
            Crear tu cuenta toma menos de un minuto. Es gratis y tu ayuda vale oro.
          </p>
          <Link to="/registro" className="relative z-10 mt-7 inline-block">
            <Button variant="secondary" size="lg">
              Crear mi cuenta <ArrowRight className="size-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      <footer className="relative z-10 border-t border-ink-200/60 py-8 text-center text-sm text-ink-400 dark:border-ink-800">
        © {new Date().getFullYear()} Solary. Hecho con propósito.
      </footer>
    </div>
  )
}
