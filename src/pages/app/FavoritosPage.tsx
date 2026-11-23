import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Heart, Loader2 } from 'lucide-react'

import { ConvocatoriaCard } from '@/components/convocatorias/ConvocatoriaCard'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { parseApiError } from '@/lib/apiClient'
import { cn } from '@/lib/utils'
import { convocatoriaService } from '@/services/convocatoriaService'
import { voluntarioService } from '@/services/voluntarioService'
import type { Convocatoria } from '@/types/convocatoria'
import { useFavoritos } from '@/hooks/useFavoritos'

type FundacionFav = Awaited<ReturnType<typeof voluntarioService.favoritosFundaciones>>[number]
type Tab = 'convocatorias' | 'fundaciones'

export function FavoritosPage() {
  const { ids } = useFavoritos()
  const [tab, setTab] = useState<Tab>('convocatorias')
  const [convs, setConvs] = useState<Convocatoria[]>([])
  const [fundaciones, setFundaciones] = useState<FundacionFav[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([
      convocatoriaService.favoritosConvocatorias(),
      voluntarioService.favoritosFundaciones(),
    ])
      .then(([favsC, favsF]) => {
        if (!active) return
        setConvs(favsC.map((f) => f.convocatoria))
        setFundaciones(favsF)
      })
      .catch((err) => active && setError(parseApiError(err).message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [ids])

  const quitarFundacion = async (id: string) => {
    await voluntarioService.toggleFavoritoFundacion(id)
    setFundaciones((prev) => prev.filter((f) => f.fundacion.id !== id))
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
          Mis favoritos
        </h1>
        <p className="mt-1 text-ink-500 dark:text-ink-400">
          Convocatorias y fundaciones que guardaste.
        </p>
      </div>

      <div className="mb-6 flex gap-2 rounded-xl bg-ink-100 p-1 dark:bg-ink-800/60">
        <button
          onClick={() => setTab('convocatorias')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
            tab === 'convocatorias'
              ? 'bg-white text-ink-900 shadow-sm dark:bg-ink-900 dark:text-white'
              : 'text-ink-500 hover:text-ink-700 dark:text-ink-400',
          )}
        >
          <Heart className="size-4" /> Convocatorias ({convs.length})
        </button>
        <button
          onClick={() => setTab('fundaciones')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
            tab === 'fundaciones'
              ? 'bg-white text-ink-900 shadow-sm dark:bg-ink-900 dark:text-white'
              : 'text-ink-500 hover:text-ink-700 dark:text-ink-400',
          )}
        >
          <Building2 className="size-4" /> Fundaciones ({fundaciones.length})
        </button>
      </div>

      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-solar-500" />
        </div>
      ) : tab === 'convocatorias' ? (
        convs.length === 0 ? (
          <Vacio
            icon={Heart}
            texto="Aún no has guardado ninguna convocatoria."
            cta="Explorar convocatorias"
            to="/app/convocatorias"
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {convs.map((c, i) => (
              <ConvocatoriaCard key={c.id} convocatoria={c} index={i} />
            ))}
          </div>
        )
      ) : fundaciones.length === 0 ? (
        <Vacio
          icon={Building2}
          texto="No has guardado ninguna fundación."
          cta="Explorar convocatorias"
          to="/app/convocatorias"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fundaciones.map((f) => (
            <div
              key={f.id}
              className="flex items-start gap-3 rounded-2xl border border-ink-200/60 bg-white/70 p-4 backdrop-blur dark:border-ink-700/60 dark:bg-ink-900/50"
            >
              <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 text-white">
                {f.fundacion.logo ? (
                  <img src={f.fundacion.logo} alt={f.fundacion.nombre} className="size-full object-cover" />
                ) : (
                  <Building2 className="size-6" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold text-ink-900 dark:text-white">
                    {f.fundacion.nombre}
                  </h3>
                  {f.fundacion.estado_verificacion === 'APROBADA' && (
                    <Badge tone="green">Verificada</Badge>
                  )}
                </div>
                {f.fundacion.descripcion && (
                  <p className="mt-1 line-clamp-2 text-sm text-ink-500 dark:text-ink-400">
                    {f.fundacion.descripcion}
                  </p>
                )}
                <button
                  onClick={() => quitarFundacion(f.fundacion.id)}
                  className="mt-2 text-xs font-medium text-red-500 hover:underline"
                >
                  Quitar de favoritos
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Vacio({
  icon: Icon,
  texto,
  cta,
  to,
}: {
  icon: typeof Heart
  texto: string
  cta: string
  to: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-300 py-16 text-center dark:border-ink-700">
      <Icon className="mx-auto size-10 text-ink-300" />
      <p className="mt-3 text-ink-500 dark:text-ink-400">{texto}</p>
      <Link to={to} className="mt-4 inline-block">
        <Button>{cta}</Button>
      </Link>
    </div>
  )
}
