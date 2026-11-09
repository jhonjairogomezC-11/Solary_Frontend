import { api } from '@/lib/apiClient'
import type {
  AdminConvocatoria,
  AdminFundacion,
  AdminPostulacion,
  AdminUsuario,
  AdminVoluntario,
  DashboardStats,
  PaginatedAdmin,
} from '@/types/admin'

export interface UsuarioFiltros {
  rol?: string
  estado?: string
  buscar?: string
  page?: number
  per_page?: number
}

export interface FundacionFiltros {
  estado_verificacion?: string
  buscar?: string
  page?: number
  per_page?: number
}

export interface ConvocatoriaFiltros {
  estado?: string
  oculta?: boolean
  buscar?: string
  page?: number
  per_page?: number
}

export const adminService = {
  async dashboard(): Promise<DashboardStats> {
    const { data } = await api.get<DashboardStats>('/admin/dashboard')
    return data
  },

  // ─── Usuarios ───
  async usuarios(filtros: UsuarioFiltros = {}): Promise<PaginatedAdmin<AdminUsuario>> {
    const { data } = await api.get<PaginatedAdmin<AdminUsuario>>('/admin/usuarios', {
      params: filtros,
    })
    return data
  },

  async cambiarEstadoUsuario(
    id: string,
    estado: string,
    motivo?: string,
  ): Promise<AdminUsuario> {
    const { data } = await api.patch<AdminUsuario>(`/admin/usuarios/${id}/estado`, {
      estado,
      ...(motivo ? { motivo } : {}),
    })
    return data
  },

  async cambiarRolUsuario(id: string, rol: string): Promise<AdminUsuario> {
    const { data } = await api.patch<AdminUsuario>(`/admin/usuarios/${id}/rol`, { rol })
    return data
  },

  // ─── Fundaciones ───
  async fundaciones(filtros: FundacionFiltros = {}): Promise<PaginatedAdmin<AdminFundacion>> {
    const { data } = await api.get<PaginatedAdmin<AdminFundacion>>('/admin/fundaciones', {
      params: filtros,
    })
    return data
  },

  async fundacion(id: string): Promise<AdminFundacion> {
    const { data } = await api.get<AdminFundacion>(`/admin/fundaciones/${id}`)
    return data
  },

  async verificarFundacion(
    id: string,
    estado: string,
    motivo?: string,
  ): Promise<AdminFundacion> {
    const { data } = await api.patch<AdminFundacion>(`/admin/fundaciones/${id}/verificacion`, {
      estado,
      ...(motivo ? { motivo } : {}),
    })
    return data
  },

  // ─── Convocatorias ───
  async convocatorias(
    filtros: ConvocatoriaFiltros = {},
  ): Promise<PaginatedAdmin<AdminConvocatoria>> {
    const { data } = await api.get<PaginatedAdmin<AdminConvocatoria>>('/admin/convocatorias', {
      params: filtros,
    })
    return data
  },

  async moderarConvocatoria(
    id: string,
    ocultar: boolean,
    motivo?: string,
  ): Promise<AdminConvocatoria> {
    const { data } = await api.patch<AdminConvocatoria>(`/admin/convocatorias/${id}/moderacion`, {
      ocultar,
      ...(motivo ? { motivo } : {}),
    })
    return data
  },

  // ─── Postulaciones ───
  async postulaciones(
    page = 1,
    estado?: string,
  ): Promise<PaginatedAdmin<AdminPostulacion>> {
    const { data } = await api.get<PaginatedAdmin<AdminPostulacion>>('/admin/postulaciones', {
      params: { page, ...(estado ? { estado } : {}) },
    })
    return data
  },

  // ─── Voluntarios (verificación) ───
  async voluntarios(
    filtros: {
      verificado?: boolean
      con_documento?: boolean
      buscar?: string
      page?: number
      per_page?: number
    } = {},
  ): Promise<PaginatedAdmin<AdminVoluntario>> {
    const { data } = await api.get<PaginatedAdmin<AdminVoluntario>>('/admin/voluntarios', {
      params: filtros,
    })
    return data
  },

  async verificarVoluntario(id: string, verificado: boolean): Promise<AdminVoluntario> {
    const { data } = await api.patch<AdminVoluntario>(`/admin/voluntarios/${id}/verificacion`, {
      verificado,
    })
    return data
  },

  // ─── Catálogos ───
  async crearArea(nombre: string): Promise<unknown> {
    const { data } = await api.post('/admin/catalogos/areas-impacto', { nombre })
    return data
  },

  async crearHabilidad(nombre: string): Promise<unknown> {
    const { data } = await api.post('/admin/catalogos/habilidades', { nombre })
    return data
  },

  async crearDepartamento(nombre: string): Promise<unknown> {
    const { data } = await api.post('/admin/catalogos/departamentos', { nombre })
    return data
  },

  async crearMunicipio(nombre: string, departamento_id: number): Promise<unknown> {
    const { data } = await api.post('/admin/catalogos/municipios', {
      nombre,
      departamento_id,
    })
    return data
  },
}
