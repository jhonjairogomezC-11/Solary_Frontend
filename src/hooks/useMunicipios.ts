import { useEffect, useState } from 'react'

import { convocatoriaService } from '@/services/convocatoriaService'
import type { Municipio } from '@/types/convocatoria'

export interface MunicipioOption {
  value: number
  label: string
}

// Caché a nivel de módulo: el catálogo de municipios casi no cambia, así que se
// pide una sola vez por carga de la aplicación y se comparte entre formularios.
let cache: MunicipioOption[] | null = null
let pending: Promise<MunicipioOption[]> | null = null

function toOptions(municipios: Municipio[]): MunicipioOption[] {
  return municipios.map((m) => ({ value: m.id, label: m.nombre }))
}

function loadMunicipios(): Promise<MunicipioOption[]> {
  if (cache) return Promise.resolve(cache)
  if (!pending) {
    pending = convocatoriaService
      .municipios()
      .then((data) => {
        cache = toOptions(data)
        return cache
      })
      .finally(() => {
        // Si falla, se permite reintentar en el próximo montaje.
        pending = null
      })
  }
  return pending
}

/** Opciones de municipio para un `<Select>`, cargadas desde GET /catalogos/municipios. */
export function useMunicipios() {
  const [options, setOptions] = useState<MunicipioOption[]>(() => cache ?? [])
  const [loading, setLoading] = useState(cache === null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (cache) return
    let active = true
    loadMunicipios()
      .then((data) => {
        if (active) setOptions(data)
      })
      .catch(() => {
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { options, loading, error }
}
