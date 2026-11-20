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

type LibraryChange = { kind: 'upsert'; game: GameSummary; patch: EntryPatch } | { kind: 'remove'; gameId: string }
type MutationContext = { change: LibraryChange }

function applyChange(entries: LibraryEntry[], change: LibraryChange): LibraryEntry[] {
  return change.kind === 'upsert' ? applyPatch(entries, change.game, change.patch, Date.now()) : withoutEntry(entries, change.gameId)
}

function withServerEntry(entries: LibraryEntry[], entry: LibraryEntry): LibraryEntry[] {
  const index = entries.findIndex((e) => e.game.id === entry.game.id)
  return index === -1 ? [entry, ...entries] : entries.map((e, i) => (i === index ? entry : e))
}

/**
 * Optimistic updates for a chain of (serialized) library writes. The chain remembers the last state
 * the server confirmed; the cache always shows that state plus the changes still in flight. A failed
 * write is dropped by recomputing from the confirmed state — restoring per-mutation snapshots would
 * resurrect earlier failed changes when several writes fail in a row.
 */
const chains = new WeakMap<QueryClient, { confirmed: LibraryEntry[] | undefined }>()

async function optimistic(queryClient: QueryClient, change: LibraryChange): Promise<MutationContext> {
  // Read synchronously, before any await, so the first write of a chain captures the pre-optimistic state.
  if (!chains.has(queryClient)) chains.set(queryClient, { confirmed: queryClient.getQueryData<LibraryEntry[]>(LIBRARY_KEY) })
  await queryClient.cancelQueries({ queryKey: LIBRARY_KEY })
  queryClient.setQueryData<LibraryEntry[]>(LIBRARY_KEY, (entries = []) => applyChange(entries, change))
  return { change }
}

/** Shows the confirmed state plus the optimistic changes of writes still pending (except `settled`). */
function recompute(queryClient: QueryClient, settled: MutationContext | undefined) {
  const confirmed = chains.get(queryClient)?.confirmed
  if (!confirmed) return
  const pending = queryClient
    .getMutationCache()
    .findAll({ mutationKey: LIBRARY_KEY, status: 'pending' })
    .map((mutation) => mutation.state.context as MutationContext | undefined)
    .filter((context): context is MutationContext => context !== undefined && context !== settled)
  queryClient.setQueryData(LIBRARY_KEY, pending.reduce((entries, { change }) => applyChange(entries, change), confirmed))
}

function confirm(queryClient: QueryClient, update: (confirmed: LibraryEntry[]) => LibraryEntry[]) {
  const chain = chains.get(queryClient)
  if (chain?.confirmed) chain.confirmed = update(chain.confirmed)
}

function fail(queryClient: QueryClient, context: MutationContext | undefined) {
  recompute(queryClient, context)
  showError('Could not save your change, so it was undone. Is the Shintai API running?')
}

/** When the last write of a chain settles, show exactly what the server confirmed, then re-sync. */
function settle(queryClient: QueryClient, context: MutationContext | undefined) {
  if (queryClient.isMutating({ mutationKey: LIBRARY_KEY }) !== 1) return
  recompute(queryClient, context)
  chains.delete(queryClient)
  return queryClient.invalidateQueries({ queryKey: LIBRARY_KEY })
}

export function useUpsertEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: LIBRARY_KEY,
    scope: LIBRARY_MUTATION_SCOPE,
    mutationFn: ({ game, patch }: { game: GameSummary; patch: EntryPatch }) => upsertEntry(game, patch),
    onMutate: ({ game, patch }) => optimistic(queryClient, { kind: 'upsert', game, patch }),
    onSuccess: (entry) => confirm(queryClient, (confirmed) => withServerEntry(confirmed, entry)),
    onError: (_error, _variables, context) => fail(queryClient, context),
    onSettled: (_data, _error, _variables, context) => settle(queryClient, context),
  })
}

export function useRemoveEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: LIBRARY_KEY,
    scope: LIBRARY_MUTATION_SCOPE,
    mutationFn: (gameId: string) => removeEntry(gameId),
    onMutate: (gameId) => optimistic(queryClient, { kind: 'remove', gameId }),
    onSuccess: (_data, gameId) => confirm(queryClient, (confirmed) => withoutEntry(confirmed, gameId)),
    onError: (_error, _variables, context) => fail(queryClient, context),
    onSettled: (_data, _error, _variables, context) => settle(queryClient, context),
  })
}
