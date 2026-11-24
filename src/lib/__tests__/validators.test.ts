import { describe, expect, it } from 'vitest'
import type { z } from 'zod'

import {
  forgotSchema,
  foundationSchema,
  loginSchema,
  resetSchema,
  volunteerSchema,
} from '@/lib/validators'

/** Devuelve el primer mensaje de error asociado a un campo (o undefined). */
function errorAt(result: z.ZodSafeParseResult<unknown>, field: string): string | undefined {
  if (result.success) return undefined
  return result.error.issues.find((i) => i.path.join('.') === field)?.message
}

const PASSWORD = 'Segura123'

describe('loginSchema', () => {
  it('acepta credenciales válidas', () => {
    expect(loginSchema.safeParse({ email: 'ana@solari.co', password: 'x' }).success).toBe(true)
  })

  it('exige correo y contraseña', () => {
    const r = loginSchema.safeParse({ email: '', password: '' })
    expect(errorAt(r, 'email')).toBe('El correo es obligatorio.')
    expect(errorAt(r, 'password')).toBe('La contraseña es obligatoria.')
  })

  it('rechaza correos mal formados', () => {
    const r = loginSchema.safeParse({ email: 'ana@', password: 'x' })
    expect(errorAt(r, 'email')).toBe('Correo no válido.')
  })
})

describe('forgotSchema', () => {
  it('valida el correo', () => {
    expect(forgotSchema.safeParse({ email: 'ana@solari.co' }).success).toBe(true)
    expect(errorAt(forgotSchema.safeParse({ email: 'nope' }), 'email')).toBe('Correo no válido.')
  })
})

describe('resetSchema', () => {
  it('acepta contraseñas fuertes que coinciden', () => {
    const r = resetSchema.safeParse({ password: PASSWORD, password_confirmation: PASSWORD })
    expect(r.success).toBe(true)
  })

  it.each([
    ['Ab1', 'Mínimo 8 caracteres.'],
    ['minuscula1', 'Incluye al menos una mayúscula.'],
    ['MAYUSCULA1', 'Incluye al menos una minúscula.'],
    ['SinNumeros', 'Incluye al menos un número.'],
  ])('rechaza la contraseña débil %s', (pwd, msg) => {
    const r = resetSchema.safeParse({ password: pwd, password_confirmation: pwd })
    expect(errorAt(r, 'password')).toBe(msg)
  })

  it('marca la confirmación cuando no coincide', () => {
    const r = resetSchema.safeParse({ password: PASSWORD, password_confirmation: 'Otra1234' })
    expect(errorAt(r, 'password_confirmation')).toBe('Las contraseñas no coinciden.')
  })
})

const voluntarioValido = {
  primer_nombre: 'Ana',
  segundo_nombre: '',
  primer_apellido: 'Pérez',
  segundo_apellido: '',
  email: 'ana@solari.co',
  password: PASSWORD,
  password_confirmation: PASSWORD,
  telefono: '',
  tipo_documento: 'CC',
  numero_documento: '10203040',
  fecha_nacimiento: '2000-01-01',
  genero: 'FEMENINO',
  municipio_id: '5',
  disponibilidad: 'FLEXIBLE',
  experiencia: '',
  acepta_terminos: true,
}

