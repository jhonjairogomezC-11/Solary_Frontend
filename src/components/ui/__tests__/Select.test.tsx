import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Select } from '@/components/ui/Select'

const options = [
  { value: 1, label: 'Bogotá' },
  { value: 2, label: 'Medellín' },
]

describe('Select', () => {
  it('asocia la etiqueta y renderiza las opciones', () => {
    render(<Select label="Municipio" options={options} />)
    const select = screen.getByLabelText('Municipio')
    expect(select.tagName).toBe('SELECT')
    expect(screen.getByRole('option', { name: 'Bogotá' })).toHaveValue('1')
    expect(screen.getByRole('option', { name: 'Medellín' })).toHaveValue('2')
  })

  it('placeholder es una opción deshabilitada seleccionada por defecto', () => {
    render(<Select label="Municipio" options={options} placeholder="Selecciona..." />)
    const placeholder = screen.getByRole('option', { name: 'Selecciona...' })
    expect(placeholder).toBeDisabled()
    expect(placeholder).toHaveValue('')
    expect(screen.getByLabelText('Municipio')).toHaveValue('')
  })

  it('permite seleccionar una opción y notifica onChange', async () => {
    const onChange = vi.fn()
    render(
      <Select label="Municipio" options={options} placeholder="Selecciona..." onChange={onChange} />,
    )
    const select = screen.getByLabelText('Municipio')
    await userEvent.selectOptions(select, '2')
    expect(select).toHaveValue('2')
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('acepta un valor controlado', () => {
    render(<Select label="Municipio" options={options} value={1} onChange={() => {}} />)
    expect(screen.getByLabelText('Municipio')).toHaveValue('1')
  })

  it('muestra el error y marca aria-invalid', () => {
    render(<Select label="Municipio" options={options} error="Selecciona un municipio." />)
    expect(screen.getByLabelText('Municipio')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Selecciona un municipio.')).toBeInTheDocument()
  })

  it('disabled deshabilita el select', () => {
    render(<Select label="Municipio" options={options} disabled />)
    const select = screen.getByLabelText('Municipio')
    expect(select).toBeDisabled()
    expect(select).toHaveClass('disabled:cursor-not-allowed')
  })
})
