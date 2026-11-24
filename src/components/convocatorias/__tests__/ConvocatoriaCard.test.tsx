import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Convocatoria } from '@/types/convocatoria'

// FavoritoButton depende de FavoritosProvider (y este de AuthContext); se
// sustituye el hook para aislar la tarjeta.
const { favoritosMock } = vi.hoisted(() => ({
  favoritosMock: {
    esVoluntario: false,
    esFavorito: (id: string) => id === 'fav',
    toggle: () => Promise.resolve(),
  },
}))

vi.mock('@/hooks/useFavoritos', () => ({
  useFavoritos: () => favoritosMock,
}))

import { ConvocatoriaCard } from '@/components/convocatorias/ConvocatoriaCard'

function makeConvocatoria(overrides: Partial<Convocatoria> = {}): Convocatoria {
  return {
    id: 'conv-1',
    titulo: 'Jornada de reforestación',
    descripcion: 'Siembra de árboles nativos en la ribera del río.',
    modalidad: 'PRESENCIAL',
    estado: 'PUBLICADA',
    fecha_inicio: '2025-08-10',
    fecha_fin: '2025-08-10',
    hora_inicio: null,
    hora_fin: null,
    cupo_maximo: 20,
    edad_minima: null,
    edad_maxima: null,
    requisitos_adicionales: null,
    direccion_exacta: 'Parque Central',
    enlace_virtual: null,
    imagen: null,
    contacto_nombre: null,
    contacto_email: null,
    contacto_telefono: null,
    objetivo: null,
    impacto_esperado: null,
    actividades_voluntario: null,
    perfil_beneficiarios: null,
    que_llevar: null,
    recomendaciones: null,
    incluye_transporte: false,
    incluye_alimentacion: false,
    incluye_seguro: false,
    politica_cancelacion: null,
    otorga_certificado: true,
    horas_reconocidas: 4,
    nivel_experiencia: null,
    fecha_limite_postulacion: null,
    dificultad: 'BAJA',
    urgente: false,
    fecha_publicacion: null,
    fecha_creacion: '2025-07-01T10:00:00',
    fundacion_id: 'fun-1',
    categoria_id: 1,
    municipio_id: 1,
    habilidades: [],
    ...overrides,
  }
}

function renderCard(convocatoria: Convocatoria) {
  return render(
    <MemoryRouter>
      <ConvocatoriaCard convocatoria={convocatoria} />
    </MemoryRouter>,
  )
}

describe('ConvocatoriaCard', () => {
  beforeEach(() => {
    favoritosMock.esVoluntario = false
  })

  it('muestra título, descripción y enlaza al detalle', () => {
    renderCard(makeConvocatoria())
    expect(screen.getByRole('heading', { name: 'Jornada de reforestación' })).toBeInTheDocument()
    expect(screen.getByText(/Siembra de árboles nativos/)).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/app/convocatorias/conv-1')
  })

  it('muestra la imagen de portada cuando hay imagen', () => {
    renderCard(makeConvocatoria({ imagen: 'https://cdn.solari.co/portada.jpg' }))
    const img = screen.getByRole('img', { name: 'Jornada de reforestación' })
    expect(img).toHaveAttribute('src', 'https://cdn.solari.co/portada.jpg')
    expect(screen.queryByText('Solari')).not.toBeInTheDocument()
  })

  it('muestra el marcador de posición cuando no hay imagen', () => {
    renderCard(makeConvocatoria({ imagen: null }))
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('Solari')).toBeInTheDocument()
  })

  it('muestra modalidad, cupos en plural y dirección presencial', () => {
    renderCard(makeConvocatoria())
    expect(screen.getByText('Presencial')).toBeInTheDocument()
    expect(screen.getByText('20 cupos')).toBeInTheDocument()
    expect(screen.getByText('Parque Central')).toBeInTheDocument()
  })

  it('usa singular con un cupo y oculta la dirección si es virtual', () => {
    renderCard(makeConvocatoria({ modalidad: 'VIRTUAL', cupo_maximo: 1 }))
    expect(screen.getByText('Virtual')).toBeInTheDocument()
    expect(screen.getByText('1 cupo')).toBeInTheDocument()
    expect(screen.queryByText('Parque Central')).not.toBeInTheDocument()
  })

  it('muestra la etiqueta de modalidad híbrida con tilde correcta', () => {
    renderCard(makeConvocatoria({ modalidad: 'HIBRIDA' }))
    expect(screen.getByText('Híbrida')).toBeInTheDocument()
  })

  it('muestra el porcentaje de compatibilidad cuando existe', () => {
    renderCard(makeConvocatoria({ coincidencia: 75 }))
    expect(screen.getByText('75% compatible')).toBeInTheDocument()
  })

  it('muestra como máximo tres habilidades', () => {
    renderCard(
      makeConvocatoria({
        habilidades: [
          { id: 1, nombre: 'Primeros auxilios' },
          { id: 2, nombre: 'Jardinería' },
          { id: 3, nombre: 'Logística' },
          { id: 4, nombre: 'Fotografía' },
        ],
      }),
    )
    expect(screen.getByText('Primeros auxilios')).toBeInTheDocument()
    expect(screen.getByText('Logística')).toBeInTheDocument()
    expect(screen.queryByText('Fotografía')).not.toBeInTheDocument()
  })

  it('no muestra el botón de favorito si el usuario no es voluntario', () => {
    renderCard(makeConvocatoria())
    expect(screen.queryByRole('button', { name: /favoritos/i })).not.toBeInTheDocument()
  })

  it('muestra el botón de favorito para voluntarios según su estado', () => {
    favoritosMock.esVoluntario = true
    const { unmount } = renderCard(makeConvocatoria())
    expect(screen.getByRole('button', { name: 'Agregar a favoritos' })).toBeInTheDocument()
    unmount()

    renderCard(makeConvocatoria({ id: 'fav' }))
    expect(screen.getByRole('button', { name: 'Quitar de favoritos' })).toBeInTheDocument()
  })
})
