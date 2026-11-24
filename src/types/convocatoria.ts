/** Tipos del dominio de convocatorias, espejo del backend Solari. */

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
  | 'EN_REVISION'
  | 'LISTA_ESPERA'
  | 'CANCELADO_FUNDACION'

export interface Habilidad {
  id: number
  nombre: string
  categoria?: string | null
  es_profesional?: boolean
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
  // Campos ricos
  objetivo: string | null
  impacto_esperado: string | null
  actividades_voluntario: string | null
  perfil_beneficiarios: string | null
  que_llevar: string | null
  recomendaciones: string | null
  incluye_transporte: boolean
  incluye_alimentacion: boolean
  incluye_seguro: boolean
  politica_cancelacion: string | null
  otorga_certificado: boolean
  horas_reconocidas: number
  nivel_experiencia: string | null
  fecha_limite_postulacion: string | null
  dificultad: string
  urgente: boolean
  fecha_publicacion: string | null
  fecha_creacion: string
  fundacion_id: string
  categoria_id: number
  municipio_id: number | null
  habilidades: Habilidad[]
  imagenes?: { id: string; ruta: string; orden: number }[]
  postulaciones_total?: number | null
  postulaciones_pendientes?: number | null
  programacion_id?: string | null
  coincidencia?: number | null
  habilidades_coinciden?: number[]
  fundacion?: OrganizacionResumen | null
}

export interface OrganizacionResumen {
  id: string
  nombre: string
  logo: string | null
  verificada: boolean
  tipo_organizacion?: string | null
  constituida_legalmente?: boolean
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
  publicacion_id?: string | null
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
  objetivo?: string
  impacto_esperado?: string
  actividades_voluntario?: string
  perfil_beneficiarios?: string
  que_llevar?: string
  recomendaciones?: string
  incluye_transporte?: boolean
  incluye_alimentacion?: boolean
  incluye_seguro?: boolean
  politica_cancelacion?: string
  otorga_certificado?: boolean
  horas_reconocidas?: number
  nivel_experiencia?: string
  fecha_limite_postulacion?: string
  dificultad?: string
  urgente?: boolean
  habilidades: number[]
}

export interface PerfilVoluntario {
  id: string
  usuario_id: string
  tipo_documento: string
  numero_documento: string
  fecha_nacimiento: string
  genero: string
  municipio_id: number
  disponibilidad: string
  experiencia: string | null
  foto_perfil: string | null
  documento_identidad: string | null
  esta_verificado: boolean
  direccion: string | null
  descripcion: string | null
  telefono_contacto: string | null
  nivel_educativo: string | null
  profesion: string | null
  idiomas: string | null
  preferencia_modalidad: string | null
  contacto_emergencia_nombre: string | null
  contacto_emergencia_telefono: string | null
  horas_acumuladas: number
  actividades_completadas: number
  fecha_creacion: string
}

export interface PerfilFundacion {
  id: string
  usuario_id: string
  nombre: string
  nit: string | null
  tipo_organizacion?: string
  constituida_legalmente?: boolean
  historia?: string | null
  mision?: string | null
  mostrar_telefono?: boolean
  mostrar_correo?: boolean
  mostrar_direccion?: boolean
  verificacion_documental?: string
  representante_legal: string
  correo_institucional: string | null
  telefono: string
  direccion: string
  municipio_id: number
  descripcion: string
  pagina_web: string | null
  logo: string | null
  documento_legal: string | null
  estado_verificacion: string
  fecha_creacion: string
}
