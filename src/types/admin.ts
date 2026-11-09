export interface SeriePunto {
  fecha: string
  total: number
}

export interface ConteoEstado {
  estado: string
  total: number
}

export interface DashboardStats {
  total_usuarios: number
  total_voluntarios: number
  total_fundaciones: number
  total_admins: number
  usuarios_activos: number
  usuarios_bloqueados: number
  usuarios_suspendidos: number
  nuevos_usuarios_30d: number
  fundaciones_pendientes: number
  fundaciones_aprobadas: number
  fundaciones_rechazadas: number
  total_convocatorias: number
  convocatorias_publicadas: number
  convocatorias_borrador: number
  convocatorias_ocultas: number
  total_postulaciones: number
  postulaciones_pendientes: number
  postulaciones_aceptadas: number
  registros_por_dia: SeriePunto[]
  convocatorias_por_estado: ConteoEstado[]
  postulaciones_por_estado: ConteoEstado[]
}

export interface AdminUsuario {
  id: string
  nombre: string
  email: string
  rol: string
  estado: string
  provider: string
  telefono: string | null
  email_verificado: boolean
  fecha_registro: string
  tiene_perfil: boolean
  perfil_id: string | null
  estado_verificacion_fundacion: string | null
}

export interface AdminFundacion {
  id: string
  usuario_id: string
  nombre: string
  nit: string
  representante_legal: string
  correo_institucional: string | null
  telefono: string
  direccion: string
  municipio_id: number
  pagina_web: string | null
  descripcion: string
  documento_legal: string
  logo: string | null
  estado_verificacion: string
  fecha_verificacion: string | null
  motivo_rechazo: string | null
  fecha_creacion: string
}

export interface AdminConvocatoria {
  id: string
  titulo: string
  estado: string
  modalidad: string
  fecha_inicio: string
  fecha_fin: string
  cupo_maximo: number
  oculta_por_admin: boolean
  motivo_ocultamiento: string | null
  fecha_creacion: string
  fundacion_id: string
  fundacion_nombre: string | null
  categoria_id: number
  total_postulaciones: number
}

export interface AdminPostulacion {
  id: string
  estado: string
  fecha_postulacion: string
  publicacion_id: string
  publicacion_titulo: string | null
  voluntario_id: string
  voluntario_nombre: string | null
}

export interface PaginatedAdmin<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  pages: number
}
