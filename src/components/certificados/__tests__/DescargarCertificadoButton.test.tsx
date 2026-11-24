import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { descargarMock } = vi.hoisted(() => ({ descargarMock: vi.fn() }))

vi.mock('@/services/certificadoService', () => ({
  certificadoService: { descargar: descargarMock },
}))

import { DescargarCertificadoButton } from '@/components/certificados/DescargarCertificadoButton'

function apiError(status: number, message: string) {
  const response = {
    status,
    statusText: '',
    data: { message },
    headers: {},
    config: { headers: new AxiosHeaders() },
  } as AxiosResponse
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, response)
}

const boton = () => screen.getByRole('button', { name: /descargar certificado/i })

describe('DescargarCertificadoButton', () => {
  beforeEach(() => {
    descargarMock.mockReset()
  })

  it('llama al servicio con el id de la postulación', async () => {
    descargarMock.mockResolvedValueOnce(undefined)
    render(<DescargarCertificadoButton postulacionId="abc-123" />)

    await userEvent.click(boton())

    expect(descargarMock).toHaveBeenCalledWith('abc-123')
    await waitFor(() => expect(boton()).toBeEnabled())
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('deshabilita el botón mientras descarga', async () => {
    let terminar!: () => void
    descargarMock.mockReturnValueOnce(new Promise<void>((r) => (terminar = r)))
    render(<DescargarCertificadoButton postulacionId="abc" />)

    await userEvent.click(boton())
    expect(boton()).toBeDisabled()

    terminar()
    await waitFor(() => expect(boton()).toBeEnabled())
  })

  it('muestra el mensaje de la API cuando falla', async () => {
    descargarMock.mockRejectedValueOnce(
      apiError(409, 'El certificado solo está disponible tras confirmar asistencia.'),
    )
    render(<DescargarCertificadoButton postulacionId="abc" />)

    await userEvent.click(boton())

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El certificado solo está disponible tras confirmar asistencia.',
    )
    expect(boton()).toBeEnabled()
  })

  it('muestra un mensaje genérico ante errores desconocidos', async () => {
    descargarMock.mockRejectedValueOnce(new Error('boom'))
    render(<DescargarCertificadoButton postulacionId="abc" />)

    await userEvent.click(boton())

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ocurrió un error inesperado. Inténtalo de nuevo.',
    )
  })

  it('limpia el error al reintentar con éxito', async () => {
    descargarMock.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(undefined)
    render(<DescargarCertificadoButton postulacionId="abc" />)

    await userEvent.click(boton())
    expect(await screen.findByRole('alert')).toBeInTheDocument()

    await userEvent.click(boton())
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    expect(descargarMock).toHaveBeenCalledTimes(2)
  })
})
