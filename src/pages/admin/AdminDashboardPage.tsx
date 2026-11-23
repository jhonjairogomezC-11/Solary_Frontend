import { useEffect, useState } from 'react'
import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Eye,
  HeartHandshake,
  Megaphone,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react'

import { StatCard } from '@/components/admin/StatCard'
import { BarChart } from '@/components/admin/BarChart'
import { adminService } from '@/services/adminService'
import type { DashboardStats } from '@/types/admin'

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminService
      .dashboard()
      .then(setStats)
      .catch(() => setError('No se pudo cargar el panel.'))
  }, [])

  if (error) return <p className="text-sm text-red-500">{error}</p>
  if (!stats)
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800"
          />
        ))}
      </div>
    )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">Panel de administración</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Vista general del sistema Solari.
        </p>
      </div>

      {/* Usuarios */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-400">
          Usuarios
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total usuarios" value={stats.total_usuarios} icon={Users} tone="solar" />
          <StatCard
            label="Voluntarios"
            value={stats.total_voluntarios}
            icon={HeartHandshake}
            tone="emerald"
          />
          <StatCard
            label="Fundaciones"
            value={stats.total_fundaciones}
            icon={Building2}
            tone="sky"
          />
          <StatCard
            label="Nuevos (30 días)"
            value={stats.nuevos_usuarios_30d}
            icon={UserPlus}
            tone="violet"
          />
        </div>
      </section>

      {/* Fundaciones + Convocatorias */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-400">
          Verificación y contenido
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Fundaciones pendientes"
            value={stats.fundaciones_pendientes}
            icon={Clock}
            tone="amber"
            hint="Requieren revisión"
          />
          <StatCard
            label="Fundaciones aprobadas"
            value={stats.fundaciones_aprobadas}
            icon={ShieldCheck}
            tone="emerald"
          />
          <StatCard
            label="Convocatorias"
            value={stats.total_convocatorias}
            icon={Megaphone}
            tone="solar"
            hint={`${stats.convocatorias_publicadas} publicadas`}
          />
          <StatCard
            label="Ocultas por admin"
            value={stats.convocatorias_ocultas}
            icon={Eye}
            tone="red"
          />
        </div>
      </section>

      {/* Postulaciones */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-400">
          Postulaciones
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total postulaciones"
            value={stats.total_postulaciones}
            icon={CalendarCheck}
            tone="sky"
          />
          <StatCard
            label="Pendientes"
            value={stats.postulaciones_pendientes}
            icon={Clock}
            tone="amber"
          />
          <StatCard
            label="Aceptadas"
            value={stats.postulaciones_aceptadas}
            icon={CheckCircle2}
            tone="emerald"
          />
        </div>
      </section>

      {/* Gráficas */}
      <section className="grid gap-4 lg:grid-cols-2">
        <BarChart
          title="Convocatorias por estado"
          data={stats.convocatorias_por_estado.map((c) => ({ label: c.estado, value: c.total }))}
        />
        <BarChart
          title="Postulaciones por estado"
          data={stats.postulaciones_por_estado.map((p) => ({ label: p.estado, value: p.total }))}
        />
      </section>
    </div>
  )
}
