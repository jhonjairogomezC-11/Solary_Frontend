import { z } from 'zod'

/**
 * Validaciones espejo del backend Solari. La validación final SIEMPRE ocurre en
 * el servidor; esto es solo para UX (feedback inmediato).
 */

const password = z
  .string()
  .min(8, 'Mínimo 8 caracteres.')
  .regex(/[A-Z]/, 'Incluye al menos una mayúscula.')
  .regex(/[a-z]/, 'Incluye al menos una minúscula.')
  .regex(/\d/, 'Incluye al menos un número.')

const email = z.string().min(1, 'El correo es obligatorio.').email('Correo no válido.')

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'La contraseña es obligatoria.'),
})
export type LoginForm = z.infer<typeof loginSchema>

const baseRegister = {
  nombre: z.string().min(2, 'Ingresa tu nombre completo.').max(120),
  email,
  password,
  password_confirmation: z.string(),
  telefono: z
    .string()
    .regex(/^[0-9+\s-]{7,20}$/, 'Teléfono no válido.')
    .optional()
    .or(z.literal('')),
}

export const volunteerSchema = z
  .object({
    ...baseRegister,
    tipo_documento: z.enum(['CC', 'TI', 'CE', 'PASAPORTE']),
    numero_documento: z.string().min(4, 'Documento no válido.').max(30),
    fecha_nacimiento: z.string().min(1, 'Selecciona tu fecha de nacimiento.'),
    genero: z.enum(['MASCULINO', 'FEMENINO', 'OTRO']),
    municipio_id: z.coerce.number().int().positive('Selecciona un municipio.'),
    disponibilidad: z.enum(['ENTRE_SEMANA', 'FINES_DE_SEMANA', 'FLEXIBLE']),
    experiencia: z.string().max(500).optional().or(z.literal('')),
    acepta_terminos: z.literal(true, {
      message: 'Debes aceptar los términos y condiciones.',
    }),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Las contraseñas no coinciden.',
    path: ['password_confirmation'],
  })
export type VolunteerForm = z.infer<typeof volunteerSchema>

export const foundationSchema = z
  .object({
    ...baseRegister,
    nombre_fundacion: z.string().min(2, 'Nombre de la fundación requerido.').max(150),
    tipo_organizacion: z.string().min(1),
    constituida_legalmente: z.boolean(),
    nit: z.string().optional().or(z.literal('')),
    representante_legal: z.string().min(2, 'Nombre del representante requerido.').max(120),
    correo_institucional: z.string().email('Correo no válido.').optional().or(z.literal('')),
    telefono_contacto: z.string().regex(/^[0-9+\s-]{7,20}$/, 'Teléfono no válido.'),
    direccion: z.string().min(4, 'Dirección requerida.').max(200),
    municipio_id: z.coerce.number().int().positive('Selecciona un municipio.'),
    descripcion: z.string().min(10, 'Describe tu fundación (mín. 10 caracteres).').max(1000),
    documento_legal: z.string().max(255).optional().or(z.literal('')),
    pagina_web: z.string().url('URL no válida.').optional().or(z.literal('')),
    acepta_terminos: z.literal(true, {
      message: 'Debes aceptar los términos y condiciones.',
    }),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Las contraseñas no coinciden.',
    path: ['password_confirmation'],
  })
  .refine((d) => !d.constituida_legalmente || /^\d{7,10}-\d$/.test(d.nit ?? ''), {
    message: 'Formato de NIT: 000000000-0',
    path: ['nit'],
  })
  .refine((d) => !d.constituida_legalmente || (d.documento_legal ?? '').trim().length >= 3, {
    message: 'Referencia del documento legal requerida.',
    path: ['documento_legal'],
  })
export type FoundationForm = z.infer<typeof foundationSchema>

export const forgotSchema = z.object({ email })
export type ForgotForm = z.infer<typeof forgotSchema>

export const resetSchema = z
  .object({
    password,
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Las contraseñas no coinciden.',
    path: ['password_confirmation'],
  })
export type ResetForm = z.infer<typeof resetSchema>
