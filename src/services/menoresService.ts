import axios from 'axios'

import { api } from '@/lib/apiClient'

export type EstadoAutorizacion = 'NO_REQUERIDA' | 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'
export type Parentesco = 'MADRE' | 'PADRE' | 'TUTOR_LEGAL' | 'OTRO'

export const PARENTESCOS: { value: Parentesco; label: string }[] = [
  { value: 'MADRE', label: 'Madre' },
  { value: 'PADRE', label: 'Padre' },
  { value: 'TUTOR_LEGAL', label: 'Tutor(a) o representante legal' },
  { value: 'OTRO', label: 'Otro representante legal' },
]

export interface AutorizacionAcudiente {
  es_menor: boolean
  edad: number
  requerida: boolean
  /** null = el menor aún no ha enviado la autorización. */
  estado: EstadoAutorizacion | null
  acudiente_nombre: string | null
  acudiente_documento: string | null
  acudiente_telefono: string | null
  acudiente_parentesco: Parentesco | null
  archivo: string | null
  fecha: string | null
  nota: string | null
}

export interface AcudienteInput {
  acudiente_nombre: string
  acudiente_documento: string
  acudiente_telefono: string
  acudiente_parentesco: Parentesco
}

export interface AdminAutorizacion {
  voluntario_id: string
  usuario_id: string
  nombre: string
  email: string
  edad: number
  fecha_nacimiento: string
  tipo_documento: string
  numero_documento: string
  acudiente_nombre: string | null
  acudiente_documento: string | null
  acudiente_telefono: string | null
  acudiente_parentesco: Parentesco | null
  archivo: string | null
  estado: EstadoAutorizacion | null
  fecha: string | null
  nota: string | null
}

export interface AdminAutorizacionesPage {
  data: AdminAutorizacion[]
  total: number
  page: number
  per_page: number
  pages: number
}

export type FiltroAutorizaciones = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'TODOS'

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

export const menoresService = {
  async estado(): Promise<AutorizacionAcudiente> {
    const { data } = await api.get<AutorizacionAcudiente>('/perfil/voluntario/autorizacion')
    return data
  },

  async guardarAcudiente(payload: AcudienteInput): Promise<AutorizacionAcudiente> {
    const { data } = await api.put<AutorizacionAcudiente>('/perfil/voluntario/acudiente', payload)
    return data
  },

  async subirAutorizacion(archivo: File): Promise<AutorizacionAcudiente> {
    const form = new FormData()
    form.append('archivo', archivo)
    const { data } = await api.post<AutorizacionAcudiente>('/perfil/voluntario/autorizacion', form)
    return data
  },

  /** Descarga el formato PDF para que el acudiente lo firme. */
  async descargarFormato(): Promise<void> {
    try {
      const res = await api.get<Blob>('/perfil/voluntario/autorizacion/formato', {
        responseType: 'blob',
        headers: { Accept: 'application/pdf' },
      })
      const url = URL.createObjectURL(res.data)
      const enlace = document.createElement('a')
      enlace.href = url
      enlace.download = 'autorizacion-acudiente-solari.pdf'
      document.body.appendChild(enlace)
      enlace.click()
      enlace.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err) {
      throw await errorLegible(err)
    }
  },

  // ── Administración ──

  async listarAdmin(params: {
    estado: FiltroAutorizaciones
    page: number
    per_page?: number
  }): Promise<AdminAutorizacionesPage> {
    const { data } = await api.get<AdminAutorizacionesPage>('/admin/autorizaciones', { params })
    return data
  },

  async resolver(
    voluntarioId: string,
    decision: 'APROBADA' | 'RECHAZADA',
    nota?: string,
  ): Promise<AutorizacionAcudiente> {
    const { data } = await api.post<AutorizacionAcudiente>(
      `/admin/autorizaciones/${voluntarioId}/resolver`,
      { decision, nota: nota || undefined },
    )
    return data
  },
}
