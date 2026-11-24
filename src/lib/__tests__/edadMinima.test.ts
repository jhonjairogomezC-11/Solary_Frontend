import { describe, expect, it } from 'vitest'

import { EDAD_MINIMA, edadDesde, fechaMaximaNacimiento } from '@/lib/validators'

describe('edad mínima de 16 años', () => {
  const hoy = new Date(2026, 10, 24) // 24 nov 2026

  it('la edad mínima es 16', () => {
    expect(EDAD_MINIMA).toBe(16)
  })

  it('calcula los años cumplidos', () => {
    expect(edadDesde('2010-11-24', hoy)).toBe(16)
    expect(edadDesde('2010-11-25', hoy)).toBe(15)
    expect(edadDesde('2009-06-01', hoy)).toBe(17)
  })

  it('el selector no permite fechas de menores de 16', () => {
    expect(fechaMaximaNacimiento(hoy)).toBe('2010-11-24')
  })
})
