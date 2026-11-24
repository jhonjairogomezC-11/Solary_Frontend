import { api } from '@/lib/apiClient'

export interface MensajePostulacion {
  id: string
  autor_rol: 'VOLUNTARIO' | 'FUNDACION'
  autor_nombre: string
  mensaje: string
  leido: boolean
  fecha_creacion: string
  es_mio: boolean
}

export interface ConversacionPostulacion {
  postulacion_id: string
  estado: string
  puede_escribir: boolean
  convocatoria_titulo: string
  contraparte_nombre: string
  mensajes: MensajePostulacion[]
}

/** Estados de la postulación en los que se muestra el botón "Mensajes". */
export const ESTADOS_CON_CHAT = ['ACEPTADO', 'EN_REVISION', 'LISTA_ESPERA', 'ASISTIO']

export const MAX_MENSAJE = 1000

export const mensajeService = {
  async conversacion(postulacionId: string): Promise<ConversacionPostulacion> {
    const { data } = await api.get<ConversacionPostulacion>(
      `/postulaciones/${postulacionId}/mensajes`,
    )
    return data
  },

  async enviar(postulacionId: string, mensaje: string): Promise<ConversacionPostulacion> {
    const { data } = await api.post<ConversacionPostulacion>(
      `/postulaciones/${postulacionId}/mensajes`,
      { mensaje },
    )
    return data
  },

  async noLeidos(): Promise<number> {
    const { data } = await api.get<{ total: number }>('/mensajes/no-leidos')
    return data.total
  },
}
