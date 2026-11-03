import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { useAuth } from '@/auth/AuthContext'
import { convocatoriaService } from '@/services/convocatoriaService'

interface FavoritosContextValue {
  ids: Set<string>
  esVoluntario: boolean
  esFavorito: (id: string) => boolean
  toggle: (id: string) => Promise<void>
  recargar: () => void
}

const FavoritosContext = createContext<FavoritosContextValue | undefined>(undefined)

export function FavoritosProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth()
  const esVoluntario = usuario?.rol === 'VOLUNTARIO'
  const [ids, setIds] = useState<Set<string>>(new Set())

  const recargar = useCallback(() => {
    if (!esVoluntario) return
    convocatoriaService
      .favoritosIds()
      .then((lista) => setIds(new Set(lista)))
      .catch(() => {})
  }, [esVoluntario])

  useEffect(() => {
    recargar()
  }, [recargar])

  const toggle = useCallback(
    async (id: string) => {
      // Optimista: actualiza la UI al instante y revierte si falla.
      setIds((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
      try {
        await convocatoriaService.toggleFavorito(id)
      } catch {
        setIds((prev) => {
          const next = new Set(prev)
          if (next.has(id)) next.delete(id)
          else next.add(id)
          return next
        })
      }
    },
    [],
  )

  const value = useMemo<FavoritosContextValue>(
    () => ({
      ids,
      esVoluntario,
      esFavorito: (id: string) => ids.has(id),
      toggle,
      recargar,
    }),
    [ids, esVoluntario, toggle, recargar],
  )

  return <FavoritosContext.Provider value={value}>{children}</FavoritosContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFavoritos(): FavoritosContextValue {
  const ctx = useContext(FavoritosContext)
  if (!ctx) throw new Error('useFavoritos debe usarse dentro de <FavoritosProvider>')
  return ctx
}
