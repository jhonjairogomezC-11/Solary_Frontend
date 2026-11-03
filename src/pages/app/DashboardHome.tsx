import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Bell, Compass, HeartHandshake, Megaphone, Plus, UserCog } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/auth/AuthContext'
import { convocatoriaService } from '@/services/convocatoriaService'

export function DashboardHome() {
  const { usuario } = useAuth()
  const esFundacion = usuario?.rol === 'FUNDACION'
  const primerNombre = usuario?.nombre.split(' ')[0] ?? ''
  const [noLeidas, setNoLeidas] = useState(0)
  const [perfilCompleto, setPerfilCompleto] = useState(true)

  useEffect(() => {
    convocatoriaService.noLeidas().then(setNoLeidas).catch(() => {})
    convocatoriaService
      .estadoPerfil()
      .then((e) => setPerfilCompleto(e.perfil_completo))
      .catch(() => {})
  }, [])

  const accionesFundacion = [
    { to: '/app/convocatorias/nueva', label: 'Publicar convocatoria', desc: 'Crea una nueva oportunidad', icon: Plus },
    { to: '/app/mis-convocatorias', label: 'Mis convocatorias', desc: 'Gestiona y revisa postulaciones', icon: Megaphone },
    { to: '/app/convocatorias', label: 'Explorar', desc: 'Mira qué publican otras fundaciones', icon: Compass },
  ]
  const accionesVoluntario = [
    { to: '/app/convocatorias', label: 'Explorar convocatorias', desc: 'Encuentra dónde ayudar', icon: Compass },
    { to: '/app/mis-postulaciones', label: 'Mis postulaciones', desc: 'Sigue el estado de tus solicitudes', icon: HeartHandshake },
    { to: '/app/notificaciones', label: 'Notificaciones', desc: 'Novedades sobre tu actividad', icon: Bell },
  ]
  const acciones = esFundacion ? accionesFundacion : accionesVoluntario

  return (
    <div className="mx-auto max-w-5xl">
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
        <Badge tone={esFundacion ? 'blue' : 'solar'}>{esFundacion ? 'Fundación' : 'Voluntario'}</Badge>
      </motion.div>

      {!perfilCompleto && (
        <Link
          to="/app/perfil"
          className="mt-6 flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 transition hover:shadow-soft dark:border-amber-500/40 dark:bg-amber-500/10"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-amber-400 text-white">
            <UserCog className="size-5" />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-amber-800 dark:text-amber-200">
              Completa tu perfil para continuar
            </p>
            <p className="text-sm text-amber-700/80 dark:text-amber-300/80">
              {esFundacion
                ? 'Necesitas los datos de tu fundación para publicar convocatorias.'
                : 'Necesitas tu perfil para postularte a convocatorias.'}
            </p>
          </div>
          <ArrowRight className="size-5 text-amber-500" />
        </Link>
      )}

      {!usuario?.email_verificado && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          Verifica tu correo para aprovechar todas las funciones. Revisa tu bandeja de entrada.
        </div>
      )}

      {noLeidas > 0 && (
        <Link
          to="/app/notificaciones"
          className="mt-6 flex items-center gap-3 rounded-2xl border border-solar-200 bg-solar-50 p-4 transition hover:shadow-soft dark:border-solar-500/30 dark:bg-solar-500/10"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-solar-400 to-solar-600 text-white">
            <Bell className="size-5" />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-ink-900 dark:text-white">
              Tienes {noLeidas} notificación{noLeidas !== 1 ? 'es' : ''} sin leer
            </p>
            <p className="text-sm text-ink-500 dark:text-ink-400">Toca para verlas</p>
          </div>
          <ArrowRight className="size-5 text-solar-500" />
        </Link>
      )}

      <div className="mt-8">
        <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">Accesos rápidos</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {acciones.map(({ to, label, desc, icon: Icon }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                to={to}
                className="group flex h-full flex-col rounded-2xl border border-ink-200/60 bg-white/70 p-5 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-soft dark:border-ink-700/60 dark:bg-ink-900/50"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-solar-400 to-solar-600 text-white transition-transform group-hover:scale-110">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold text-ink-900 dark:text-white">{label}</h3>
                <p className="mt-1 flex-1 text-sm text-ink-500 dark:text-ink-400">{desc}</p>
                <span className="mt-3 flex items-center gap-1 text-sm font-medium text-solar-600 dark:text-solar-400">
                  Ir <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {esFundacion && (
        <div className="mt-8 rounded-3xl bg-gradient-to-br from-solar-500 to-orange-600 p-8 text-center text-white">
          <Megaphone className="mx-auto size-8" />
          <h2 className="mt-3 font-display text-2xl font-extrabold">¿Listo para sumar voluntarios?</h2>
          <p className="mt-1 text-white/85">Publica tu próxima convocatoria en minutos.</p>
          <Link to="/app/convocatorias/nueva" className="mt-5 inline-block">
            <Button variant="secondary" size="lg">
              <Plus className="size-4" /> Nueva convocatoria
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
