import { afterEach, expect, it, vi } from 'vitest'
import { fakeApi, renderWithProviders } from '@/shared/lib/testing/render-with-providers'
import { makeEntry, makeGame } from '@/shared/lib/testing/fixtures'
import { FavoriteButton } from './favorite-button'

afterEach(() => vi.restoreAllMocks())

it('marks a game as favorite through the API', async () => {
  const puts: unknown[] = []
  vi.spyOn(window, 'fetch').mockImplementation(
    fakeApi(({ method, body }) => {
      if (method === 'PUT') {
        puts.push(body)
        return Response.json(makeEntry({ favorite: true }))
      }
      return Response.json(puts.length ? [makeEntry({ favorite: true })] : [])
    }),
  )

  const screen = await renderWithProviders(<FavoriteButton game={makeGame()} />)
  const button = screen.getByRole('button', { name: 'Add to favorites' })
  await expect.element(button).toHaveAttribute('aria-pressed', 'false')

  await button.click()

  await expect.element(screen.getByRole('button', { name: 'Favorite' })).toHaveAttribute('aria-pressed', 'true')
  expect(puts).toEqual([{ game: makeGame(), patch: { favorite: true } }])
})
