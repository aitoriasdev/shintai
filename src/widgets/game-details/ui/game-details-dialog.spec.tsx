import type { GameDetails } from '@contracts/game'
import { afterEach, expect, it, vi } from 'vitest'
import { fakeApi, renderWithProviders } from '@/shared/lib/testing/render-with-providers'
import { makeGame } from '@/shared/lib/testing/fixtures'
import { GameDetailsDialog } from './game-details-dialog'

afterEach(() => vi.restoreAllMocks())

const details: GameDetails = {
  extract: 'Celeste is a platform game.',
  coverUrl: null,
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Celeste_(video_game)',
  releaseDate: 'January 25, 2018',
  platforms: ['Windows', 'Nintendo Switch'],
  genres: ['Platformer'],
  developers: ['Maddy Makes Games'],
  publishers: [],
}

it('shows game details, personal controls and facts', async () => {
  vi.spyOn(window, 'fetch').mockImplementation(
    fakeApi(({ url }) => Response.json(url.pathname.startsWith('/api/games/') ? details : [])),
  )
  const onClose = vi.fn()
  const screen = await renderWithProviders(<GameDetailsDialog game={makeGame()} onClose={onClose} />)

  await expect.element(screen.getByRole('dialog', { name: 'Celeste' })).toBeVisible()
  await expect.element(screen.getByText('Celeste is a platform game.')).toBeVisible()
  await expect.element(screen.getByText('Nintendo Switch')).toBeVisible()
  await expect.element(screen.getByText('January 25, 2018')).toBeVisible()
  await expect.element(screen.getByText('Publishers')).not.toBeInTheDocument()
  await expect.element(screen.getByRole('link', { name: 'Read more on Wikipedia' })).toHaveAttribute('href', details.wikipediaUrl)
  await expect.element(screen.getByRole('button', { name: 'Add to library' })).toBeVisible()
  await expect.element(screen.getByRole('radiogroup', { name: 'Your score' })).toBeVisible()

  await screen.getByRole('button', { name: 'Close' }).click()
  expect(onClose).toHaveBeenCalled()
})

it('offers a retry when details fail to load', async () => {
  vi.spyOn(window, 'fetch').mockImplementation(
    fakeApi(({ url }) =>
      url.pathname.startsWith('/api/games/') ? Response.json({ error: 'Wikipedia is unavailable right now' }, { status: 502 }) : Response.json([]),
    ),
  )
  const screen = await renderWithProviders(<GameDetailsDialog game={makeGame()} onClose={vi.fn()} />)
  await expect.element(screen.getByRole('alert').getByText('Wikipedia is unavailable right now', { exact: false })).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Retry' })).toBeVisible()
})
