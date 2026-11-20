import type { LibraryEntry } from '@contracts/library'
import { afterEach, expect, it, vi } from 'vitest'
import { fakeApi, renderWithProviders } from '@/shared/lib/testing/render-with-providers'
import { makeEntry, makeGame } from '@/shared/lib/testing/fixtures'
import { ScorePicker } from './score-picker'

afterEach(() => vi.restoreAllMocks())

function serve(initial: LibraryEntry[]) {
  let entries = initial
  const patches: unknown[] = []
  vi.spyOn(window, 'fetch').mockImplementation(
    fakeApi(({ method, body }) => {
      if (method === 'PUT') {
        const { patch } = body as { patch: Partial<LibraryEntry> }
        patches.push(patch)
        entries = [{ ...(entries[0] ?? makeEntry()), ...patch }]
        return Response.json(entries[0])
      }
      return Response.json(entries)
    }),
  )
  return patches
}

it('rates a game', async () => {
  const patches = serve([])
  const screen = await renderWithProviders(<ScorePicker game={makeGame()} />)

  await screen.getByRole('radio', { name: '8 out of 10' }).click()

  await expect.element(screen.getByRole('radio', { name: '8 out of 10' })).toHaveAttribute('aria-checked', 'true')
  expect(patches).toEqual([{ score: 8 }])
})

it('clears the score when clicking the current value or the clear button', async () => {
  const patches = serve([makeEntry({ score: 6 })])
  const screen = await renderWithProviders(<ScorePicker game={makeGame()} />)

  await expect.element(screen.getByRole('radio', { name: '6 out of 10' })).toHaveAttribute('aria-checked', 'true')
  await screen.getByRole('radio', { name: '6 out of 10' }).click()
  await expect.element(screen.getByRole('button', { name: 'Clear score' })).toBeDisabled()
  expect(patches).toEqual([{ score: null }])
})
