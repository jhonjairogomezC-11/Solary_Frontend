import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renderiza el contenido y responde al clic', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Guardar</Button>)

    const btn = screen.getByRole('button', { name: 'Guardar' })
    expect(btn).toBeEnabled()
    await userEvent.click(btn)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('loading deshabilita el botón, muestra spinner e ignora clics', async () => {
    const onClick = vi.fn()
    const { container } = render(
      <Button loading onClick={onClick}>
        Enviando
      </Button>,
    )

    const btn = screen.getByRole('button', { name: 'Enviando' })
    expect(btn).toBeDisabled()
    expect(container.querySelector('svg.animate-spin')).toBeInTheDocument()
    await userEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('sin loading no muestra spinner', () => {
    const { container } = render(<Button>Ok</Button>)
    expect(container.querySelector('svg.animate-spin')).not.toBeInTheDocument()
  })

  it('respeta disabled explícito', () => {
    render(<Button disabled>Ok</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('aplica variante, tamaño, fullWidth y className', () => {
    render(
      <Button variant="secondary" size="lg" fullWidth className="mt-4">
        Ok
      </Button>,
    )
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('bg-ink-900', 'h-12', 'w-full', 'mt-4')
  })

  it('reenvía la ref al elemento button y pasa atributos nativos', () => {
    const ref = createRef<HTMLButtonElement>()
    render(
      <Button ref={ref} type="submit">
        Ok
      </Button>,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    expect(ref.current).toHaveAttribute('type', 'submit')
  })
})
