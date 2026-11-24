import { api } from '@/lib/apiClient'
import type {
  AdminAuditoria,
  AdminResena,
  AdminSolicitud,
  AdminTicket,
  AdminTicketDetalle,
  AdminVerificacion,
  CategoriasOfrecimiento,
  HabilidadCat,
  MensajeInteres,
  Ofrecimiento,
  OfrecimientoCreate,
  OrganizacionPublica,
  PaginaAdmin,
  PerfilPublicoUpdate,
  Programacion,
  ProgramacionCreate,
  Resena,
  ResenasPage,
  SolicitudInteres,
  VerificacionEstado,
} from '@/types/alineacion'

export const habilidadService = {
  async catalogo(): Promise<HabilidadCat[]> {
    const { data } = await api.get<HabilidadCat[]>('/catalogos/habilidades')
    return data
  },
  async mias(): Promise<number[]> {
    const { data } = await api.get<number[]>('/mis-habilidades')
    return data
  },
  async guardarMias(ids: number[]): Promise<number[]> {
    const { data } = await api.put<number[]>('/mis-habilidades', { habilidad_ids: ids })
    return data
  },
}

export const programacionService = {
  async crear(payload: ProgramacionCreate): Promise<Programacion> {
    const { data } = await api.post<Programacion>('/programaciones', payload)
    return data
  },
  async mias(): Promise<Programacion[]> {
    const { data } = await api.get<Programacion[]>('/mis-programaciones')
    return data
  },
  async autorizar(id: string): Promise<Programacion> {
    const { data } = await api.post<Programacion>(`/programaciones/${id}/autorizar`)
    return data
  },
  async finalizar(id: string): Promise<Programacion> {
    const { data } = await api.post<Programacion>(`/programaciones/${id}/finalizar`)
    return data
  },
  /** Agrega una foto que se copia a cada convocatoria generada (máx. 8). */
  async subirImagen(id: string, file: File): Promise<Programacion> {
    const form = new FormData()
    form.append('archivo', file)
    const { data } = await api.post<Programacion>(`/programaciones/${id}/imagenes`, form)
    return data
  },
  async eliminarImagen(id: string, ruta: string): Promise<Programacion> {
    const { data } = await api.delete<Programacion>(`/programaciones/${id}/imagenes`, {
      params: { ruta },
    })
    return data
  },
}

export const ofrecimientoService = {
  async categorias(): Promise<CategoriasOfrecimiento> {
    const { data } = await api.get<CategoriasOfrecimiento>('/ofrecimientos/categorias')
    return data
  },
  async listar(params: {
    tipo?: string
    categoria?: string
    buscar?: string
    page?: number
  }): Promise<{ data: Ofrecimiento[]; total: number; pages: number }> {
    const { data } = await api.get('/ofrecimientos', { params })
    return data
  },
  async mios(): Promise<Ofrecimiento[]> {
    const { data } = await api.get<Ofrecimiento[]>('/mis-ofrecimientos')
    return data
  },
  async crear(payload: OfrecimientoCreate): Promise<Ofrecimiento> {
    const { data } = await api.post<Ofrecimiento>('/ofrecimientos', payload)
    return data
  },
  async cambiarEstado(id: string, accion: 'pausar' | 'reanudar' | 'finalizar'): Promise<Ofrecimiento> {
    const { data } = await api.post<Ofrecimiento>(`/ofrecimientos/${id}/${accion}`)
    return data
  },
  async subirImagen(id: string, file: File): Promise<Ofrecimiento> {
    const form = new FormData()
    form.append('archivo', file)
    const { data } = await api.post<Ofrecimiento>(`/ofrecimientos/${id}/imagenes`, form)
    return data
  },
  async meInteresa(id: string, cantidad: number, mensaje?: string): Promise<SolicitudInteres> {
    const { data } = await api.post<SolicitudInteres>(`/ofrecimientos/${id}/me-interesa`, {
      cantidad,
      ...(mensaje ? { mensaje } : {}),
    })
    return data
  },
  async solicitudes(): Promise<SolicitudInteres[]> {
    const { data } = await api.get<SolicitudInteres[]>('/solicitudes-interes')
    return data
  },
  async responder(id: string, decision: 'ACEPTAR' | 'RECHAZAR'): Promise<SolicitudInteres> {
    const { data } = await api.put<SolicitudInteres>(`/solicitudes-interes/${id}/responder`, {
      decision,
    })
    return data
  },
  async confirmar(id: string): Promise<SolicitudInteres> {
    const { data } = await api.post<SolicitudInteres>(`/solicitudes-interes/${id}/confirmar`)
    return data
  },
  async cancelar(id: string): Promise<SolicitudInteres> {
    const { data } = await api.post<SolicitudInteres>(`/solicitudes-interes/${id}/cancelar`)
    return data
  },
  async mensajes(id: string): Promise<MensajeInteres[]> {
    const { data } = await api.get<MensajeInteres[]>(`/solicitudes-interes/${id}/mensajes`)
    return data
  },
  async enviarMensaje(id: string, mensaje: string): Promise<MensajeInteres[]> {
    const { data } = await api.post<MensajeInteres[]>(`/solicitudes-interes/${id}/mensajes`, {
      mensaje,
    })
    return data
  },
}

