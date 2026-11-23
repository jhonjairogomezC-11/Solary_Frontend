import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  Building2,
  CalendarCheck,
  ClipboardList,
  LayoutDashboard,
  ListTree,
  LogOut,
  Megaphone,
  Menu,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'

import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/auth/AuthContext'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { to: '/admin/voluntarios', label: 'Verificar voluntarios', icon: BadgeCheck },
  { to: '/admin/fundaciones', label: 'Fundaciones', icon: Building2 },
  { to: '/admin/convocatorias', label: 'Convocatorias', icon: Megaphone },
  { to: '/admin/postulaciones', label: 'Postulaciones', icon: CalendarCheck },
  { to: '/admin/catalogos', label: 'Catálogos', icon: ListTree },
  { to: '/admin/gestion', label: 'Gestión y auditoría', icon: ClipboardList },
]

export function AdminLayout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  const sidebar = (
    <>
      <div className="px-5 py-5">
        <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
          <Logo />
        </Link>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
          <ShieldCheck className="size-3" /> Administración
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-glow'
                  : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800',
              )
            }
          >
            <Icon className="size-5 shrink-0" />
            <span className="flex-1">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-ink-200/60 p-3 dark:border-ink-800">
        <div className="mb-2 flex items-center gap-2.5 rounded-xl px-3 py-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-violet-600 text-white">
            <ShieldCheck className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">
              {usuario?.nombre}
            </p>
            <p className="truncate text-xs text-ink-400">Administrador</p>
          </div>
        </div>
        <Link
          to="/app"
          className="mb-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
        >
          <LayoutDashboard className="size-5" /> Vista de usuario
        </Link>
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
    <div className="flex min-h-screen bg-ink-50 dark:bg-ink-950">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-ink-200/60 bg-white/70 backdrop-blur lg:flex dark:border-ink-800 dark:bg-ink-950/60">
        {sidebar}
      </aside>

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
  )
}
