import { createContext, useContext } from 'react'

export interface TourCtx {
  iniciar: () => void
}

export const TourContext = createContext<TourCtx>({ iniciar: () => {} })

/** Acceso al tutorial de bienvenida (por ejemplo, para relanzarlo desde un botón). */
export const useTour = () => useContext(TourContext)
