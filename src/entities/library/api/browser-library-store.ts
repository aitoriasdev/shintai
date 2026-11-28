import type { ImportResult, LibraryBackup, LibraryEntry } from '@contracts/library'
import { applyPatch, withoutEntry } from '../lib/apply-patch'
import { InvalidBackupError } from '../lib/invalid-backup-error'
import { isLibraryBackup, isLibraryEntry } from '../lib/is-library-backup'
import type { LibraryStore } from './library-store'

export const LIBRARY_STORAGE_KEY = 'shintai.library'

function read(): LibraryEntry[] {
  const raw = localStorage.getItem(LIBRARY_STORAGE_KEY)
  if (raw === null) return []
  const stored: unknown = JSON.parse(raw)
  if (Array.isArray(stored) && stored.every(isLibraryEntry)) return stored
  console.warn('The library saved in this browser is not readable; starting with an empty one.', stored)
  return []
}

/** Throws when the browser refuses to store (private mode, full quota): the UI rolls back and reports it. */
function write(entries: LibraryEntry[]): void {
  localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(entries))
}

const byNewestAdded = (a: LibraryEntry, b: LibraryEntry) => b.addedAt - a.addedAt

/** The library in the visitor's browser (`localStorage`), for the hosted demo. Same behaviour as the local API. */
export const browserLibraryStore: LibraryStore = {
  async list() {
    return read().sort(byNewestAdded)
  },
  async upsert(game, patch) {
    const entries = applyPatch(read(), game, patch, Date.now())
    write(entries)
    return entries.find((entry) => entry.game.id === game.id) as LibraryEntry
  },
  async remove(gameId) {
    write(withoutEntry(read(), gameId))
  },
  async exportBackup(): Promise<LibraryBackup> {
    return { app: 'shintai', version: 1, exportedAt: Date.now(), entries: read().sort(byNewestAdded) }
  },
  async importBackup(backup) {
    if (!isLibraryBackup(backup)) throw new InvalidBackupError()
    const byId = new Map(read().map((entry) => [entry.game.id, entry]))
    const result: ImportResult = { added: 0, updated: 0, skipped: 0 }
    for (const incoming of backup.entries) {
      const existing = byId.get(incoming.game.id)
      if (!existing) result.added++
      else if (incoming.updatedAt > existing.updatedAt) result.updated++
      else {
        result.skipped++
        continue
      }
      byId.set(incoming.game.id, incoming)
    }
    write([...byId.values()])
    return result
  },
}
