/** Tipos del módulo ampliado de voluntario (gamificación, soporte, cuenta). */

export interface Interes {
  id: number
  nombre: string
}

export interface LogroEstado {
  id: number
  codigo: string
  nombre: string
  descripcion: string
  icono: string | null
  tipo: string
  umbral: number
  desbloqueado: boolean
  fecha_obtencion: string | null
}

export interface TransaccionXp {
  id: string
  puntos_total: number
  motivo: string
  fecha: string
}

export interface ResumenGamificacion {
  xp_total: number
  xp_saldo: number
  horas_acumuladas: number
  actividades_completadas: number
  logros_desbloqueados: number
  logros_totales: number
  nivel: number
  nivel_nombre: string
  xp_nivel_actual: number
  xp_siguiente_nivel: number | null
}

export interface RankingItem {
  posicion: number
  voluntario_id: string
  nombre: string
  foto_perfil: string | null
  xp: number
  nivel?: number
  nivel_nombre?: string
}

export interface RankingResponse {
  top: RankingItem[]
  mi_posicion: number
  mi_xp: number
  total_voluntarios: number
  en_top: boolean
}

// ─────────────── Soporte ───────────────

export type CategoriaTicket =
  | 'PROBLEMAS_ACCESO'
  | 'PROBLEMAS_CUENTA'
  | 'ERRORES_PLATAFORMA'
  | 'PROBLEMAS_POSTULACIONES'
  | 'PROBLEMAS_CONVOCATORIAS'
  | 'PROBLEMAS_NOTIFICACIONES'
  | 'PROTECCION_DATOS'
  | 'SOLICITUDES_ADMINISTRATIVAS'
  | 'OTROS'

export type EstadoTicket =
  | 'ABIERTO'
  | 'EN_REVISION'
  | 'PENDIENTE_INFORMACION'
  | 'RESUELTO'
  | 'CERRADO'

export interface Ticket {
  id: string
  numero: number
  categoria: CategoriaTicket
  asunto: string
  descripcion: string
  adjunto_url: string | null
  estado: EstadoTicket
  fecha_creacion: string
  fecha_actualizacion: string
}

export interface TicketMensaje {
  id: string
  autor_id: string
  es_admin: boolean
  mensaje: string
  adjunto_url: string | null
  fecha_creacion: string
}

export interface TicketDetalle extends Ticket {
  mensajes: TicketMensaje[]
}

export type TipoSolicitudCuenta =
  | 'BLOQUEO_TEMPORAL'
  | 'INHABILITACION'
  | 'ELIMINACION_CUENTA'
  | 'ELIMINACION_DATOS'
  | 'REPORTE_ACCESO_SOSPECHOSO'
  | 'REPORTE_ACTIVIDAD_NO_AUTORIZADA'

export interface SolicitudCuenta {
  id: string
  tipo: TipoSolicitudCuenta
  motivo: string | null
  estado: string
  respuesta_admin: string | null
  fecha_atencion: string | null
  fecha_creacion: string
}

// ─────────────── Cuenta ───────────────

export interface PreferenciasNotificacion {
  notif_postulaciones: boolean
  notif_convocatorias: boolean
  notif_recordatorios: boolean
  notif_logros: boolean
  notif_soporte: boolean
}

export interface ActividadHistorial {
  postulacion_id: string
  publicacion_id: string
  titulo: string
  fundacion_nombre: string | null
  estado: string
  fecha_inicio: string | null
  horas_reconocidas: number
  otorga_certificado: boolean
  calificacion: number | null
}

export interface Trayectoria {
  actividades_completadas: number
  horas_acumuladas: number
  xp_total: number
  fundaciones_colaboradas: number
  postulaciones_totales: number
  historial: ActividadHistorial[]
}

// Perfil voluntario ampliado
export interface PerfilVoluntarioExtendido {
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
