import { afterEach, expect, it, vi } from 'vitest'
import { makeEntry, makeGame } from '@/shared/lib/testing/fixtures'
import { fakeApi } from '@/shared/lib/testing/fake-api'
import { renderWithProviders } from '@/shared/lib/testing/render-with-providers'
import { FavoriteButton } from './favorite-button'

afterEach(() => vi.restoreAllMocks())

it('toggles the favorite state through the API', async () => {
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
  const button = screen.getByRole('button', { name: 'Favourite: Celeste' })
  await expect.element(button).toHaveAttribute('aria-pressed', 'false')

  await button.click()

  await expect.element(button).toHaveAttribute('aria-pressed', 'true')
  expect(puts).toEqual([{ game: makeGame(), patch: { favorite: true } }])
})
