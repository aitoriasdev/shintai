import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { IconButton } from './icon-button'

const icon = <svg aria-hidden="true" />

describe('IconButton', () => {
  it('is an accessible toggle with a constant, contextual name', async () => {
    const onClick = vi.fn()
    const screen = await render(<IconButton label="Favorite" context="Celeste" icon={icon} pressed={false} onClick={onClick} />)
    const button = screen.getByRole('button', { name: 'Favorite: Celeste' })

    await expect.element(button).toHaveAttribute('aria-pressed', 'false')
    await expect.element(button).toHaveAttribute('title', 'Favorite')
    await button.click()
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('starts its accessible name with the visible label (2.5.3)', async () => {
    const screen = await render(<IconButton label="Completed" context="Hades" icon={icon} pressed showLabel />)
    const button = screen.getByRole('button', { name: 'Completed: Hades', exact: true })
    await expect.element(button).toHaveAttribute('aria-pressed', 'true')
    await expect.element(button).not.toHaveAttribute('title')
    expect(button.element().textContent).toBe('Completed')
  })

  it('is not a toggle when `pressed` is omitted', async () => {
    const screen = await render(<IconButton label="Close" icon={icon} />)
    await expect.element(screen.getByRole('button', { name: 'Close' })).not.toHaveAttribute('aria-pressed')
  })
})
