import type { LibraryEntry } from '@contracts/library'
import { afterEach, expect, it, vi } from 'vitest'
import { makeEntry, makeGame } from '@/shared/lib/testing/fixtures'
import { fakeApi } from '@/shared/lib/testing/fake-api'
import { renderWithProviders } from '@/shared/lib/testing/render-with-providers'
import { LibraryButton } from './library-button'

afterEach(() => vi.restoreAllMocks())

function serve(initial: LibraryEntry[]) {
  let entries = initial
  const calls: string[] = []
  vi.spyOn(window, 'fetch').mockImplementation(
    fakeApi(({ method, url }) => {
      calls.push(`${method} ${url.pathname}`)
      if (method === 'PUT') entries = [makeEntry()]
      if (method === 'DELETE') {
        entries = []
        return new Response(null, { status: 204 })
      }
      return Response.json(method === 'PUT' ? entries[0] : entries)
    }),
  )
  return calls
}

it('adds a game to the library', async () => {
  const calls = serve([])
  const screen = await renderWithProviders(<LibraryButton game={makeGame()} />)
  await screen.getByRole('button', { name: 'Add to library' }).click()
  await expect.element(screen.getByRole('button', { name: 'Remove from library' })).toBeVisible()
  expect(calls).toContain('PUT /api/library/Q1')
})

it('removes a game only after confirmation', async () => {
  const calls = serve([makeEntry()])
  const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
  const screen = await renderWithProviders(<LibraryButton game={makeGame()} />)
  const button = screen.getByRole('button', { name: 'Remove from library' })

  await button.click()
  expect(calls).not.toContain('DELETE /api/library/Q1')

  await button.click()
  await expect.element(screen.getByRole('button', { name: 'Add to library' })).toBeVisible()
  expect(confirm).toHaveBeenCalledTimes(2)
  expect(calls).toContain('DELETE /api/library/Q1')
})
