import type { GameSummary } from '@contracts/game'
import type { EntryPatch, LibraryEntry } from '@contracts/library'

/** Client-side mirror of the server upsert, used for optimistic updates. */
export function applyPatch(entries: LibraryEntry[], game: GameSummary, patch: EntryPatch, now: number): LibraryEntry[] {
  const index = entries.findIndex((entry) => entry.game.id === game.id)
  if (index === -1) {
    return [{ game, score: null, completed: false, favorite: false, addedAt: now, updatedAt: now, ...patch }, ...entries]
  }
  const next = [...entries]
  next[index] = { ...entries[index], ...patch, game, updatedAt: now }
  return next
}

export function withoutEntry(entries: LibraryEntry[], gameId: string): LibraryEntry[] {
  return entries.filter((entry) => entry.game.id !== gameId)
}
