import type { LibraryEntry } from '@contracts/library'
import { afterEach, expect, it, vi } from 'vitest'
import { fakeApi, renderWithProviders } from '@/shared/lib/testing/render-with-providers'
import { ErrorToast } from '@/shared/ui/error-toast'
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

  const screen = await renderWithProviders(
    <>
      <Harness />
      <ErrorToast />
    </>,
  )
  screen.queryClient.setQueryData<LibraryEntry[]>(libraryQueries.list().queryKey, [makeEntry()])

  await screen.getByRole('button', { name: 'favorite' }).click()
  await vi.waitFor(() => expect(screen.queryClient.getQueryData<LibraryEntry[]>(['library'])?.[0].favorite).toBe(true))

  rejectPut?.()
  await vi.waitFor(() => expect(screen.queryClient.getQueryData<LibraryEntry[]>(['library'])?.[0].favorite).toBe(false))
  // 3.3.1: the failure is reported visibly and to assistive tech.
  await expect.element(screen.getByRole('alert')).toHaveTextContent('Could not save your change, so it was undone. Is the Shintai API running?')
})

function RapidScorer() {
  const upsert = useUpsertEntry()
  return (
    <button
      type="button"
      onClick={() => {
        upsert.mutate({ game: makeGame(), patch: { score: 4 } })
        upsert.mutate({ game: makeGame(), patch: { score: 3 } })
      }}
    >
      score twice
    </button>
  )
}

it('sends library writes one at a time, in order', async () => {
  const events: string[] = []
  vi.spyOn(window, 'fetch').mockImplementation(
    fakeApi(async ({ method, body }) => {
      if (method !== 'PUT') return Response.json([])
      const { score } = (body as { patch: { score: number } }).patch
      events.push(`start ${score}`)
      // The first write is slow: without serialization the second one would overtake it.
      await new Promise((resolve) => setTimeout(resolve, score === 4 ? 150 : 0))
      events.push(`end ${score}`)
      return Response.json(makeEntry({ score }))
    }),
  )

  const screen = await renderWithProviders(<RapidScorer />)
  await screen.getByRole('button', { name: 'score twice' }).click()

  await vi.waitFor(() => expect(events).toEqual(['start 4', 'end 4', 'start 3', 'end 3']))
})

function FavoriteThenComplete() {
  const upsert = useUpsertEntry()
  return (
    <button
      type="button"
      onClick={() => {
        upsert.mutate({ game: makeGame(), patch: { favorite: true } })
        upsert.mutate({ game: makeGame(), patch: { completed: true } })
      }}
    >
      favorite then complete
    </button>
  )
}

it('never leaves a failed change on screen when several writes fail and the API stays down', async () => {
  vi.spyOn(window, 'fetch').mockImplementation(fakeApi(() => Response.json({ error: 'down' }, { status: 503 })))
  const screen = await renderWithProviders(<FavoriteThenComplete />)
  const original = [makeEntry()]
  screen.queryClient.setQueryData<LibraryEntry[]>(libraryQueries.list().queryKey, original)

  await screen.getByRole('button', { name: 'favorite then complete' }).click()

  await vi.waitFor(() => expect(screen.queryClient.isMutating()).toBe(0))
  await vi.waitFor(() => expect(screen.queryClient.isFetching()).toBe(0))
  expect(screen.queryClient.getQueryData<LibraryEntry[]>(['library'])).toEqual(original)
})

it('keeps changes the server confirmed when a later write fails', async () => {
  vi.spyOn(window, 'fetch').mockImplementation(
    fakeApi(({ method, body }) => {
      if (method !== 'PUT') return Response.json({ error: 'down' }, { status: 503 })
      const { patch } = body as { patch: Partial<LibraryEntry> }
      return patch.favorite ? Response.json(makeEntry({ favorite: true })) : Response.json({ error: 'down' }, { status: 503 })
    }),
  )
  const screen = await renderWithProviders(<FavoriteThenComplete />)
  screen.queryClient.setQueryData<LibraryEntry[]>(libraryQueries.list().queryKey, [makeEntry()])

  await screen.getByRole('button', { name: 'favorite then complete' }).click()

  await vi.waitFor(() => expect(screen.queryClient.isMutating()).toBe(0))
  await vi.waitFor(() => expect(screen.queryClient.isFetching()).toBe(0))
  expect(screen.queryClient.getQueryData<LibraryEntry[]>(['library'])).toMatchObject([{ favorite: true, completed: false }])
})
