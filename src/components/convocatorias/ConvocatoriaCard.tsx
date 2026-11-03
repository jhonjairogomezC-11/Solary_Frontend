import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarDays, MapPin, Users } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { modalidadBadge } from '@/components/ui/badgeHelpers'
import { formatDate } from '@/lib/utils'
import type { Convocatoria } from '@/types/convocatoria'

export function ConvocatoriaCard({ convocatoria, index = 0 }: { convocatoria: Convocatoria; index?: number }) {
  const mod = modalidadBadge(convocatoria.modalidad)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link
        to={`/app/convocatorias/${convocatoria.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-200/60 bg-white/80 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-soft dark:border-ink-700/60 dark:bg-ink-900/50"
      >
        <div className="relative h-32 overflow-hidden bg-gradient-to-br from-solar-400 to-orange-600">
          {convocatoria.imagen ? (
            <img
              src={convocatoria.imagen}
              alt={convocatoria.titulo}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <span className="font-display text-4xl font-black text-white/30">Solary</span>
            </div>
          )}
          <div className="absolute left-3 top-3">
            <Badge tone={mod.tone}>{mod.label}</Badge>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 font-display text-lg font-bold text-ink-900 dark:text-white">
            {convocatoria.titulo}
          </h3>
          <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-ink-500 dark:text-ink-400">
            {convocatoria.descripcion}
          </p>

          <div className="mt-4 space-y-1.5 text-xs text-ink-500 dark:text-ink-400">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-solar-500" />
              {formatDate(convocatoria.fecha_inicio)}
              {convocatoria.fecha_fin !== convocatoria.fecha_inicio &&
                ` – ${formatDate(convocatoria.fecha_fin)}`}
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="size-3.5 text-solar-500" />
              {convocatoria.cupo_maximo} cupo{convocatoria.cupo_maximo !== 1 ? 's' : ''}
            </div>
            {convocatoria.modalidad !== 'VIRTUAL' && convocatoria.direccion_exacta && (
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-solar-500" />
                <span className="line-clamp-1">{convocatoria.direccion_exacta}</span>
              </div>
            )}
          </div>

          {convocatoria.habilidades.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {convocatoria.habilidades.slice(0, 3).map((h) => (
                <span
                  key={h.id}
                  className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-medium text-ink-600 dark:bg-ink-800 dark:text-ink-300"
                >
                  {h.nombre}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
