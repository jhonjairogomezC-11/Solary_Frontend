import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const { municipiosMock } = vi.hoisted(() => ({ municipiosMock: vi.fn() }))

vi.mock('@/services/convocatoriaService', () => ({
  convocatoriaService: { municipios: municipiosMock },
}))

import { useMunicipios } from '@/hooks/useMunicipios'

/*
 * useMunicipios guarda el catálogo en una caché a nivel de módulo que no se puede
 * reiniciar desde fuera. Por eso estas pruebas se ejecutan en orden: primero el
 * fallo (que no llena la caché), luego la carga exitosa y por último la lectura
 * desde caché.
 */
describe('useMunicipios', () => {
  it('expone error y deja de cargar si la petición falla', async () => {
    municipiosMock.mockRejectedValueOnce(new Error('500'))

    const { result } = renderHook(() => useMunicipios())
    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe(true)
    expect(result.current.options).toEqual([])
    expect(municipiosMock).toHaveBeenCalledTimes(1)
  })

  it('tras un fallo permite reintentar y mapea municipios a opciones', async () => {
    municipiosMock.mockReset()
    municipiosMock.mockResolvedValueOnce([
      { id: 1, nombre: 'Bogotá' },
      { id: 2, nombre: 'Medellín', departamento: { id: 5, nombre: 'Antioquia' } },
    ])

    // Dos montajes simultáneos comparten una sola petición en curso.
    const a = renderHook(() => useMunicipios())
    const b = renderHook(() => useMunicipios())

    await waitFor(() => expect(a.result.current.loading).toBe(false))
    await waitFor(() => expect(b.result.current.loading).toBe(false))

    const expected = [
      { value: 1, label: 'Bogotá' },
      { value: 2, label: 'Medellín' },
    ]
    expect(a.result.current.options).toEqual(expected)
    expect(b.result.current.options).toEqual(expected)
    expect(a.result.current.error).toBe(false)
    expect(municipiosMock).toHaveBeenCalledTimes(1)
  })

  it('un montaje posterior usa la caché sin volver a pedir', () => {
    municipiosMock.mockReset()

    const { result } = renderHook(() => useMunicipios())

    // Sincrónico: los datos están disponibles desde el primer render.
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(false)
    expect(result.current.options).toHaveLength(2)
    expect(municipiosMock).not.toHaveBeenCalled()
  })
})
