import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Award,
  Bell,
  Building2,
  Compass,
  Gift,
  Repeat,
  Sparkles,
  Store,
  HeartHandshake,
  History,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Heart,
  Megaphone,
  Menu,
  Trophy,
  UserCog,
  X,
} from 'lucide-react'

import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/auth/AuthContext'
import { FavoritosProvider } from '@/hooks/useFavoritos'
import { convocatoriaService } from '@/services/convocatoriaService'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: typeof Compass
  end?: boolean
  /** Rutas hijas que también deben marcar este ítem como activo. */
  also?: string[]
}

export function AppLayout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [noLeidas, setNoLeidas] = useState(0)

  const esFundacion = usuario?.rol === 'FUNDACION'

  useEffect(() => {
    let active = true
    convocatoriaService
      .noLeidas()
      .then((n) => active && setNoLeidas(n))
      .catch(() => {})
    const id = setInterval(() => {
      convocatoriaService
        .noLeidas()
        .then((n) => active && setNoLeidas(n))
        .catch(() => {})
    }, 30000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [])

  const navItems: NavItem[] = esFundacion
    ? [
        { to: '/app', label: 'Panel', icon: LayoutDashboard, end: true },
        { to: '/app/mis-convocatorias', label: 'Mis convocatorias', icon: Megaphone },
        { to: '/app/convocatorias', label: 'Explorar', icon: Compass },
        { to: '/app/programaciones', label: 'Actividades recurrentes', icon: Repeat },
        { to: '/app/ofrecimientos', label: 'Objetos y servicios', icon: Gift, also: ['/app/solicitudes-interes'] },
        { to: '/app/notificaciones', label: 'Notificaciones', icon: Bell },
        { to: '/app/soporte', label: 'Ayuda', icon: LifeBuoy },
        { to: '/app/perfil-publico', label: 'Perfil público', icon: Store },
        { to: '/app/perfil', label: 'Mi perfil', icon: UserCog },
      ]
    : [
        { to: '/app', label: 'Panel', icon: LayoutDashboard, end: true },
        { to: '/app/convocatorias', label: 'Explorar', icon: Compass },
        { to: '/app/mis-postulaciones', label: 'Mis postulaciones', icon: HeartHandshake },
        { to: '/app/favoritos', label: 'Favoritos', icon: Heart },
        { to: '/app/trayectoria', label: 'Mi trayectoria', icon: History },
        { to: '/app/habilidades', label: 'Mis habilidades', icon: Sparkles },
        { to: '/app/ofrecimientos', label: 'Objetos y servicios', icon: Gift, also: ['/app/solicitudes-interes'] },
        { to: '/app/logros', label: 'Logros y XP', icon: Award },
        { to: '/app/ranking', label: 'Ranking', icon: Trophy },
        { to: '/app/notificaciones', label: 'Notificaciones', icon: Bell },
        { to: '/app/soporte', label: 'Ayuda', icon: LifeBuoy },
        { to: '/app/perfil', label: 'Mi perfil', icon: UserCog },
      ]

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  const sidebar = (
    <>
      <div className="px-5 py-5">
        <Link to="/app" onClick={() => setMobileOpen(false)}>
          <Logo />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(({ to, label, icon: Icon, end, also }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
                isActive || also?.some((p) => pathname.startsWith(p))
                  ? 'bg-gradient-to-r from-solar-500 to-solar-600 text-white shadow-glow'
                  : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800',
              )
            }
          >
            <Icon className="size-5 shrink-0" />
            <span className="flex-1">{label}</span>
            {label === 'Notificaciones' && noLeidas > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {noLeidas > 9 ? '9+' : noLeidas}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-ink-200/60 p-3 dark:border-ink-800">
        <div className="mb-2 flex items-center gap-2.5 rounded-xl px-3 py-2">
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-lg text-white',
              esFundacion
                ? 'bg-gradient-to-br from-sky-400 to-sky-600'
                : 'bg-gradient-to-br from-solar-400 to-solar-600',
            )}
          >
            {esFundacion ? <Building2 className="size-4.5" /> : <HeartHandshake className="size-4.5" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">
              {usuario?.nombre}
            </p>
            <p className="truncate text-xs text-ink-400">{esFundacion ? 'Fundación' : 'Voluntario'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-600 transition hover:bg-red-50 hover:text-red-600 dark:text-ink-300 dark:hover:bg-red-500/10"
        >
          <LogOut className="size-5" /> Cerrar sesión
        </button>
      </div>
    </>
  )

  return (
    <FavoritosProvider>
    <div className="flex min-h-screen bg-solar-50 dark:bg-ink-950">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-ink-200/60 bg-white/70 backdrop-blur lg:flex dark:border-ink-800 dark:bg-ink-950/60">
        {sidebar}
      </aside>

      {/* Sidebar móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white dark:bg-ink-950">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-5 text-ink-400"
              aria-label="Cerrar menú"
            >
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Contenido */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-200/60 bg-white/70 px-4 py-3 backdrop-blur lg:px-8 dark:border-ink-800 dark:bg-ink-950/60">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-ink-600 lg:hidden dark:text-ink-300"
            aria-label="Abrir menú"
          >
            <Menu className="size-6" />
          </button>
          <div className="lg:hidden">
            <Logo showText={false} size={32} />
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
    </FavoritosProvider>
  )
}
