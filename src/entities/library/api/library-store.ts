import type { GameSummary } from '@contracts/game'
import type { EntryPatch, ImportResult, LibraryBackup, LibraryEntry } from '@contracts/library'

/** Where the library is kept: the local API (SQLite) or, in the hosted demo, the visitor's browser. */
export interface LibraryStore {
  /** Every entry, most recently added first. */
  list(signal?: AbortSignal): Promise<LibraryEntry[]>
  /** Adds the game when missing, then applies `patch`. */
  upsert(game: GameSummary, patch: EntryPatch): Promise<LibraryEntry>
  remove(gameId: string): Promise<void>
  exportBackup(): Promise<LibraryBackup>
  /** Merges a backup: unknown games are added, known ones replaced only when the backup is newer. */
  importBackup(backup: LibraryBackup): Promise<ImportResult>
}
