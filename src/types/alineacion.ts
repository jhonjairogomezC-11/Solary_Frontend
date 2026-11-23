/** Tipos de los módulos alineados con el documento de grado. */

import type { Convocatoria, Paginated } from '@/types/convocatoria'

// ─────────────── Habilidades ───────────────
export interface HabilidadCat {
  id: number
  nombre: string
  categoria: string | null
  es_profesional: boolean
}

export const MIN_HABILIDADES = 3
export const MAX_HABILIDADES = 10

// ─────────────── Postulaciones (panel de la organización) ───────────────
export interface VoluntarioPostulante {
  nombre: string
  foto_perfil: string | null
  municipio: string | null
  disponibilidad: string
  experiencia: string | null
  descripcion: string | null
  idiomas: string | null
  profesion: string | null
  esta_verificado: boolean
  horas_acumuladas: number
  actividades_completadas: number
  xp_total: number
  habilidades: string[]
  habilidades_coinciden: string[]
  coincidencia: number
}

export interface Postulante {
  id: string
  estado: string
  mensaje_voluntario: string | null
  motivo_rechazo: string | null
  calificacion: number | null
  fecha_postulacion: string
  fecha_actualizacion: string | null
  publicacion_id: string
  voluntario_id: string
  voluntario: VoluntarioPostulante | null
}

export interface ResumenCupos {
  cupo_maximo: number
  aceptados: number
  disponibles: number
  pendientes: number
  lista_espera: number
}

export interface PostulantesPage {
  data: Postulante[]
  total: number
  page: number
  per_page: number
  pages: number
  resumen: ResumenCupos
}

export interface HistorialPostulacion {
  estado_anterior: string | null
  estado_nuevo: string
  rol_actor: string | null
  motivo: string | null
  fecha: string
}

// ─────────────── Actividades recurrentes ───────────────
export type UnidadIntervalo = 'DIAS' | 'SEMANAS' | 'MESES'

export interface ProgramacionCreate {
  unidad_intervalo: UnidadIntervalo
  intervalo: number
  fecha_inicio: string
  duracion_dias: number
  hora_inicio?: string
  hora_fin?: string
  cupo_maximo: number
  plantilla: Record<string, unknown>
}

export interface Programacion {
  id: string
  titulo: string
  unidad_intervalo: UnidadIntervalo
  intervalo: number
  fecha_inicio: string
  duracion_dias: number
  cupo_maximo: number
  estado: 'ACTIVA' | 'PAUSADA' | 'TERMINADA'
  total_generadas: number
  ciclo_generadas: number
  proxima_fecha: string
  fecha_pausa: string | null
  convocatorias: { id: string; fecha_inicio: string; fecha_fin: string; estado: string }[]
}

// ─────────────── Objetos y servicios ───────────────
export type TipoOfrecimiento = 'OBJETO' | 'SERVICIO'

export interface Ofrecimiento {
  id: string
  tipo: TipoOfrecimiento
  titulo: string
  descripcion: string
  categoria: string
  cantidad_total: number
  cantidad_disponible: number
  estado_producto: string | null
  modalidad_entrega: string | null
  municipio_id: number | null
  municipio: string | null
  fecha_vencimiento: string | null
  disponibilidad: string | null
  alcance: string | null
  condiciones: string | null
  imagenes: string[]
  estado: string
  fecha_creacion: string
  voluntario_nombre: string | null
  habilidades: { id: number; nombre: string }[]
  es_mio: boolean
  solicitudes_pendientes: number | null
}

export interface OfrecimientoCreate {
  tipo: TipoOfrecimiento
  titulo: string
  descripcion: string
  categoria: string
  cantidad_total?: number
  estado_producto?: string
  modalidad_entrega?: string
  municipio_id?: number
  fecha_vencimiento?: string
  disponibilidad?: string
  alcance?: string
  condiciones?: string
  habilidades?: number[]
}

export interface CategoriasOfrecimiento {
  objetos: string[]
  servicios: string[]
  estados_producto: string[]
  modalidades_entrega: string[]
  modalidades_servicio: string[]
}

