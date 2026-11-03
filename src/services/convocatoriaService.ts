import { api } from '@/lib/apiClient'
import type {
  AreaImpacto,
  Convocatoria,
  ConvocatoriaCreate,
  Departamento,
  Habilidad,
  Municipio,
  Notificacion,
  Paginated,
  Postulacion,
} from '@/types/convocatoria'

export interface ConvocatoriaFiltros {
  categoria_id?: number
  modalidad?: string
  municipio_id?: number
  buscar?: string
  page?: number
  per_page?: number
}

export const convocatoriaService = {
  // ─── Público ───
  async listar(filtros: ConvocatoriaFiltros = {}): Promise<Paginated<Convocatoria>> {
    const { data } = await api.get<Paginated<Convocatoria>>('/publicaciones', { params: filtros })
    return data
  },

  async detalle(id: string): Promise<Convocatoria> {
    const { data } = await api.get<Convocatoria>(`/publicaciones/${id}`)
    return data
  },

  // ─── Fundación ───
  async crear(payload: ConvocatoriaCreate): Promise<Convocatoria> {
    const { data } = await api.post<Convocatoria>('/publicaciones', payload)
    return data
  },

  async actualizar(id: string, payload: Partial<ConvocatoriaCreate>): Promise<Convocatoria> {
    const { data } = await api.put<Convocatoria>(`/publicaciones/${id}`, payload)
    return data
  },

  async publicar(id: string): Promise<Convocatoria> {
    const { data } = await api.post<Convocatoria>(`/publicaciones/${id}/publicar`)
    return data
  },

  async cancelar(id: string): Promise<Convocatoria> {
    const { data } = await api.post<Convocatoria>(`/publicaciones/${id}/cancelar`)
    return data
  },

  async misConvocatorias(page = 1, per_page = 15): Promise<Paginated<Convocatoria>> {
    const { data } = await api.get<Paginated<Convocatoria>>('/mis-publicaciones', {
      params: { page, per_page },
    })
    return data
  },

  // ─── Postulaciones ───
  async postular(publicacion_id: string, mensaje_voluntario?: string): Promise<Postulacion> {
    const { data } = await api.post<Postulacion>('/postulaciones', {
      publicacion_id,
      ...(mensaje_voluntario ? { mensaje_voluntario } : {}),
    })
    return data
  },

  async misPostulaciones(page = 1, per_page = 15): Promise<Paginated<Postulacion>> {
    const { data } = await api.get<Paginated<Postulacion>>('/mis-postulaciones', {
      params: { page, per_page },
    })
    return data
  },

  async retirar(postulacion_id: string): Promise<Postulacion> {
    const { data } = await api.post<Postulacion>(`/postulaciones/${postulacion_id}/retirar`)
    return data
  },

  async postulacionesDe(publicacion_id: string, page = 1): Promise<Paginated<Postulacion>> {
    const { data } = await api.get<Paginated<Postulacion>>(
      `/publicaciones/${publicacion_id}/postulaciones`,
      { params: { page } },
    )
    return data
  },

  async responder(
    postulacion_id: string,
    estado: 'ACEPTADO' | 'RECHAZADO',
    extra: { motivo_rechazo?: string; comentario_fundacion?: string } = {},
  ): Promise<Postulacion> {
    const { data } = await api.put<Postulacion>(`/postulaciones/${postulacion_id}/responder`, {
      estado,
      ...extra,
    })
    return data
  },

  // ─── Catálogos ───
  async departamentos(): Promise<Departamento[]> {
    const { data } = await api.get<Departamento[]>('/catalogos/departamentos')
    return data
  },

  async municipios(departamento_id?: number): Promise<Municipio[]> {
    const { data } = await api.get<Municipio[]>('/catalogos/municipios', {
      params: departamento_id ? { departamento_id } : {},
    })
    return data
  },

  async areasImpacto(): Promise<AreaImpacto[]> {
    const { data } = await api.get<AreaImpacto[]>('/catalogos/areas-impacto')
    return data
  },

  async habilidades(): Promise<Habilidad[]> {
    const { data } = await api.get<Habilidad[]>('/catalogos/habilidades')
    return data
  },

  // ─── Notificaciones ───
  async notificaciones(page = 1): Promise<Paginated<Notificacion>> {
    const { data } = await api.get<Paginated<Notificacion>>('/notificaciones', {
      params: { page },
    })
    return data
  },

  async noLeidas(): Promise<number> {
    const { data } = await api.get<{ total: number }>('/notificaciones/no-leidas')
    return data.total
  },

  async marcarLeida(id: string): Promise<void> {
    await api.put(`/notificaciones/${id}/marcar-leida`)
  },

  async marcarTodasLeidas(): Promise<void> {
    await api.post('/notificaciones/marcar-todas-leidas')
  },
}
