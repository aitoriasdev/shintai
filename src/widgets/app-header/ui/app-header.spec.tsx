import { expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { AppHeader } from './app-header'

it('is the banner landmark with a home link and the search control', async () => {
  const screen = await render(<AppHeader search={<input aria-label="Search all games" />} />)

  await expect.element(screen.getByRole('banner')).toBeVisible()
  await expect.element(screen.getByRole('link', { name: 'Shintai' })).toHaveAttribute('href', '/')
  await expect.element(screen.getByRole('textbox', { name: 'Search all games' })).toBeVisible()
})
