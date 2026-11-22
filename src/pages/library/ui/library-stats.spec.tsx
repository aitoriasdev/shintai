import { afterEach, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { setLocale } from '@/shared/i18n/i18n-store'
import { makeEntry, makeGame } from '@/shared/lib/testing/fixtures'
import { LibraryStats } from './library-stats'

afterEach(() => setLocale('en-GB'))

const entries = () => [
  makeEntry({ score: 9, completed: true, favorite: true }),
  makeEntry({ game: makeGame({ id: 'Q2' }), score: 6 }),
]

it('renders the library summary', async () => {
  const screen = await render(<LibraryStats entries={entries()} />)
  await expect.element(screen.getByRole('term').filter({ hasText: 'Games' })).toBeVisible()
  await expect.element(screen.getByRole('definition').first()).toHaveTextContent('2')
  await expect.element(screen.getByText('50%')).toBeVisible()
  await expect.element(screen.getByText('7.5')).toBeVisible()
})

it('formats the figures for Spanish', async () => {
  setLocale('es-ES')
  const screen = await render(<LibraryStats entries={entries()} />)
  await expect.element(screen.getByRole('term').filter({ hasText: 'Puntuación media' })).toBeVisible()
  await expect.element(screen.getByText('50 %')).toBeVisible()
  await expect.element(screen.getByText('7,5')).toBeVisible()
})