export const organizacionService = {
  async perfil(id: string): Promise<OrganizacionPublica> {
    const { data } = await api.get<OrganizacionPublica>(`/organizaciones/${id}`)
    return data
  },
  async resenas(id: string, page = 1): Promise<ResenasPage> {
    const { data } = await api.get<ResenasPage>(`/organizaciones/${id}/resenas`, {
      params: { page },
    })
    return data
  },
  async resenar(id: string, calificacion: number, comentario: string): Promise<Resena> {
    const { data } = await api.post<Resena>(`/organizaciones/${id}/resenas`, {
      calificacion,
      comentario,
    })
    return data
  },
  async responderResena(resenaId: string, respuesta: string): Promise<Resena> {
    const { data } = await api.put<Resena>(`/resenas/${resenaId}/respuesta`, { respuesta })
    return data
  },
  async actualizarPublico(payload: PerfilPublicoUpdate): Promise<OrganizacionPublica> {
    const { data } = await api.put<OrganizacionPublica>('/perfil/fundacion/publico', payload)
    return data
  },
  async subirGaleria(
    file: File,
    opts: { descripcion?: string; contiene_menores: boolean; autorizacion_imagen: boolean },
  ): Promise<void> {
    const form = new FormData()
    form.append('archivo', file)
    if (opts.descripcion) form.append('descripcion', opts.descripcion)
    form.append('contiene_menores', String(opts.contiene_menores))
    form.append('autorizacion_imagen', String(opts.autorizacion_imagen))
    await api.post('/perfil/fundacion/galeria', form)
  },
  async eliminarGaleria(id: string): Promise<void> {
    await api.delete(`/perfil/fundacion/galeria/${id}`)
  },
  async verificacion(): Promise<VerificacionEstado> {
    const { data } = await api.get<VerificacionEstado>('/perfil/fundacion/verificacion')
    return data
  },
  async subirDocumento(tipo: string, file: File): Promise<VerificacionEstado> {
    const form = new FormData()
    form.append('tipo_documento', tipo)
    form.append('archivo', file)
    const { data } = await api.post<VerificacionEstado>('/perfil/fundacion/documentos', form)
    return data
  },
  async eliminarDocumento(id: string): Promise<VerificacionEstado> {
    const { data } = await api.delete<VerificacionEstado>(`/perfil/fundacion/documentos/${id}`)
    return data
  },
  async solicitarVerificacion(): Promise<VerificacionEstado> {
    const { data } = await api.post<VerificacionEstado>('/perfil/fundacion/verificacion/solicitar')
    return data
  },
}

export const adminGestionService = {
  async tickets(page = 1, estado?: string): Promise<PaginaAdmin<AdminTicket>> {
    const { data } = await api.get('/admin/soporte/tickets', { params: { page, estado } })
    return data
  },
  async ticket(id: string): Promise<AdminTicketDetalle> {
    const { data } = await api.get<AdminTicketDetalle>(`/admin/soporte/tickets/${id}`)
    return data
  },
  async responderTicket(id: string, mensaje: string, estado?: string): Promise<AdminTicketDetalle> {
    const { data } = await api.post<AdminTicketDetalle>(`/admin/soporte/tickets/${id}/responder`, {
      mensaje,
      ...(estado ? { estado } : {}),
    })
    return data
  },
  async solicitudes(page = 1): Promise<PaginaAdmin<AdminSolicitud>> {
    const { data } = await api.get('/admin/solicitudes-cuenta', { params: { page } })
    return data
  },
  async resolverSolicitud(
    id: string,
    decision: 'EN_PROCESO' | 'APROBAR' | 'RECHAZAR',
    respuesta?: string,
    ejecutar = false,
  ): Promise<AdminSolicitud> {
    const { data } = await api.put<AdminSolicitud>(`/admin/solicitudes-cuenta/${id}`, {
      decision,
      respuesta,
      ejecutar,
    })
    return data
  },
  async verificaciones(page = 1): Promise<PaginaAdmin<AdminVerificacion>> {
    const { data } = await api.get('/admin/verificaciones', { params: { page } })
    return data
  },
  async resolverVerificacion(
    fundacionId: string,
    accion: string,
    nota?: string,
  ): Promise<AdminVerificacion> {
    const { data } = await api.put<AdminVerificacion>(`/admin/verificaciones/${fundacionId}`, {
      accion,
      nota,
    })
    return data
  },
  async resenas(page = 1): Promise<PaginaAdmin<AdminResena>> {
    const { data } = await api.get('/admin/resenas', { params: { page } })
    return data
  },
  async moderarResena(id: string, accion: string, motivo?: string): Promise<void> {
    await api.put(`/admin/resenas/${id}`, { accion, motivo })
  },
  async auditoria(page = 1): Promise<PaginaAdmin<AdminAuditoria>> {
    const { data } = await api.get('/admin/auditoria', { params: { page } })
    return data
  },
}
