import { useEffect, useState } from 'react'
import { Crown, Loader2, Medal, Trophy } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { useAuth } from '@/auth/AuthContext'
import { parseApiError } from '@/lib/apiClient'
import { cn } from '@/lib/utils'
import { voluntarioService } from '@/services/voluntarioService'
import type { RankingItem, RankingResponse } from '@/types/voluntario'

export function RankingPage() {
  const { usuario } = useAuth()
  const [data, setData] = useState<RankingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    voluntarioService
      .ranking()
      .then((r) => active && setData(r))
      .catch((err) => active && setError(parseApiError(err).message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-solar-500" />
      </div>
    )
  }

  if (error || !data) {
    return <Alert tone="error">{error ?? 'No se pudo cargar el ranking.'}</Alert>
  }

  const podio = data.top.slice(0, 3)
  const resto = data.top.slice(3)

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
          Ranking de voluntarios
        </h1>
        <p className="mt-1 text-ink-500 dark:text-ink-400">
          Los voluntarios con más experiencia acumulada en Bogotá.
        </p>
      </div>

      {/* Mi posición */}
      <div className="mb-8 flex items-center gap-4 rounded-2xl border border-solar-300 bg-solar-50 p-4 dark:border-solar-500/40 dark:bg-solar-500/10">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-solar-400 to-solar-600 text-white">
          <Trophy className="size-7" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-ink-500 dark:text-ink-400">Tu posición</p>
          {data.mi_posicion > 0 ? (
            <p className="font-display text-2xl font-extrabold text-ink-900 dark:text-white">
              #{data.mi_posicion}
              <span className="ml-2 text-base font-semibold text-solar-600 dark:text-solar-400">
                {data.mi_xp.toLocaleString()} XP
              </span>
            </p>
          ) : (
            <p className="font-medium text-ink-700 dark:text-ink-200">
              Aún no estás en el ranking. Participa en actividades para ganar XP.
            </p>
          )}
          {data.mi_posicion > 0 && !data.en_top && (
            <p className="text-xs text-ink-400">Estás fuera del top 1000.</p>
          )}
        </div>
      </div>

      {data.top.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 py-16 text-center dark:border-ink-700">
          <Trophy className="mx-auto size-10 text-ink-300" />
          <p className="mt-3 text-ink-500 dark:text-ink-400">
            Todavía no hay voluntarios con experiencia. ¡Sé el primero!
          </p>
        </div>
      ) : (
        <>
          {/* Podio top 3 */}
          {podio.length > 0 && (
            <div className="mb-8 grid grid-cols-3 items-end gap-3">
              {ordenarPodio(podio).map((item) => (
                <PodioCard
                  key={item.voluntario_id}
                  item={item}
                  esYo={item.voluntario_id === usuario?.id}
                />
              ))}
            </div>
          )}

          {/* Resto del ranking */}
          {resto.length > 0 && (
            <div className="divide-y divide-ink-200/60 overflow-hidden rounded-2xl border border-ink-200/60 bg-white/70 dark:divide-ink-800 dark:border-ink-700/60 dark:bg-ink-900/50">
              {resto.map((item) => (
                <div
                  key={item.voluntario_id}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3',
                    item.voluntario_id === usuario?.id && 'bg-solar-50 dark:bg-solar-500/10',
                  )}
                >
                  <span className="w-8 shrink-0 text-center font-display text-lg font-bold text-ink-400">
                    {item.posicion}
                  </span>
                  <Avatar nombre={item.nombre} foto={item.foto_perfil} />
                  <span className="min-w-0 flex-1 truncate font-medium text-ink-800 dark:text-ink-100">
                    {item.nombre}
                  </span>
                  <span className="shrink-0 font-semibold text-solar-600 dark:text-solar-400">
                    {item.xp.toLocaleString()} XP{item.nivel_nombre ? ` · ${item.nivel_nombre}` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

/** Reordena [1,2,3] → [2,1,3] para pintar el podio con el 1º en el centro. */
function ordenarPodio(podio: RankingItem[]): RankingItem[] {
  if (podio.length < 3) return podio
  return [podio[1], podio[0], podio[2]]
}

function PodioCard({ item, esYo }: { item: RankingItem; esYo: boolean }) {
  const config: Record<number, { alto: string; color: string; icon: typeof Crown }> = {
    1: { alto: 'h-40', color: 'from-amber-300 to-amber-500', icon: Crown },
    2: { alto: 'h-32', color: 'from-ink-300 to-ink-400', icon: Medal },
    3: { alto: 'h-28', color: 'from-orange-300 to-orange-500', icon: Medal },
  }
  const c = config[item.posicion] ?? config[3]
  const Icon = c.icon

  return (
    <div className="flex flex-col items-center">
      <Avatar nombre={item.nombre} foto={item.foto_perfil} size="lg" />
      <p
        className={cn(
          'mt-2 max-w-full truncate text-center text-sm font-semibold',
          esYo ? 'text-solar-600 dark:text-solar-400' : 'text-ink-800 dark:text-ink-100',
        )}
      >
        {item.nombre}
      </p>
      <p className="text-xs font-bold text-solar-600 dark:text-solar-400">
        {item.xp.toLocaleString()} XP{item.nivel_nombre ? ` · ${item.nivel_nombre}` : ""}
      </p>
      <div
        className={cn(
          'mt-2 flex w-full flex-col items-center justify-start rounded-t-2xl bg-gradient-to-b pt-3 text-white',
          c.alto,
          c.color,
        )}
      >
        <Icon className="size-6" />
        <span className="mt-1 font-display text-3xl font-black">{item.posicion}</span>
      </div>
    </div>
  )
}

function Avatar({
  nombre,
  foto,
  size = 'md',
}: {
  nombre: string
  foto: string | null
  size?: 'md' | 'lg'
}) {
  const dim = size === 'lg' ? 'size-16 text-xl' : 'size-10 text-sm'
  const iniciales = nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-solar-300 to-solar-500 font-bold text-white',
        dim,
      )}
    >
      {foto ? <img src={foto} alt={nombre} className="size-full object-cover" /> : iniciales}
    </span>
  )
}
