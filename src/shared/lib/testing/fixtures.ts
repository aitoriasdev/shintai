import type { GameSummary } from '@contracts/game'

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
