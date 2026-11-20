import { afterEach, expect, it, vi } from 'vitest'
import { fakeApi, renderWithProviders } from '@/shared/lib/testing/render-with-providers'
import { makeEntry, makeGame } from '@/shared/lib/testing/fixtures'
import { LibraryPage } from './library-page'

afterEach(() => vi.restoreAllMocks())

const entries = [
  makeEntry({ game: makeGame({ id: 'Q1', title: 'Celeste' }), favorite: true, score: 10, addedAt: 2 }),
  makeEntry({ game: makeGame({ id: 'Q2', title: 'Hades' }), completed: true, addedAt: 1 }),
]

it('lists entries with stats and filters them', async () => {
  vi.spyOn(window, 'fetch').mockImplementation(fakeApi(() => Response.json(entries)))
  const screen = await renderWithProviders(<LibraryPage query="" onOpen={vi.fn()} onBrowse={vi.fn()} />)

  await expect.element(screen.getByRole('heading', { name: 'Celeste' })).toBeVisible()
  await expect.element(screen.getByRole('heading', { name: 'Hades' })).toBeVisible()
  await expect.element(screen.getByText('10.0')).toBeVisible()

  await screen.getByRole('radio', { name: 'Favorites' }).click()
  await expect.element(screen.getByRole('heading', { name: 'Hades' })).not.toBeInTheDocument()
})

it('applies the header search locally', async () => {
  vi.spyOn(window, 'fetch').mockImplementation(fakeApi(() => Response.json(entries)))
  const screen = await renderWithProviders(<LibraryPage query="hades" onOpen={vi.fn()} onBrowse={vi.fn()} />)
  await expect.element(screen.getByRole('heading', { name: 'Hades' })).toBeVisible()
  await expect.element(screen.getByRole('heading', { name: 'Celeste' })).not.toBeInTheDocument()
})

it('invites to discover games when empty', async () => {
  vi.spyOn(window, 'fetch').mockImplementation(fakeApi(() => Response.json([])))
  const onBrowse = vi.fn()
  const screen = await renderWithProviders(<LibraryPage query="" onOpen={vi.fn()} onBrowse={onBrowse} />)
  await screen.getByRole('button', { name: 'Discover games' }).click()
  expect(onBrowse).toHaveBeenCalled()
})
