import axios from 'axios'

import { api } from '@/lib/apiClient'

export interface VerificacionCertificado {
  valido: boolean
  voluntario: string | null
  actividad: string | null
  organizacion: string | null
  horas: number | null
  fecha: string | null
}

/** Con responseType 'blob' los errores llegan como Blob; se convierten a JSON para parseApiError. */
async function errorLegible(err: unknown): Promise<unknown> {
  if (axios.isAxiosError(err) && err.response?.data instanceof Blob) {
    try {
      err.response.data = JSON.parse(await err.response.data.text())
    } catch {
      // Respuesta no JSON: se deja como está.
    }
  }
  return err
}

function nombreDesdeCabecera(disposition: unknown): string | null {
  if (typeof disposition !== 'string') return null
  const match = /filename="?([^";]+)"?/i.exec(disposition)
  return match?.[1] ?? null
}

function dispararDescarga(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const certificadoService = {
  /** Descarga el certificado PDF de una postulación con asistencia confirmada. */
  async descargar(postulacionId: string): Promise<void> {
    try {
      const res = await api.get<Blob>(`/postulaciones/${postulacionId}/certificado`, {
        responseType: 'blob',
        headers: { Accept: 'application/pdf' },
      })
      const nombre =
        nombreDesdeCabecera(res.headers['content-disposition']) ??
        `certificado-solari-${postulacionId.split('-')[0]}.pdf`
      dispararDescarga(res.data, nombre)
    } catch (err) {
      throw await errorLegible(err)
    }
  },

  /** Verificación pública de un certificado (no requiere sesión). */
  async verificar(postulacion: string, codigo: string): Promise<VerificacionCertificado> {
    const { data } = await api.get<VerificacionCertificado>('/certificados/verificar', {
      params: { postulacion, codigo },
    })
    return data
  },
}
