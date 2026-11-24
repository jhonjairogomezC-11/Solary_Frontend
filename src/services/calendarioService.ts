import { api } from '@/lib/apiClient'

export interface EventoCalendario {
  publicacion_id: string
  postulacion_id: string | null
  estado_postulacion: string | null
  /** true si la participación está aceptada; false si sigue pendiente. */
  confirmada: boolean
  titulo: string
  fecha_inicio: string
  fecha_fin: string
  hora_inicio: string | null
  hora_fin: string | null
  modalidad: string
  municipio: string | null
  direccion_exacta: string | null
  enlace_virtual: string | null
  horas_reconocidas: number
  organizacion_id: string
  organizacion: string
  cupo_maximo: number | null
  voluntarios_aceptados: number | null
}

interface Rango {
  desde: string
  hasta: string
}

export const calendarioService = {
  async voluntario(rango: Rango): Promise<EventoCalendario[]> {
    const { data } = await api.get<EventoCalendario[]>('/voluntario/calendario', {
      params: rango,
    })
    return data
  },

  async fundacion(rango: Rango): Promise<EventoCalendario[]> {
    const { data } = await api.get<EventoCalendario[]>('/fundacion/calendario', {
      params: rango,
    })
    return data
  },

  /** Descarga el .ics de las actividades aceptadas del voluntario. */
  async descargarIcs(): Promise<void> {
    const { data } = await api.get<Blob>('/voluntario/calendario.ics', {
      responseType: 'blob',
      headers: { Accept: 'text/calendar' },
    })
    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = 'solari-calendario.ics'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  },
}
