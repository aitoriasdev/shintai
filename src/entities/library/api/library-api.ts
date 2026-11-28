import type { GameSummary } from '@contracts/game'
import type { EntryPatch, LibraryBackup } from '@contracts/library'
import { IS_DEMO } from '@/shared/config/deployment'
import { apiLibraryStore } from './api-library-store'
import { browserLibraryStore } from './browser-library-store'
import type { LibraryStore } from './library-store'

/** The local app keeps the library in the API; the hosted demo in each visitor's browser. */
const store: LibraryStore = IS_DEMO ? browserLibraryStore : apiLibraryStore

export const fetchLibrary = (signal?: AbortSignal) => store.list(signal)
export const upsertEntry = (game: GameSummary, patch: EntryPatch) => store.upsert(game, patch)
export const removeEntry = (gameId: string) => store.remove(gameId)
export const exportBackup = () => store.exportBackup()
export const importBackup = (backup: LibraryBackup) => store.importBackup(backup)