export interface SolicitudInteres {
  id: string
  ofrecimiento_id: string
  ofrecimiento_titulo: string
  ofrecimiento_tipo: TipoOfrecimiento
  fundacion_id: string
  fundacion_nombre: string
  voluntario_nombre: string
  cantidad: number
  mensaje: string | null
  estado: string
  confirmada_voluntario: boolean
  confirmada_fundacion: boolean
  fecha_creacion: string
  fecha_actualizacion: string
  fecha_completada: string | null
  soy_voluntario: boolean
}

export interface MensajeInteres {
  id: string
  autor_rol: 'VOLUNTARIO' | 'FUNDACION'
  autor_nombre: string
  mensaje: string
  fecha_creacion: string
  es_mio: boolean
}

// ─────────────── Organización: perfil público, verificación y reseñas ───────────────
export interface EstadisticasOrganizacion {
  antiguedad_dias: number
  convocatorias_creadas: number
  individuales_realizadas: number
  individuales_canceladas: number
  recurrentes_realizadas: number
  recurrentes_canceladas: number
  voluntarios_participantes: number
  participaciones_confirmadas: number
}

export interface Resena {
  id: string
  voluntario_nombre: string
  calificacion: number
  comentario: string
  respuesta: string | null
  fecha_respuesta: string | null
  fecha_creacion: string
  estado: string
}

export interface OrganizacionPublica {
  id: string
  nombre: string
  tipo_organizacion: string
  constituida_legalmente: boolean
  logo: string | null
  descripcion: string
  historia: string | null
  mision: string | null
  municipio: string | null
  areas: { id: number; nombre: string }[]
  contacto: {
    telefono: string | null
    correo: string | null
    direccion: string | null
    pagina_web: string | null
  }
  galeria: { id: string; ruta: string; descripcion: string | null }[]
  estadisticas: EstadisticasOrganizacion
  verificacion: { verificada: boolean; fecha: string | null; aviso: string }
  resenas: { promedio: number | null; total: number }
  es_mia: boolean
  es_favorita: boolean
  puede_resenar: boolean
  mi_resena: Resena | null
}

export interface ResenasPage extends Paginated<Resena> {
  resumen: { promedio: number | null; total: number }
}

export interface DocumentoVerificacion {
  id: string
  tipo_documento: string
  nombre_original: string
  ruta_archivo: string
  validado: boolean
  fecha_subida: string
}

export interface VerificacionEstado {
  estado: string
  nota: string | null
  fecha: string | null
  documentos: DocumentoVerificacion[]
  aviso: string
}

export interface PerfilPublicoUpdate {
  historia?: string | null
  mision?: string | null
  areas?: number[]
  mostrar_telefono?: boolean
  mostrar_correo?: boolean
  mostrar_direccion?: boolean
  tipo_organizacion?: string
}

// ─────────────── Administración ───────────────
export interface AdminTicket {
  id: string
  numero: number
  categoria: string
  asunto: string
  descripcion: string
  estado: string
  usuario_id: string
  usuario_nombre: string
  usuario_email: string
  fecha_creacion: string
  fecha_actualizacion: string
  total_mensajes: number
}

export interface AdminTicketDetalle extends AdminTicket {
  mensajes: {
    id: string
    autor_id: string
    es_admin: boolean
    mensaje: string
    fecha_creacion: string
  }[]
}

export interface AdminSolicitud {
  id: string
  tipo: string
  motivo: string | null
  estado: string
  respuesta_admin: string | null
  usuario_id: string
  usuario_nombre: string
  usuario_email: string
  usuario_rol: string
  fecha_creacion: string
  fecha_atencion: string | null
}

export interface AdminVerificacion {
  fundacion_id: string
  nombre: string
  nit: string | null
  tipo_organizacion: string
  constituida_legalmente: boolean
  estado: string
  nota: string | null
  fecha: string | null
  documentos: DocumentoVerificacion[]
}

export interface AdminResena {
  id: string
  fundacion_id: string
  fundacion_nombre: string
  voluntario_nombre: string
  calificacion: number
  comentario: string
  estado: string
  motivo_moderacion: string | null
  fecha_creacion: string
}

export interface AdminAuditoria {
  id: string
  admin_nombre: string
  tipo: string
  objeto_tipo: string | null
  objeto_id: string | null
  objeto_descripcion: string | null
  detalle_anterior: Record<string, unknown> | null
  detalle_nuevo: Record<string, unknown> | null
  motivo: string | null
  fecha_accion: string
}

export interface PaginaAdmin<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  pages: number
}

export type { Convocatoria }
