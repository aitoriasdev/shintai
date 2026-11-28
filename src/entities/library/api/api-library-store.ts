import type { ImportResult, LibraryBackup, LibraryEntry } from '@contracts/library'
import { apiRequest } from '@/shared/api/api-client'
import type { LibraryStore } from './library-store'

const BACKUP_PATH = '/api/library/backup'

/** The library in the local API's SQLite database. */
export const apiLibraryStore: LibraryStore = {
  list: (signal) => apiRequest<LibraryEntry[]>('/api/library', { signal }),
  upsert: (game, patch) => apiRequest<LibraryEntry>(`/api/library/${encodeURIComponent(game.id)}`, { method: 'PUT', body: { game, patch } }),
  remove: (gameId) => apiRequest<void>(`/api/library/${encodeURIComponent(gameId)}`, { method: 'DELETE' }),
  exportBackup: () => apiRequest<LibraryBackup>(BACKUP_PATH),
  importBackup: (backup) => apiRequest<ImportResult>(BACKUP_PATH, { method: 'POST', body: backup }),
}
