import { api } from '@/lib/apiClient'
import type { Convocatoria } from '@/types/convocatoria'
import type {
  Interes,
  LogroEstado,
  PreferenciasNotificacion,
  RankingResponse,
  ResumenGamificacion,
  SolicitudCuenta,
  Ticket,
  TicketDetalle,
  TipoSolicitudCuenta,
  TransaccionXp,
  Trayectoria,
} from '@/types/voluntario'

export const voluntarioService = {
  // ─── Gamificación ───
  async resumen(): Promise<ResumenGamificacion> {
    const { data } = await api.get<ResumenGamificacion>('/gamificacion/resumen')
    return data
  },

  async logros(): Promise<LogroEstado[]> {
    const { data } = await api.get<LogroEstado[]>('/gamificacion/logros')
    return data
  },

  async historialXp(): Promise<TransaccionXp[]> {
    const { data } = await api.get<TransaccionXp[]>('/gamificacion/xp/historial')
    return data
  },

  async ranking(): Promise<RankingResponse> {
    const { data } = await api.get<RankingResponse>('/ranking')
    return data
  },

  // ─── Intereses ───
  async catalogoIntereses(): Promise<Interes[]> {
    const { data } = await api.get<Interes[]>('/intereses')
    return data
  },

  async misIntereses(): Promise<number[]> {
    const { data } = await api.get<number[]>('/mis-intereses')
    return data
  },

  async guardarIntereses(interes_ids: number[]): Promise<number[]> {
    const { data } = await api.put<number[]>('/mis-intereses', { interes_ids })
    return data
  },

  // ─── Trayectoria y recomendaciones ───
  async trayectoria(): Promise<Trayectoria> {
    const { data } = await api.get<Trayectoria>('/voluntario/trayectoria')
    return data
  },

  async recomendaciones(): Promise<Convocatoria[]> {
    const { data } = await api.get<Convocatoria[]>('/voluntario/recomendaciones')
    return data
  },

  // ─── Preferencias de notificación ───
  async preferencias(): Promise<PreferenciasNotificacion> {
    const { data } = await api.get<PreferenciasNotificacion>(
      '/cuenta/preferencias-notificacion',
    )
    return data
  },

  async guardarPreferencias(
    payload: PreferenciasNotificacion,
  ): Promise<PreferenciasNotificacion> {
    const { data } = await api.put<PreferenciasNotificacion>(
      '/cuenta/preferencias-notificacion',
      payload,
    )
    return data
  },

  // ─── Soporte ───
  async misTickets(): Promise<Ticket[]> {
    const { data } = await api.get<Ticket[]>('/soporte/tickets')
    return data
  },

  async crearTicket(payload: {
    categoria: string
    asunto: string
    descripcion: string
    adjunto_url?: string
  }): Promise<Ticket> {
    const { data } = await api.post<Ticket>('/soporte/tickets', payload)
    return data
  },

  async detalleTicket(id: string): Promise<TicketDetalle> {
    const { data } = await api.get<TicketDetalle>(`/soporte/tickets/${id}`)
    return data
  },

  async responderTicket(id: string, mensaje: string): Promise<Ticket> {
    const { data } = await api.post<Ticket>(`/soporte/tickets/${id}/responder`, { mensaje })
    return data
  },

  async cerrarTicket(id: string): Promise<Ticket> {
    const { data } = await api.post<Ticket>(`/soporte/tickets/${id}/cerrar`)
    return data
  },

  async misSolicitudes(): Promise<SolicitudCuenta[]> {
    const { data } = await api.get<SolicitudCuenta[]>('/soporte/solicitudes-cuenta')
    return data
  },

  async crearSolicitud(tipo: TipoSolicitudCuenta, motivo?: string): Promise<SolicitudCuenta> {
    const { data } = await api.post<SolicitudCuenta>('/soporte/solicitudes-cuenta', {
      tipo,
      ...(motivo ? { motivo } : {}),
    })
    return data
  },

  // ─── Favoritos de fundación ───
  async favoritosFundaciones(): Promise<
    {
      id: string
      fecha_creacion: string
      fundacion: {
        id: string
        nombre: string
        logo: string | null
        descripcion: string | null
        municipio_id: number | null
        estado_verificacion: string | null
      }
    }[]
  > {
    const { data } = await api.get('/favoritos/fundaciones')
    return data
  },

  async toggleFavoritoFundacion(fundacion_id: string): Promise<boolean> {
    const { data } = await api.post<{ favorito: boolean }>(
      `/favoritos/fundacion/${fundacion_id}`,
    )
    return data.favorito
  },
}
