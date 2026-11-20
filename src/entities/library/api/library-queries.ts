import type { GameSummary } from '@contracts/game'
import type { EntryPatch, LibraryEntry } from '@contracts/library'
import { queryOptions, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { showError } from '@/shared/lib/error-notifications'
import { applyPatch, withoutEntry } from '../lib/apply-patch'
import { fetchLibrary, removeEntry, upsertEntry } from './library-api'

const LIBRARY_KEY = ['library'] as const

/** Library writes run one at a time, in order: rapid changes (e.g. arrowing through scores) can't reach the API out of order. */
const LIBRARY_MUTATION_SCOPE = { id: 'library' }

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

function rollback(queryClient: QueryClient, context: { previous?: LibraryEntry[] } | undefined) {
  queryClient.setQueryData(LIBRARY_KEY, context?.previous)
  showError('Could not save your change, so it was undone. Is the Shintai API running?')
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
    scope: LIBRARY_MUTATION_SCOPE,
    mutationFn: ({ game, patch }: { game: GameSummary; patch: EntryPatch }) => upsertEntry(game, patch),
    onMutate: ({ game, patch }) => optimistic(queryClient, (entries) => applyPatch(entries, game, patch, Date.now())),
    onError: (_error, _variables, context) => rollback(queryClient, context),
    onSettled: () => settle(queryClient),
  })
}

export function useRemoveEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: LIBRARY_KEY,
    scope: LIBRARY_MUTATION_SCOPE,
    mutationFn: (gameId: string) => removeEntry(gameId),
    onMutate: (gameId) => optimistic(queryClient, (entries) => withoutEntry(entries, gameId)),
    onError: (_error, _variables, context) => rollback(queryClient, context),
    onSettled: () => settle(queryClient),
  })
}
