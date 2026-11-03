/**
 * Catálogos para los formularios. Los municipios deberían venir de un endpoint
 * del backend cuando el módulo de geografía esté disponible; por ahora usamos
 * una lista base cuyos IDs deben existir en la tabla `municipios`.
 * TODO(fase geografía): reemplazar por GET /api/v1/municipios.
 */

export const tipoDocumentoOptions = [
  { value: 'CC', label: 'Cédula de ciudadanía' },
  { value: 'TI', label: 'Tarjeta de identidad' },
  { value: 'CE', label: 'Cédula de extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
]

export const generoOptions = [
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'FEMENINO', label: 'Femenino' },
  { value: 'OTRO', label: 'Otro' },
]

export const disponibilidadOptions = [
  { value: 'ENTRE_SEMANA', label: 'Entre semana' },
  { value: 'FINES_DE_SEMANA', label: 'Fines de semana' },
  { value: 'FLEXIBLE', label: 'Horario flexible' },
]

export const municipioOptions = [
  { value: 1, label: 'Bogotá D.C.' },
  { value: 2, label: 'Medellín' },
  { value: 3, label: 'Cali' },
  { value: 4, label: 'Barranquilla' },
  { value: 5, label: 'Cartagena' },
  { value: 6, label: 'Bucaramanga' },
  { value: 7, label: 'Pereira' },
  { value: 8, label: 'Manizales' },
]
