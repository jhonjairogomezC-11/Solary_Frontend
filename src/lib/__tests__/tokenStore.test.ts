import { beforeEach, describe, expect, it } from 'vitest'

import { tokenStore } from '@/lib/tokenStore'

describe('tokenStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('sin sesión devuelve null y has() es false', () => {
    expect(tokenStore.getAccess()).toBeNull()
    expect(tokenStore.getRefresh()).toBeNull()
    expect(tokenStore.has()).toBe(false)
  })

  it('set() guarda ambos tokens bajo las claves solari.*', () => {
    tokenStore.set('acc-123', 'ref-456')
    expect(localStorage.getItem('solari.access')).toBe('acc-123')
    expect(localStorage.getItem('solari.refresh')).toBe('ref-456')
    expect(tokenStore.getAccess()).toBe('acc-123')
    expect(tokenStore.getRefresh()).toBe('ref-456')
    expect(tokenStore.has()).toBe(true)
  })

  it('lee tokens escritos directamente en localStorage', () => {
    localStorage.setItem('solari.access', 'externo')
    expect(tokenStore.getAccess()).toBe('externo')
    expect(tokenStore.has()).toBe(true)
  })

  it('has() depende solo del access token', () => {
    localStorage.setItem('solari.refresh', 'solo-refresh')
    expect(tokenStore.has()).toBe(false)
  })

  it('clear() elimina solo las claves de sesión', () => {
    localStorage.setItem('otra.clave', 'x')
    tokenStore.set('a', 'r')
    tokenStore.clear()
    expect(localStorage.getItem('solari.access')).toBeNull()
    expect(localStorage.getItem('solari.refresh')).toBeNull()
    expect(localStorage.getItem('otra.clave')).toBe('x')
    expect(tokenStore.has()).toBe(false)
  })
})
