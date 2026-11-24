import type { FieldErrors, FieldValues } from 'react-hook-form'

const ETIQUETAS: Record<string, string> = {
  primer_nombre: 'Primer nombre',
  segundo_nombre: 'Segundo nombre',
  primer_apellido: 'Primer apellido',
  segundo_apellido: 'Segundo apellido',
  nombre: 'Nombre',
  email: 'Correo electrónico',
  password: 'Contraseña',
  password_confirmation: 'Confirmar contraseña',
  telefono: 'Teléfono',
  tipo_documento: 'Tipo de documento',
  numero_documento: 'Número de documento',
  fecha_nacimiento: 'Fecha de nacimiento',
  genero: 'Género',
  municipio_id: 'Municipio',
  disponibilidad: 'Disponibilidad',
  acepta_terminos: 'Términos y condiciones',
  nombre_fundacion: 'Nombre de la fundación',
  tipo_organizacion: 'Tipo de organización',
  nit: 'NIT',
  representante_legal: 'Representante legal',
  correo_institucional: 'Correo institucional',
  telefono_contacto: 'Teléfono de contacto',
  direccion: 'Dirección',
  descripcion: 'Descripción',
  documento_legal: 'Documento legal',
  pagina_web: 'Página web',
}

/** Convierte los errores de react-hook-form en un mensaje legible, una línea por campo. */
export function resumenErrores<T extends FieldValues>(errors: FieldErrors<T>): string {
  const lineas = Object.entries(errors)
    .map(([campo, err]) => {
      const msg = (err as { message?: string } | undefined)?.message
      return msg ? `• ${ETIQUETAS[campo] ?? campo}: ${msg}` : null
    })
    .filter((l): l is string => l !== null)
  return ['Revisa estos datos para continuar:', ...lineas].join('\n')
}
