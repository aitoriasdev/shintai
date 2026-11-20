import type { LibraryEntry } from '@contracts/library'

export interface LibraryStats {
  total: number
  completed: number
  favorites: number
  /** Average of rated games, rounded to one decimal; null when nothing is rated. */
  averageScore: number | null
  completionRate: number
}

export function computeStats(entries: LibraryEntry[]): LibraryStats {
  const scores = entries.flatMap((entry) => (entry.score === null ? [] : [entry.score]))
  const completed = entries.filter((entry) => entry.completed).length
  return {
    total: entries.length,
    completed,
    favorites: entries.filter((entry) => entry.favorite).length,
    averageScore: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null,
    completionRate: entries.length ? Math.round((completed / entries.length) * 100) : 0,
  }
}
