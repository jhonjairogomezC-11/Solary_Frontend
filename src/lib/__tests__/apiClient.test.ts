import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'
import { describe, expect, it } from 'vitest'

import { parseApiError } from '@/lib/apiClient'

const GENERIC = 'Ocurrió un error inesperado. Inténtalo de nuevo.'
const NETWORK = 'No se pudo conectar con el servidor. Verifica que Solari esté en línea.'

function axiosErrorWith(status: number, data: unknown, code = 'ERR_BAD_REQUEST') {
  const response = {
    status,
    statusText: '',
    data,
    headers: {},
    config: { headers: new AxiosHeaders() },
  } as AxiosResponse
  return new AxiosError('Request failed', code, undefined, undefined, response)
}

describe('parseApiError', () => {
  it('devuelve el cuerpo de la API cuando trae message', () => {
    const err = axiosErrorWith(400, { message: 'Credenciales inválidas.' })
    expect(parseApiError(err)).toEqual({ message: 'Credenciales inválidas.' })
  })

  it('conserva los errores de validación por campo', () => {
    const body = {
      message: 'Datos inválidos.',
      errors: { email: ['El correo ya está registrado.'] },
    }
    expect(parseApiError(axiosErrorWith(422, body))).toEqual(body)
  })

  it('error de red sin respuesta → mensaje de conexión', () => {
    const err = new AxiosError('Network Error', 'ERR_NETWORK')
    expect(parseApiError(err)).toEqual({ message: NETWORK })
  })

  it('respuesta sin message → mensaje genérico', () => {
    expect(parseApiError(axiosErrorWith(500, { detail: 'boom' }))).toEqual({ message: GENERIC })
  })

  it('respuesta con cuerpo no JSON → mensaje genérico', () => {
    expect(parseApiError(axiosErrorWith(502, '<html>Bad Gateway</html>'))).toEqual({
      message: GENERIC,
    })
  })

  it('timeout de axios (sin respuesta) → mensaje genérico', () => {
    const err = new AxiosError('timeout of 20000ms exceeded', 'ECONNABORTED')
    expect(parseApiError(err)).toEqual({ message: GENERIC })
  })

  it('errores que no son de axios → mensaje genérico', () => {
    expect(parseApiError(new Error('fallo'))).toEqual({ message: GENERIC })
    expect(parseApiError('texto')).toEqual({ message: GENERIC })
    expect(parseApiError(null)).toEqual({ message: GENERIC })
    expect(parseApiError(undefined)).toEqual({ message: GENERIC })
  })

  it('un objeto plano con message no se toma como error de API', () => {
    expect(parseApiError({ message: 'no soy axios' })).toEqual({ message: GENERIC })
  })
})
