import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Loader2 } from 'lucide-react'

import { ConvocatoriaCard } from '@/components/convocatorias/ConvocatoriaCard'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { parseApiError } from '@/lib/apiClient'
import { convocatoriaService } from '@/services/convocatoriaService'
import type { Convocatoria } from '@/types/convocatoria'
import { useFavoritos } from '@/hooks/useFavoritos'

export function FavoritosPage() {
  const { ids } = useFavoritos()
  const [items, setItems] = useState<Convocatoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    convocatoriaService
      .favoritosConvocatorias()
      .then((favs) => active && setItems(favs.map((f) => f.convocatoria)))
      .catch((err) => active && setError(parseApiError(err).message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
    // Recarga cuando cambian los ids (al quitar un favorito desde la tarjeta).
  }, [ids])

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
          Mis favoritos
        </h1>
        <p className="mt-1 text-ink-500 dark:text-ink-400">
          Las convocatorias que guardaste para revisar luego.
        </p>
      </div>

      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-solar-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 py-16 text-center dark:border-ink-700">
          <Heart className="mx-auto size-10 text-ink-300" />
          <p className="mt-3 text-ink-500 dark:text-ink-400">
            Aún no has guardado ninguna convocatoria.
          </p>
          <Link to="/app/convocatorias" className="mt-4 inline-block">
            <Button>Explorar convocatorias</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c, i) => (
            <ConvocatoriaCard key={c.id} convocatoria={c} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
