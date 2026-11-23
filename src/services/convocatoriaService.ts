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
  PerfilFundacion,
  PerfilVoluntario,
  Postulacion,
} from '@/types/convocatoria'
import type { HistorialPostulacion, PostulantesPage } from '@/types/alineacion'

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

  /** Detalle de una convocatoria propia en cualquier estado (para editarla). */
  async miConvocatoria(id: string): Promise<Convocatoria> {
    const { data } = await api.get<Convocatoria>(`/mis-publicaciones/${id}`)
    return data
  },

  async subirImagen(id: string, file: File): Promise<Convocatoria> {
    const form = new FormData()
    form.append('archivo', file)
    const { data } = await api.post<Convocatoria>(`/publicaciones/${id}/imagenes`, form)
    return data
  },

  async eliminarImagen(id: string, imagenId: string): Promise<Convocatoria> {
    const { data } = await api.delete<Convocatoria>(`/publicaciones/${id}/imagenes/${imagenId}`)
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

  async retirar(postulacion_id: string, confirmar = false, motivo?: string): Promise<Postulacion> {
    const { data } = await api.post<Postulacion>(`/postulaciones/${postulacion_id}/retirar`, {
      confirmar,
      ...(motivo ? { motivo } : {}),
    })
    return data
  },

  async postulacionesDe(publicacion_id: string, page = 1): Promise<PostulantesPage> {
    const { data } = await api.get<PostulantesPage>(
      `/publicaciones/${publicacion_id}/postulaciones`,
      { params: { page, per_page: 50 } },
    )
    return data
  },

  async responder(
    postulacion_id: string,
    estado: 'ACEPTADO' | 'RECHAZADO' | 'EN_REVISION' | 'LISTA_ESPERA',
  ): Promise<Postulacion> {
    const { data } = await api.put<Postulacion>(`/postulaciones/${postulacion_id}/responder`, {
      estado,
    })
    return data
  },

  async confirmarAsistencia(
    postulacion_id: string,
    asistio: boolean,
    calificacion?: number,
    comentario_fundacion?: string,
  ): Promise<Postulacion> {
    const { data } = await api.post<Postulacion>(
      `/postulaciones/${postulacion_id}/confirmar-asistencia`,
      { asistio, calificacion, comentario_fundacion },
    )
    return data
  },

  async historial(postulacion_id: string): Promise<HistorialPostulacion[]> {
    const { data } = await api.get<HistorialPostulacion[]>(
      `/postulaciones/${postulacion_id}/historial`,
    )
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

  // ─── Perfil ───
  async estadoPerfil(): Promise<{ rol: string; perfil_completo: boolean }> {
    const { data } = await api.get<{ rol: string; perfil_completo: boolean }>('/perfil/estado')
    return data
  },

  async guardarPerfilVoluntario(payload: {
    tipo_documento: string
    numero_documento: string
    fecha_nacimiento: string
    genero: string
    municipio_id: number
    disponibilidad: string
    experiencia?: string
    direccion?: string
    descripcion?: string
    telefono_contacto?: string
    nivel_educativo?: string
    profesion?: string
    idiomas?: string
    preferencia_modalidad?: string
    contacto_emergencia_nombre?: string
    contacto_emergencia_telefono?: string
  }): Promise<unknown> {
    const { data } = await api.put('/perfil/voluntario', payload)
    return data
  },

  async guardarPerfilFundacion(payload: {
    nombre_fundacion: string
    tipo_organizacion?: string
    constituida_legalmente?: boolean
    nit?: string
    representante_legal: string
    correo_institucional?: string
    telefono_contacto: string
    direccion: string
    municipio_id: number
    descripcion: string
    documento_legal?: string
    pagina_web?: string
  }): Promise<unknown> {
    const { data } = await api.put('/perfil/fundacion', payload)
    return data
  },

  async miPerfilVoluntario(): Promise<PerfilVoluntario | null> {
    try {
      const { data } = await api.get<PerfilVoluntario>('/perfil/voluntario')
      return data
    } catch {
      return null
    }
  },

  async miPerfilFundacion(): Promise<PerfilFundacion | null> {
    try {
      const { data } = await api.get<PerfilFundacion>('/perfil/fundacion')
      return data
    } catch {
      return null
    }
  },

  async subirFotoVoluntario(file: File): Promise<string> {
    const form = new FormData()
    form.append('archivo', file)
    const { data } = await api.post<{ url: string }>('/perfil/voluntario/foto', form)
    return data.url
  },

  async subirDocumentoVoluntario(file: File): Promise<string> {
    const form = new FormData()
    form.append('archivo', file)
    const { data } = await api.post<{ url: string }>('/perfil/voluntario/documento', form)
    return data.url
  },

  async subirLogoFundacion(file: File): Promise<string> {
    const form = new FormData()
    form.append('archivo', file)
    const { data } = await api.post<{ url: string }>('/perfil/fundacion/logo', form)
    return data.url
  },

  // ─── Favoritos ───
  async favoritosIds(): Promise<string[]> {
    const { data } = await api.get<string[]>('/favoritos/ids')
    return data
  },

  async toggleFavorito(publicacion_id: string): Promise<boolean> {
    const { data } = await api.post<{ favorito: boolean }>(
      `/favoritos/convocatoria/${publicacion_id}`,
    )
    return data.favorito
  },

  async favoritosConvocatorias(): Promise<{ id: string; fecha_creacion: string; convocatoria: Convocatoria }[]> {
    const { data } = await api.get<
      { id: string; fecha_creacion: string; convocatoria: Convocatoria }[]
    >('/favoritos/convocatorias')
    return data
  },
}

