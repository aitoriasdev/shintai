import type { LibraryBackup, LibraryEntry } from '@contracts/library'

// Mirrors `libraryBackupSchema` in contracts/library.ts: the browser has no Zod (the UI imports contract types only),
// and the hosted demo has no API to validate an imported backup.

const isInt = (value: unknown, min = -Infinity, max = Infinity): value is number =>
  Number.isInteger(value) && (value as number) >= min && (value as number) <= max
const isText = (value: unknown, max: number, min = 0): value is string =>
  typeof value === 'string' && value.length >= min && value.length <= max
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

function isGameSummary(game: unknown): boolean {
  if (!isRecord(game)) return false
  return (
    isText(game.id, 100) &&
    /^(Q\d+|enwiki:\d+)$/.test(game.id) &&
    isInt(game.pageId, 1) &&
    isText(game.title, 300, 1) &&
    isText(game.wikiTitle, 300, 1) &&
    (game.description === null || isText(game.description, 500)) &&
    (game.coverUrl === null || (typeof game.coverUrl === 'string' && URL.canParse(game.coverUrl))) &&
    (game.year === null || isInt(game.year))
  )
}

export function isLibraryEntry(entry: unknown): entry is LibraryEntry {
  if (!isRecord(entry)) return false
  return (
    isGameSummary(entry.game) &&
    (entry.score === null || isInt(entry.score, 1, 10)) &&
    typeof entry.completed === 'boolean' &&
    typeof entry.favorite === 'boolean' &&
    isInt(entry.addedAt, 0) &&
    isInt(entry.updatedAt, 0)
  )
}

export function isLibraryBackup(backup: unknown): backup is LibraryBackup {
  return (
    isRecord(backup) &&
    backup.app === 'shintai' &&
    backup.version === 1 &&
    isInt(backup.exportedAt) &&
    Array.isArray(backup.entries) &&
    backup.entries.length <= 100_000 &&
    backup.entries.every(isLibraryEntry)
  )
}
