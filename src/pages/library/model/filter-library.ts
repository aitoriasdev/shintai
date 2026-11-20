import type { LibraryEntry } from '@contracts/library'

export type StatusFilter = 'all' | 'favorites' | 'completed' | 'pending'
export type SortKey = 'recent' | 'title' | 'score' | 'year'

export interface LibraryFilters {
  text: string
  status: StatusFilter
  sort: SortKey
}

export const DEFAULT_FILTERS: LibraryFilters = { text: '', status: 'all', sort: 'recent' }

const matchesStatus: Record<StatusFilter, (entry: LibraryEntry) => boolean> = {
  all: () => true,
  favorites: (entry) => entry.favorite,
  completed: (entry) => entry.completed,
  pending: (entry) => !entry.completed,
}

const byTitle = (a: LibraryEntry, b: LibraryEntry) => a.game.title.localeCompare(b.game.title, undefined, { sensitivity: 'base' })

/** Nulls always sink to the bottom; ties fall back to title order. */
const comparators: Record<SortKey, (a: LibraryEntry, b: LibraryEntry) => number> = {
  recent: (a, b) => b.addedAt - a.addedAt,
  title: byTitle,
  score: (a, b) => (b.score ?? -1) - (a.score ?? -1) || byTitle(a, b),
  year: (a, b) => (b.game.year ?? -Infinity) - (a.game.year ?? -Infinity) || byTitle(a, b),
}

function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

export function filterLibrary(entries: LibraryEntry[], { text, status, sort }: LibraryFilters): LibraryEntry[] {
  const query = normalize(text)
  return entries
    .filter((entry) => matchesStatus[status](entry) && (!query || normalize(entry.game.title).includes(query)))
    .sort(comparators[sort])
}
