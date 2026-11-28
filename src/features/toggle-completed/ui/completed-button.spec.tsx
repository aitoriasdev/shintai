import type { LibraryEntry } from '@contracts/library'
import { afterEach, expect, it, vi } from 'vitest'
import { makeEntry, makeGame } from '@/shared/lib/testing/fixtures'
import { fakeApi } from '@/shared/lib/testing/fake-api'
import { renderWithProviders } from '@/shared/lib/testing/render-with-providers'
import { CompletedButton } from './completed-button'

afterEach(() => vi.restoreAllMocks())

it('un-completes a completed game', async () => {
  let entries: LibraryEntry[] = [makeEntry({ completed: true })]
  vi.spyOn(window, 'fetch').mockImplementation(
    fakeApi(({ method }) => {
      if (method === 'PUT') entries = [makeEntry({ completed: false })]
      return Response.json(method === 'PUT' ? entries[0] : entries)
    }),
  )

  const screen = await renderWithProviders(<CompletedButton game={makeGame()} showLabel />)
  const button = screen.getByRole('button', { name: 'Completed: Celeste' })
  await expect.element(button).toHaveAttribute('aria-pressed', 'true')
  await button.click()
  await expect.element(button).toHaveAttribute('aria-pressed', 'false')
})
