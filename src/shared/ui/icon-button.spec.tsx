import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { IconButton } from './icon-button'

it('exposes an accessible toggle', async () => {
  const onClick = vi.fn()
  const screen = await render(<IconButton label="Favorite" icon={<span aria-hidden="true">♥</span>} pressed={false} onClick={onClick} />)
  const button = screen.getByRole('button', { name: 'Favorite' })

  await expect.element(button).toHaveAttribute('aria-pressed', 'false')
  await button.click()
  expect(onClick).toHaveBeenCalledOnce()
})

it('shows the label as text when requested', async () => {
  const screen = await render(<IconButton label="Add to library" icon={<span aria-hidden="true">+</span>} showLabel />)
  const button = screen.getByRole('button', { name: 'Add to library' })
  // Named by its visible text rather than an aria-label.
  await expect.element(button).not.toHaveAttribute('aria-label')
  await expect.element(button.getByText('Add to library')).toBeVisible()
})
