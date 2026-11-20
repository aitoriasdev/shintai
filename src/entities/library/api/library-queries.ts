import type { GameSummary } from '@contracts/game'
import type { EntryPatch, LibraryEntry } from '@contracts/library'
import { queryOptions, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { applyPatch, withoutEntry } from '../lib/apply-patch'
import { fetchLibrary, removeEntry, upsertEntry } from './library-api'

const LIBRARY_KEY = ['library'] as const

export const libraryQueries = {
  list: () =>
    queryOptions({
      queryKey: LIBRARY_KEY,
      queryFn: ({ signal }) => fetchLibrary(signal),
      staleTime: Infinity,
    }),
}

export function useLibraryEntries() {
  return useQuery(libraryQueries.list())
}

/** Subscribes a single card to its own entry, so unrelated changes do not re-render it. */
export function useLibraryEntry(gameId: string): LibraryEntry | undefined {
  return useQuery({
    ...libraryQueries.list(),
    select: (entries) => entries.find((entry) => entry.game.id === gameId),
  }).data
}

/**
 * Optimistically writes to the cache, rolls back on failure and re-syncs with the server once the
 * last concurrent library mutation settles (avoids flicker when toggling quickly).
 */
async function optimistic(queryClient: QueryClient, update: (entries: LibraryEntry[]) => LibraryEntry[]) {
  await queryClient.cancelQueries({ queryKey: LIBRARY_KEY })
  const previous = queryClient.getQueryData<LibraryEntry[]>(LIBRARY_KEY)
  queryClient.setQueryData<LibraryEntry[]>(LIBRARY_KEY, (entries = []) => update(entries))
  return { previous }
}

function settle(queryClient: QueryClient) {
  if (queryClient.isMutating({ mutationKey: LIBRARY_KEY }) === 1) {
    return queryClient.invalidateQueries({ queryKey: LIBRARY_KEY })
  }
}

export function useUpsertEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: LIBRARY_KEY,
    mutationFn: ({ game, patch }: { game: GameSummary; patch: EntryPatch }) => upsertEntry(game, patch),
    onMutate: ({ game, patch }) => optimistic(queryClient, (entries) => applyPatch(entries, game, patch, Date.now())),
    onError: (_error, _variables, context) => queryClient.setQueryData(LIBRARY_KEY, context?.previous),
    onSettled: () => settle(queryClient),
  })
}

export function useRemoveEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: LIBRARY_KEY,
    mutationFn: (gameId: string) => removeEntry(gameId),
    onMutate: (gameId) => optimistic(queryClient, (entries) => withoutEntry(entries, gameId)),
    onError: (_error, _variables, context) => queryClient.setQueryData(LIBRARY_KEY, context?.previous),
    onSettled: () => settle(queryClient),
  })
}
