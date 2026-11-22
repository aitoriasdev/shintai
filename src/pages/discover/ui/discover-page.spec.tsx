import { afterEach, expect, it, vi } from 'vitest'
import { fakeApi, renderWithProviders } from '@/shared/lib/testing/render-with-providers'
import { makeGame, problemResponse } from '@/shared/lib/testing/fixtures'
import { DiscoverPage } from './discover-page'

afterEach(() => vi.restoreAllMocks())

it('browses notable games and filters by year', async () => {
  const searches: string[] = []
  vi.spyOn(window, 'fetch').mockImplementation(
    fakeApi(({ url }) => {
      if (url.pathname === '/api/games/search') {
        searches.push(url.search)
        const year = url.searchParams.get('year')
        return Response.json({ games: [makeGame({ title: year ? `Game of ${year}` : 'Celeste' })], nextOffset: null })
      }
      return Response.json([])
    }),
  )

  const screen = await renderWithProviders(<DiscoverPage query="" onOpen={vi.fn()} />)
  await expect.element(screen.getByRole('heading', { name: 'Notable games' })).toBeVisible()
  await expect.element(screen.getByRole('heading', { name: 'Celeste' })).toBeVisible()

  await screen.getByRole('combobox', { name: 'Release year' }).selectOptions('1998')
  await expect.element(screen.getByRole('heading', { name: 'Notable games of 1998' })).toBeVisible()
  await expect.element(screen.getByRole('heading', { name: 'Game of 1998' })).toBeVisible()
  expect(searches).toEqual(['', '?year=1998'])
})

it('shows an empty state when nothing matches', async () => {
  vi.spyOn(window, 'fetch').mockImplementation(fakeApi(({ url }) => Response.json(url.pathname === '/api/library' ? [] : { games: [], nextOffset: null })))
  const screen = await renderWithProviders(<DiscoverPage query="zzzz" onOpen={vi.fn()} />)
  await expect.element(screen.getByRole('heading', { name: 'No games found' })).toBeVisible()
})

it('shows the API error with a retry', async () => {
  vi.spyOn(window, 'fetch').mockImplementation(
    fakeApi(({ url }) => (url.pathname === '/api/library' ? Response.json([]) : problemResponse('upstream-unavailable'))),
  )
  const screen = await renderWithProviders(<DiscoverPage query="" onOpen={vi.fn()} />)
  await expect.element(screen.getByText('Wikipedia is unavailable right now')).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Try again' })).toBeVisible()
})

it('keeps loaded games when the next page fails, and retries just that page', async () => {
  let failNextPage = true
  vi.spyOn(window, 'fetch').mockImplementation(
    fakeApi(({ url }) => {
      if (url.pathname === '/api/library') return Response.json([])
      if (!url.searchParams.has('offset')) return Response.json({ games: [makeGame({ title: 'Celeste' })], nextOffset: 24 })
      if (failNextPage) return problemResponse('upstream-unavailable')
      return Response.json({ games: [makeGame({ id: 'Q2', pageId: 2, title: 'Hades' })], nextOffset: null })
    }),
  )

  const screen = await renderWithProviders(<DiscoverPage query="" onOpen={vi.fn()} />)
  const alert = screen.getByRole('alert')
  await expect.element(alert.getByText('Could not load more games', { exact: false })).toBeVisible()
  await expect.element(screen.getByRole('heading', { name: 'Celeste' })).toBeVisible()

  failNextPage = false
  await alert.getByRole('button', { name: 'Try again' }).click()
  await expect.element(screen.getByRole('heading', { name: 'Hades' })).toBeVisible()
  await expect.element(screen.getByRole('heading', { name: 'Celeste' })).toBeVisible()
})
