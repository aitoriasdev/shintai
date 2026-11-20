import type { LibraryEntry } from '@contracts/library'
import { afterEach, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { makeEntry, makeGame } from '@/shared/lib/testing/fixtures'
import { fakeApi, renderWithProviders } from '@/shared/lib/testing/render-with-providers'
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

it('is a labelled radio group that rates the game', async () => {
  const patches = serve([])
  const screen = await renderWithProviders(<ScorePicker game={makeGame()} />)

  await expect.element(screen.getByRole('group', { name: 'Your score' })).toBeVisible()
  await screen.getByRole('radio', { name: '8 out of 10' }).click()

  await expect.element(screen.getByRole('radio', { name: '8 out of 10' })).toBeChecked()
  expect(patches).toEqual([{ score: 8 }])
})

it('changes the score with arrow keys (2.1.1)', async () => {
  const patches = serve([makeEntry({ score: 6 })])
  const screen = await renderWithProviders(<ScorePicker game={makeGame()} />)
  await expect.element(screen.getByRole('radio', { name: '6 out of 10' })).toBeChecked()

  await userEvent.tab()
  await expect.element(screen.getByRole('radio', { name: '6 out of 10' })).toHaveFocus()
  await userEvent.keyboard('{ArrowRight}')

  await expect.element(screen.getByRole('radio', { name: '7 out of 10' })).toBeChecked()
  expect(patches).toEqual([{ score: 7 }])
})

it('clears the score with the clear button', async () => {
  const patches = serve([makeEntry({ score: 6 })])
  const screen = await renderWithProviders(<ScorePicker game={makeGame()} />)

  await screen.getByRole('button', { name: 'Clear score' }).click()
  await expect.element(screen.getByRole('button', { name: 'Clear score' })).toBeDisabled()
  expect(patches).toEqual([{ score: null }])
})
