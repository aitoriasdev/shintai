import type { LibraryEntry } from '@contracts/library'
import { afterEach, expect, it, vi } from 'vitest'
import { fakeApi, renderWithProviders } from '@/shared/lib/testing/render-with-providers'
import { makeEntry, makeGame } from '@/shared/lib/testing/fixtures'
import { libraryQueries, useUpsertEntry } from './library-queries'

afterEach(() => vi.restoreAllMocks())

function Harness() {
  const upsert = useUpsertEntry()
  return (
    <button type="button" onClick={() => upsert.mutate({ game: makeGame(), patch: { favorite: true } })}>
      favorite
    </button>
  )
}

it('applies upserts optimistically and rolls back on failure', async () => {
  let rejectPut: (() => void) | undefined
  vi.spyOn(window, 'fetch').mockImplementation(
    fakeApi(({ method }) =>
      method === 'PUT'
        ? new Promise((resolve) => {
            rejectPut = () => resolve(Response.json({ error: 'boom' }, { status: 500 }))
          })
        : Response.json([makeEntry()]),
    ),
  )

  const screen = await renderWithProviders(<Harness />)
  screen.queryClient.setQueryData<LibraryEntry[]>(libraryQueries.list().queryKey, [makeEntry()])

  await screen.getByRole('button').click()
  await vi.waitFor(() => expect(screen.queryClient.getQueryData<LibraryEntry[]>(['library'])?.[0].favorite).toBe(true))

  rejectPut?.()
  await vi.waitFor(() => expect(screen.queryClient.getQueryData<LibraryEntry[]>(['library'])?.[0].favorite).toBe(false))
})
