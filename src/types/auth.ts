import type { AceptacionLegal } from '@/lib/legal'

/** Tipos del dominio de autenticación, espejo del contrato del backend Solari. */

export type Rol = 'VOLUNTARIO' | 'FUNDACION' | 'ADMIN'
export type EstadoUsuario = 'ACTIVO' | 'BLOQUEADO' | 'SUSPENDIDO'

export type TipoDocumento = 'CC' | 'TI' | 'CE' | 'PASAPORTE'
export type Genero = 'MASCULINO' | 'FEMENINO' | 'OTRO'
export type Disponibilidad = 'ENTRE_SEMANA' | 'FINES_DE_SEMANA' | 'FLEXIBLE'

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: Rol
  estado: EstadoUsuario
  telefono: string | null
  email_verificado: boolean
}

export interface TokenResponse {
  usuario: Usuario
  token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

/** Respuesta de login cuando la cuenta tiene verificación en dos pasos activa. */
export interface MfaRequeridoResponse {
  mfa_requerido: true
  mfa_token: string
  expires_in: number
  message: string
}

export type LoginResult = TokenResponse | MfaRequeridoResponse

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterVolunteerPayload {
  nombre: string
  email: string
  password: string
  password_confirmation: string
  telefono?: string
  tipo_documento: TipoDocumento
  numero_documento: string
  fecha_nacimiento: string
  genero: Genero
  municipio_id: number
  disponibilidad: Disponibilidad
  experiencia?: string
  aceptaciones?: AceptacionLegal[]
}

export interface RegisterFoundationPayload {
  nombre: string
  email: string
  password: string
  password_confirmation: string
  telefono?: string
  nombre_fundacion: string
  tipo_organizacion?: string
  constituida_legalmente?: boolean
  nit?: string
  representante_legal: string
  correo_institucional?: string
  telefono_contacto: string
  direccion: string
  municipio_id: number
  descripcion: string
  documento_legal?: string
  pagina_web?: string
  aceptaciones?: AceptacionLegal[]
}
