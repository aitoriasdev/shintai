import type { GameSummary } from '@contracts/game'
import { LIBRARY_BACKUP_VERSION, type EntryPatch, type ImportResult, type LibraryBackup, type LibraryEntry } from '@contracts/library'
import type { DatabaseSync } from 'node:sqlite'
import { inject, injectable } from 'tsyringe'
import { transaction } from '../database/database'
import { TOKENS, type Clock } from '../tokens'
import { LibraryRepository } from './library-repository'

@injectable()
export class LibraryService {
  constructor(
    @inject(LibraryRepository) private readonly repository: LibraryRepository,
    @inject(TOKENS.Database) private readonly db: DatabaseSync,
    @inject(TOKENS.Clock) private readonly clock: Clock,
  ) {}

  list(): LibraryEntry[] {
    return this.repository.list()
  }

  /** Adds the game to the library when missing, then applies `patch`. Refreshes the stored game snapshot. */
  upsert(game: GameSummary, patch: EntryPatch = {}): LibraryEntry {
    return transaction(this.db, () => {
      const now = this.clock.now()
      const existing = this.repository.find(game.id)
      const entry: LibraryEntry = {
        score: null,
        completed: false,
        favorite: false,
        addedAt: now,
        ...existing,
        ...patch,
        game,
        updatedAt: now,
      }
      this.repository.save(entry)
      return entry
    })
  }

  remove(gameId: string): boolean {
    return this.repository.delete(gameId)
  }

  exportBackup(): LibraryBackup {
    return { app: 'shintai', version: LIBRARY_BACKUP_VERSION, exportedAt: this.clock.now(), entries: this.repository.list() }
  }

  /** Merges a backup: unknown games are added, known ones are replaced only when the backup is newer. */
  importBackup(backup: LibraryBackup): ImportResult {
    return transaction(this.db, () => {
      const result: ImportResult = { added: 0, updated: 0, skipped: 0 }
      for (const incoming of backup.entries) {
        const existing = this.repository.find(incoming.game.id)
        if (!existing) result.added++
        else if (incoming.updatedAt > existing.updatedAt) result.updated++
        else {
          result.skipped++
          continue
        }
        this.repository.save(incoming)
      }
      return result
    })
  }
}
