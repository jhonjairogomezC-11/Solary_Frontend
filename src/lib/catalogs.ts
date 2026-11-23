/**
 * Catálogos fijos para los formularios (valores de ENUM del backend).
 * Los municipios se cargan desde la API con el hook `useMunicipios`
 * (GET /catalogos/municipios).
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
