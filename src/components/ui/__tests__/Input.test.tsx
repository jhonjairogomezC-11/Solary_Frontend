import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Input } from '@/components/ui/Input'

describe('Input', () => {
  it('asocia la etiqueta con el input (id generado)', () => {
    render(<Input label="Correo" />)
    const input = screen.getByLabelText('Correo')
    expect(input.tagName).toBe('INPUT')
    expect(input).toHaveAttribute('type', 'text')
    expect(input.id).not.toBe('')
  })

  it('usa el id recibido para la asociación', () => {
    render(<Input label="Nombre" id="nombre" />)
    expect(screen.getByLabelText('Nombre')).toHaveAttribute('id', 'nombre')
  })

  it('genera ids distintos para cada instancia', () => {
    render(
      <>
        <Input label="Uno" />
        <Input label="Dos" />
      </>,
    )
    expect(screen.getByLabelText('Uno').id).not.toBe(screen.getByLabelText('Dos').id)
  })

  it('disabled deshabilita el input y lleva las clases de estilo deshabilitado', () => {
    render(<Input label="Documento" disabled />)
    const input = screen.getByLabelText('Documento')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:bg-ink-100')
  })

  it('muestra el error, marca aria-invalid y oculta el hint', () => {
    render(<Input label="Correo" error="Correo no válido." hint="Usa tu correo personal" />)
    const input = screen.getByLabelText('Correo')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveClass('border-red-400')
    expect(screen.getByText('Correo no válido.')).toBeInTheDocument()
    expect(screen.queryByText('Usa tu correo personal')).not.toBeInTheDocument()
  })

  it('muestra el hint cuando no hay error', () => {
    render(<Input label="Correo" hint="Usa tu correo personal" />)
    expect(screen.getByLabelText('Correo')).toHaveAttribute('aria-invalid', 'false')
    expect(screen.getByText('Usa tu correo personal')).toBeInTheDocument()
  })

  it('permite escribir', async () => {
    render(<Input label="Ciudad" />)
    const input = screen.getByLabelText('Ciudad')
    await userEvent.type(input, 'Cali')
    expect(input).toHaveValue('Cali')
  })

  it('campo password: alterna visibilidad con el botón', async () => {
    render(<Input label="Contraseña" type="password" />)
    const input = screen.getByLabelText('Contraseña')
    expect(input).toHaveAttribute('type', 'password')

    const toggle = screen.getByRole('button', { name: 'Mostrar contraseña' })
    expect(toggle).toHaveAttribute('type', 'button')
    await userEvent.click(toggle)
    expect(input).toHaveAttribute('type', 'text')

    await userEvent.click(screen.getByRole('button', { name: 'Ocultar contraseña' }))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('campos que no son password no muestran el botón de visibilidad', () => {
    render(<Input label="Correo" type="email" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
