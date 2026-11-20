import { expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { makeEntry } from '@/shared/lib/testing/fixtures'
import { LibraryStats } from './library-stats'

it('renders the library summary', async () => {
  const screen = await render(<LibraryStats entries={[makeEntry({ score: 9, completed: true, favorite: true }), makeEntry()]} />)
  await expect.element(screen.getByText('Games')).toBeVisible()
  await expect.element(screen.getByText('50%')).toBeVisible()
  await expect.element(screen.getByText('9.0')).toBeVisible()
})
