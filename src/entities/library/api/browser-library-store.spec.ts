import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { makeEntry, makeGame } from '@/shared/lib/testing/fixtures'
import { InvalidBackupError } from '../lib/invalid-backup-error'
import { browserLibraryStore as store, LIBRARY_STORAGE_KEY } from './browser-library-store'

beforeEach(() => localStorage.removeItem(LIBRARY_STORAGE_KEY))
afterEach(() => {
  localStorage.removeItem(LIBRARY_STORAGE_KEY)
  vi.restoreAllMocks()
})

it('adds, updates and removes games, keeping them in the browser', async () => {
  const celeste = makeGame()
  const hades = makeGame({ id: 'Q2', pageId: 2, title: 'Hades', wikiTitle: 'Hades (video game)' })
  vi.spyOn(Date, 'now').mockReturnValueOnce(1).mockReturnValueOnce(2).mockReturnValueOnce(3)

  await store.upsert(celeste, { favorite: true })
  await store.upsert(hades, { score: 9 })
  const updated = await store.upsert(celeste, { completed: true })

  expect(updated).toMatchObject({ favorite: true, completed: true, addedAt: 1, updatedAt: 3 })
  expect((await store.list()).map((entry) => entry.game.title)).toEqual(['Hades', 'Celeste'])
  expect(JSON.parse(localStorage.getItem(LIBRARY_STORAGE_KEY) ?? '[]')).toHaveLength(2)

  await store.remove(celeste.id)
  expect((await store.list()).map((entry) => entry.game.title)).toEqual(['Hades'])
})

it('merges a backup like the API: new games added, newer ones updated, the rest skipped', async () => {
  const kept = makeEntry({ game: makeGame({ id: 'Q1' }), updatedAt: 10 })
  const older = makeEntry({ game: makeGame({ id: 'Q2', pageId: 2 }), updatedAt: 10, score: 3 })
  localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify([kept, older]))

  const result = await store.importBackup({
    app: 'shintai',
    version: 1,
    exportedAt: 20,
    entries: [{ ...kept, updatedAt: 5 }, { ...older, updatedAt: 20, score: 8 }, makeEntry({ game: makeGame({ id: 'Q3', pageId: 3 }) })],
  })

  expect(result).toEqual({ added: 1, updated: 1, skipped: 1 })
  const byId = Object.fromEntries((await store.list()).map((entry) => [entry.game.id, entry]))
  expect(byId.Q1.updatedAt).toBe(10)
  expect(byId.Q2.score).toBe(8)
  expect(byId.Q3).toBeDefined()
})

it('imports nothing from a backup with an invalid entry', async () => {
  const backup = { app: 'shintai' as const, version: 1 as const, exportedAt: 1, entries: [makeEntry(), makeEntry({ score: 99 })] }
  await expect(store.importBackup(backup)).rejects.toBeInstanceOf(InvalidBackupError)
  expect(await store.list()).toEqual([])
})

it('exports every entry as a Shintai backup', async () => {
  await store.upsert(makeGame(), { favorite: true })
  const backup = await store.exportBackup()
  expect(backup).toMatchObject({ app: 'shintai', version: 1 })
  expect(backup.entries).toHaveLength(1)
})

it('starts empty, and says so, when what the browser stored is not a library', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify([{ not: 'an entry' }]))
  expect(await store.list()).toEqual([])
  expect(warn).toHaveBeenCalledOnce()
})
