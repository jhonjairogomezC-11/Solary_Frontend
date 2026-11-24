/** Códigos de los documentos legales (iguales a app/models/legal.py del backend). */
export const DOC_TERMINOS = 'TERMINOS_CONDICIONES'
export const DOC_PRIVACIDAD = 'POLITICA_DATOS_PERSONALES'

export interface AceptacionLegal {
  codigo: string
  aceptado: boolean
}

/** Aceptaciones que se envían al registrarse. El backend fija la versión vigente y la fecha. */
export const ACEPTACIONES_REGISTRO: AceptacionLegal[] = [
  { codigo: DOC_TERMINOS, aceptado: true },
  { codigo: DOC_PRIVACIDAD, aceptado: true },
]

export interface DocumentoLegal {
  codigo: string
  nombre: string
  descripcion: string | null
  requerido_registro: boolean
  version: string
  version_id: number
  url_publica: string | null
  contenido: string | null
  fecha_publicacion: string
}

/** Convierte un título en un id para el índice ("## 4. Datos que…" -> "4-datos-que"). */
export function slug(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
