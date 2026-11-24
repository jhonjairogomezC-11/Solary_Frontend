import { afterEach, describe, expect, it, vi } from 'vitest'

import { cn, formatDate, formatTime, timeAgo } from '@/lib/utils'

describe('cn', () => {
  it('une clases y descarta valores falsy', () => {
    const oculto = false
    expect(cn('a', oculto, null, undefined, '', 'c')).toBe('a c')
  })

  it('acepta objetos y arrays (clsx)', () => {
    expect(cn(['a', { b: true, c: false }])).toBe('a b')
  })

  it('resuelve conflictos de Tailwind quedándose con la última clase', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    expect(cn('text-sm', 'text-base')).toBe('text-base')
  })
})

describe('formatDate', () => {
  it('devuelve un guion largo para valores vacíos', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate(undefined)).toBe('—')
    expect(formatDate('')).toBe('—')
  })

  it('formatea una fecha YYYY-MM-DD en español sin desfase de zona horaria', () => {
    const out = formatDate('2024-03-05')
    // Se interpreta como medianoche local: el día debe seguir siendo 5.
    expect(out).toMatch(/\b5\b/)
    expect(out).toMatch(/mar/i)
    expect(out).toContain('2024')
  })

  it('coincide con toLocaleDateString es-CO', () => {
    const expected = new Date('2024-12-31T00:00:00').toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    expect(formatDate('2024-12-31')).toBe(expected)
  })

  it('acepta datetimes ISO completos', () => {
    expect(formatDate('2025-07-20T15:30:00')).toContain('2025')
  })

  it('devuelve la entrada tal cual si no es una fecha válida', () => {
    expect(formatDate('no-es-fecha')).toBe('no-es-fecha')
  })
})

describe('formatTime', () => {
  it('recorta HH:MM:SS a HH:MM', () => {
    expect(formatTime('08:45:00')).toBe('08:45')
  })

  it('deja intacto HH:MM', () => {
    expect(formatTime('23:59')).toBe('23:59')
  })

  it('devuelve null para valores vacíos', () => {
    expect(formatTime(null)).toBeNull()
    expect(formatTime(undefined)).toBeNull()
    expect(formatTime('')).toBeNull()
  })
})

describe('timeAgo', () => {
  const now = new Date('2025-06-15T12:00:00Z')

  afterEach(() => {
    vi.useRealTimers()
  })

  const ago = (ms: number) => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
    return timeAgo(new Date(now.getTime() - ms).toISOString())
  }

  it('menos de un minuto', () => {
    expect(ago(30_000)).toBe('hace un momento')
  })

  it('minutos', () => {
    expect(ago(5 * 60_000)).toBe('hace 5 min')
  })

  it('horas', () => {
    expect(ago(3 * 3_600_000)).toBe('hace 3 h')
  })

  it('días', () => {
    expect(ago(2 * 86_400_000)).toBe('hace 2 d')
  })

  it('30 días o más muestra la fecha', () => {
    const iso = new Date(now.getTime() - 40 * 86_400_000).toISOString()
    vi.useFakeTimers()
    vi.setSystemTime(now)
    expect(timeAgo(iso)).toBe(new Date(iso).toLocaleDateString('es-CO'))
  })
})
