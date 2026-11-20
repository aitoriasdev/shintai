import type { GameSummary } from '@contracts/game'
import type { EntryPatch, ImportResult, LibraryBackup, LibraryEntry } from '@contracts/library'
import { apiRequest } from '@/shared/api/api-client'

export const LIBRARY_BACKUP_URL = '/api/library/backup'

export const fetchLibrary = (signal?: AbortSignal) => apiRequest<LibraryEntry[]>('/api/library', { signal })

export const upsertEntry = (game: GameSummary, patch: EntryPatch) =>
  apiRequest<LibraryEntry>(`/api/library/${encodeURIComponent(game.id)}`, { method: 'PUT', body: { game, patch } })

export const removeEntry = (gameId: string) =>
  apiRequest<void>(`/api/library/${encodeURIComponent(gameId)}`, { method: 'DELETE' })

export const importBackup = (backup: LibraryBackup) =>
  apiRequest<ImportResult>(LIBRARY_BACKUP_URL, { method: 'POST', body: backup })
