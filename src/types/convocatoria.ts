/** Tipos del dominio de convocatorias, espejo del backend Solary. */

export type Modalidad = 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDA'

export type EstadoPublicacion =
  | 'BORRADOR'
  | 'PENDIENTE_APROBACION'
  | 'PUBLICADA'
  | 'CERRADA'
  | 'CANCELADA'
  | 'COMPLETADA'
  | 'FINALIZADA'

export type EstadoPostulacion =
  | 'PENDIENTE'
  | 'ACEPTADO'
  | 'RECHAZADO'
  | 'RETIRADO'
  | 'ASISTIO'
  | 'NO_ASISTIO'

export interface Habilidad {
  id: number
  nombre: string
}

export interface AreaImpacto {
  id: number
  nombre: string
}

export interface Departamento {
  id: number
  nombre: string
}

export interface Municipio {
  id: number
  nombre: string
  departamento?: Departamento | null
}

export interface Convocatoria {
  id: string
  titulo: string
  descripcion: string
  modalidad: Modalidad
  estado: EstadoPublicacion
  fecha_inicio: string
  fecha_fin: string
  hora_inicio: string | null
  hora_fin: string | null
  cupo_maximo: number
  edad_minima: number | null
  edad_maxima: number | null
  requisitos_adicionales: string | null
  direccion_exacta: string | null
  enlace_virtual: string | null
  imagen: string | null
  contacto_nombre: string | null
  contacto_email: string | null
  contacto_telefono: string | null
  fecha_publicacion: string | null
  fecha_creacion: string
  fundacion_id: string
  categoria_id: number
  municipio_id: number | null
  habilidades: Habilidad[]
}

export interface Postulacion {
  id: string
  estado: EstadoPostulacion
  mensaje_voluntario: string | null
  motivo_rechazo: string | null
  calificacion: number | null
  comentario_fundacion: string | null
  fecha_postulacion: string
  fecha_respuesta: string | null
  fecha_confirmacion: string | null
  publicacion_id: string
  voluntario_id: string
}

export interface Notificacion {
  id: string
  tipo: string
  mensaje: string
  objeto_tipo: string | null
  objeto_id: string | null
  leida: boolean
  fecha_lectura: string | null
  fecha_creacion: string
}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  pages?: number
}

export interface ConvocatoriaCreate {
  titulo: string
  descripcion: string
  categoria_id: number
  modalidad: Modalidad
  municipio_id?: number | null
  direccion_exacta?: string
  enlace_virtual?: string
  fecha_inicio: string
  fecha_fin: string
  hora_inicio?: string
  hora_fin?: string
  cupo_maximo: number
  edad_minima?: number | null
  edad_maxima?: number | null
  requisitos_adicionales?: string
  contacto_nombre?: string
  contacto_email?: string
  contacto_telefono?: string
  habilidades: number[]
}
