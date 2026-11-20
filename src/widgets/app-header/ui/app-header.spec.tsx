import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { AppHeader } from './app-header'

it('highlights the current view, shows the library count and switches views', async () => {
  const onViewChange = vi.fn()
  const screen = await render(<AppHeader view="discover" onViewChange={onViewChange} libraryCount={3} search={<input aria-label="search" />} />)

  await expect.element(screen.getByRole('link', { name: 'Discover' })).toHaveAttribute('aria-current', 'page')
  await expect.element(screen.getByRole('link', { name: 'My library, 3 games' })).not.toHaveAttribute('aria-current')

  await screen.getByRole('link', { name: 'My library, 3 games' }).click()
  expect(onViewChange).toHaveBeenCalledWith('library')
})
