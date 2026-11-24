export type BadgeTone = 'solar' | 'green' | 'red' | 'blue' | 'gray' | 'amber' | 'purple'

export function estadoPublicacionBadge(estado: string): { tone: BadgeTone; label: string } {
  const map: Record<string, { tone: BadgeTone; label: string }> = {
    BORRADOR: { tone: 'gray', label: 'Borrador' },
    PENDIENTE_APROBACION: { tone: 'amber', label: 'Pendiente' },
    PUBLICADA: { tone: 'green', label: 'Publicada' },
    CERRADA: { tone: 'gray', label: 'Cerrada' },
    CANCELADA: { tone: 'red', label: 'Cancelada' },
    COMPLETADA: { tone: 'blue', label: 'Completada' },
    FINALIZADA: { tone: 'blue', label: 'Finalizada' },
  }
  return map[estado] ?? { tone: 'gray', label: estado }
}

export function estadoPostulacionBadge(estado: string): { tone: BadgeTone; label: string } {
  const map: Record<string, { tone: BadgeTone; label: string }> = {
    PENDIENTE: { tone: 'amber', label: 'Pendiente' },
    ACEPTADO: { tone: 'green', label: 'Aceptada' },
    RECHAZADO: { tone: 'red', label: 'Rechazada' },
    EN_REVISION: { tone: 'purple', label: 'En revisión' },
    LISTA_ESPERA: { tone: 'amber', label: 'Lista de espera' },
    CANCELADO_FUNDACION: { tone: 'red', label: 'Cancelada por la organización' },
    RETIRADO: { tone: 'gray', label: 'Retirada' },
    ASISTIO: { tone: 'blue', label: 'Asistió' },
    NO_ASISTIO: { tone: 'red', label: 'No asistió' },
  }
  return map[estado] ?? { tone: 'gray', label: estado }
}

export function modalidadBadge(modalidad: string): { tone: BadgeTone; label: string } {
  const map: Record<string, { tone: BadgeTone; label: string }> = {
    PRESENCIAL: { tone: 'solar', label: 'Presencial' },
    VIRTUAL: { tone: 'purple', label: 'Virtual' },
    HIBRIDA: { tone: 'blue', label: 'Híbrida' },
  }
  return map[modalidad] ?? { tone: 'gray', label: modalidad }
}

