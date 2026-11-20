import type { GameSummary } from '@contracts/game'
import type { LibraryEntry } from '@contracts/library'
import { beforeEach, describe, expect, it } from 'vitest'
import { createTestContainer, type TestClock } from '../testing/create-test-container'
import { LibraryService } from './library-service'

const celeste: GameSummary = {
  id: 'Q1',
  pageId: 1,
  title: 'Celeste',
  wikiTitle: 'Celeste (video game)',
  description: '2018 video game',
  coverUrl: 'https://upload.wikimedia.org/c.jpg',
  year: 2018,
}
const hades: GameSummary = { ...celeste, id: 'Q2', pageId: 2, title: 'Hades', wikiTitle: 'Hades (video game)' }

let service: LibraryService
let clock: TestClock

beforeEach(() => {
  const test = createTestContainer()
  service = test.container.resolve(LibraryService)
  clock = test.clock
})

describe('upsert', () => {
  it('adds a game with defaults', () => {
    const entry = service.upsert(celeste)
    expect(entry).toEqual({ game: celeste, score: null, completed: false, favorite: false, addedAt: clock.now(), updatedAt: clock.now() })
    expect(service.list()).toEqual([entry])
  })

  it('applies patches, keeping addedAt and untouched fields', () => {
    const added = service.upsert(celeste, { favorite: true })
    clock.advance(1000)
    const updated = service.upsert(celeste, { score: 9 })

    expect(updated).toMatchObject({ favorite: true, score: 9, completed: false, addedAt: added.addedAt, updatedAt: added.addedAt + 1000 })
    expect(service.list()).toEqual([updated])
  })

  it('clears the score with null', () => {
    service.upsert(celeste, { score: 7 })
    expect(service.upsert(celeste, { score: null }).score).toBeNull()
  })

  it('lists the most recently added first', () => {
    service.upsert(celeste)
    clock.advance(1)
    service.upsert(hades)
    expect(service.list().map((e) => e.game.title)).toEqual(['Hades', 'Celeste'])
  })
})

it('remove deletes the entry and reports whether it existed', () => {
  service.upsert(celeste)
  expect(service.remove('Q1')).toBe(true)
  expect(service.remove('Q1')).toBe(false)
  expect(service.list()).toEqual([])
})

describe('backups', () => {
  const entry = (game: GameSummary, updatedAt: number, patch: Partial<LibraryEntry> = {}): LibraryEntry => ({
    game,
    score: null,
    completed: false,
    favorite: false,
    addedAt: 0,
    updatedAt,
    ...patch,
  })

  it('round-trips through export and import', () => {
    service.upsert(celeste, { score: 8, completed: true })
    const backup = service.exportBackup()

    const other = createTestContainer().container.resolve(LibraryService)
    expect(other.importBackup(backup)).toEqual({ added: 1, updated: 0, skipped: 0 })
    expect(other.list()).toEqual(backup.entries)
  })

  it('only overwrites entries when the backup is newer', () => {
    clock.set(100)
    service.upsert(celeste, { score: 5 })
    service.upsert(hades, { score: 5 })

    const result = service.importBackup({
      app: 'shintai',
      version: 1,
      exportedAt: 0,
      entries: [entry(celeste, 50, { score: 1 }), entry(hades, 200, { score: 10 }), entry({ ...celeste, id: 'Q3', pageId: 3 }, 1)],
    })

    expect(result).toEqual({ added: 1, updated: 1, skipped: 1 })
    const scores = Object.fromEntries(service.list().map((e) => [e.game.id, e.score]))
    expect(scores).toEqual({ Q1: 5, Q2: 10, Q3: null })
  })
})
