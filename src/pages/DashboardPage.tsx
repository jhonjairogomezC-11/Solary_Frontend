import { motion } from 'framer-motion'
import {
  BadgeCheck,
  Bell,
  Building2,
  CalendarHeart,
  HeartHandshake,
  LogOut,
  Rocket,
  ShieldAlert,
} from 'lucide-react'

import { AuroraBackground } from '@/components/ui/AuroraBackground'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/auth/AuthContext'
import { cn } from '@/lib/utils'

const comingSoon = [
  { icon: CalendarHeart, title: 'Convocatorias', desc: 'Explora y postúlate a oportunidades de voluntariado.' },
  { icon: HeartHandshake, title: 'Mis postulaciones', desc: 'Haz seguimiento al estado de tus solicitudes.' },
  { icon: Bell, title: 'Notificaciones', desc: 'Entérate en tiempo real de novedades y mensajes.' },
  { icon: Rocket, title: 'Impacto', desc: 'Mide las horas y causas a las que has contribuido.' },
]

export function DashboardPage() {
  const { usuario, logout } = useAuth()
  if (!usuario) return null

  const esFundacion = usuario.rol === 'FUNDACION'
  const primerNombre = usuario.nombre.split(' ')[0]

  return (
    <div className="relative min-h-screen bg-solar-50 dark:bg-ink-950">
      <AuroraBackground className="opacity-40" />

      <header className="relative z-10 border-b border-ink-200/60 bg-white/70 backdrop-blur dark:border-ink-800 dark:bg-ink-950/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Logo />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={() => void logout()}>
              <LogOut className="size-4" /> Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5 py-10">
        {/* Saludo */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-ink-500 dark:text-ink-400">¡Hola de nuevo!</p>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
              {primerNombre} 👋
            </h1>
          </div>
          <span
            className={cn(
              'inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold',
              esFundacion
                ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300'
                : 'bg-solar-100 text-solar-700 dark:bg-solar-500/15 dark:text-solar-300',
            )}
          >
            {esFundacion ? <Building2 className="size-4" /> : <HeartHandshake className="size-4" />}
            {esFundacion ? 'Fundación' : 'Voluntario'}
          </span>
        </motion.div>

        {/* Estado de la cuenta */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl border border-ink-200/60 bg-white/80 p-5 backdrop-blur dark:border-ink-700/60 dark:bg-ink-900/50">
            <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              <BadgeCheck className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-ink-900 dark:text-white">Correo</p>
              <p className="text-sm text-ink-500 dark:text-ink-400">{usuario.email}</p>
              <p className="mt-1 text-xs font-medium">
                {usuario.email_verificado ? (
                  <span className="text-emerald-600 dark:text-emerald-400">Verificado</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">Pendiente de verificar</span>
                )}
              </p>
            </div>
          </div>

          {!usuario.email_verificado && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                <ShieldAlert className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-ink-900 dark:text-white">Verifica tu correo</p>
                <p className="text-sm text-ink-500 dark:text-ink-400">
                  Revisa tu bandeja de entrada para activar todas las funciones.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Próximamente */}
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">
            Próximamente en Solary
          </h2>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            Estamos construyendo estas funciones. ¡Muy pronto estarán disponibles!
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {comingSoon.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="relative overflow-hidden rounded-2xl border border-ink-200/60 bg-white/70 p-5 backdrop-blur dark:border-ink-700/60 dark:bg-ink-900/50"
              >
                <span className="absolute right-3 top-3 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-400 dark:bg-ink-800 dark:text-ink-500">
                  Pronto
                </span>
                <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-solar-400/90 to-solar-600/90 text-white">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold text-ink-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
