import { Heart } from 'lucide-react'

import { useFavoritos } from '@/hooks/useFavoritos'
import { cn } from '@/lib/utils'

interface Props {
  convocatoriaId: string
  className?: string
  size?: 'sm' | 'md'
}

export function FavoritoButton({ convocatoriaId, className, size = 'md' }: Props) {
  const { esVoluntario, esFavorito, toggle } = useFavoritos()
  if (!esVoluntario) return null

  const activo = esFavorito(convocatoriaId)
  const dim = size === 'sm' ? 'size-8' : 'size-9'
  const icon = size === 'sm' ? 'size-4' : 'size-4.5'

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void toggle(convocatoriaId)
      }}
      aria-label={activo ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      className={cn(
        'inline-flex items-center justify-center rounded-full backdrop-blur transition active:scale-90',
        dim,
        activo
          ? 'bg-red-500 text-white'
          : 'bg-white/80 text-ink-500 hover:text-red-500 dark:bg-ink-900/70 dark:text-ink-300',
        className,
      )}
    >
      <Heart className={cn(icon, activo && 'fill-current')} />
    </button>
  )
}
