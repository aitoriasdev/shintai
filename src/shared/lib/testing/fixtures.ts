import type { GameSummary } from '@contracts/game'
import type { LibraryEntry } from '@contracts/library'

export function makeGame(overrides: Partial<GameSummary> = {}): GameSummary {
  return {
    id: 'Q1',
    pageId: 1,
    title: 'Celeste',
    wikiTitle: 'Celeste (video game)',
    description: '2018 video game',
    coverUrl: null,
    year: 2018,
    ...overrides,
  }
}

export function makeEntry(overrides: Partial<LibraryEntry> = {}): LibraryEntry {
  return {
    game: makeGame(),
    score: null,
    completed: false,
    favorite: false,
    addedAt: 1,
    updatedAt: 1,
    ...overrides,
  }
}