describe('volunteerSchema', () => {
  it('acepta un registro válido y convierte municipio_id a número', () => {
    const r = volunteerSchema.safeParse(voluntarioValido)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.municipio_id).toBe(5)
  })

  it('acepta teléfono con formato válido', () => {
    const r = volunteerSchema.safeParse({ ...voluntarioValido, telefono: '+57 300-123-4567' })
    expect(r.success).toBe(true)
  })

  it('rechaza teléfono inválido', () => {
    const r = volunteerSchema.safeParse({ ...voluntarioValido, telefono: 'abc' })
    expect(errorAt(r, 'telefono')).toBe('Teléfono no válido.')
  })

  it('exige aceptar los términos', () => {
    const r = volunteerSchema.safeParse({ ...voluntarioValido, acepta_terminos: false })
    expect(errorAt(r, 'acepta_terminos')).toBe('Debes aceptar los términos y condiciones.')
  })

  it('exige seleccionar un municipio', () => {
    const r = volunteerSchema.safeParse({ ...voluntarioValido, municipio_id: '0' })
    expect(errorAt(r, 'municipio_id')).toBe('Selecciona un municipio.')
  })

  it('rechaza enums fuera de catálogo', () => {
    const r = volunteerSchema.safeParse({ ...voluntarioValido, tipo_documento: 'DNI' })
    expect(r.success).toBe(false)
    expect(errorAt(r, 'tipo_documento')).toBeDefined()
  })

  it('valida nombre y documento mínimos', () => {
    const r = volunteerSchema.safeParse({ ...voluntarioValido, primer_nombre: 'A', numero_documento: '12' })
    expect(errorAt(r, 'primer_nombre')).toBe('Ingresa tu primer nombre.')
    expect(errorAt(r, 'numero_documento')).toBe('Documento no válido.')
  })

  it('detecta contraseñas que no coinciden', () => {
    const r = volunteerSchema.safeParse({ ...voluntarioValido, password_confirmation: 'Otra1234' })
    expect(errorAt(r, 'password_confirmation')).toBe('Las contraseñas no coinciden.')
  })
})

const fundacionValida = {
  nombre: 'Carlos Ruiz',
  email: 'carlos@fundacion.org',
  password: PASSWORD,
  password_confirmation: PASSWORD,
  nombre_fundacion: 'Fundación Sol',
  tipo_organizacion: 'FUNDACION',
  constituida_legalmente: false,
  nit: '',
  representante_legal: 'Carlos Ruiz',
  correo_institucional: '',
  telefono_contacto: '6011234567',
  direccion: 'Calle 1 # 2-3',
  municipio_id: 1,
  descripcion: 'Trabajamos con comunidades rurales.',
  documento_legal: '',
  pagina_web: '',
  acepta_terminos: true,
}

describe('foundationSchema', () => {
  it('acepta una organización no constituida sin NIT ni documento', () => {
    expect(foundationSchema.safeParse(fundacionValida).success).toBe(true)
  })

  it('si está constituida exige NIT con formato 000000000-0', () => {
    const r = foundationSchema.safeParse({
      ...fundacionValida,
      constituida_legalmente: true,
      nit: '12345',
      documento_legal: 'Escritura 123',
    })
    expect(errorAt(r, 'nit')).toBe('Formato de NIT: 000000000-0')
  })

  it('si está constituida exige referencia del documento legal', () => {
    const r = foundationSchema.safeParse({
      ...fundacionValida,
      constituida_legalmente: true,
      nit: '900123456-7',
      documento_legal: '  ',
    })
    expect(errorAt(r, 'nit')).toBeUndefined()
    expect(errorAt(r, 'documento_legal')).toBe('Referencia del documento legal requerida.')
  })

  it('acepta una organización constituida con NIT y documento válidos', () => {
    const r = foundationSchema.safeParse({
      ...fundacionValida,
      constituida_legalmente: true,
      nit: '900123456-7',
      documento_legal: 'Cámara de comercio 2024',
    })
    expect(r.success).toBe(true)
  })

  it('valida URL y correo institucional opcionales', () => {
    const r = foundationSchema.safeParse({
      ...fundacionValida,
      pagina_web: 'no-es-url',
      correo_institucional: 'mal',
    })
    expect(errorAt(r, 'pagina_web')).toBe('URL no válida.')
    expect(errorAt(r, 'correo_institucional')).toBe('Correo no válido.')
  })

  it('exige descripción de al menos 10 caracteres y teléfono de contacto', () => {
    const r = foundationSchema.safeParse({
      ...fundacionValida,
      descripcion: 'Corta',
      telefono_contacto: '',
    })
    expect(errorAt(r, 'descripcion')).toBe('Describe tu fundación (mín. 10 caracteres).')
    expect(errorAt(r, 'telefono_contacto')).toBe('Teléfono no válido.')
  })
})
