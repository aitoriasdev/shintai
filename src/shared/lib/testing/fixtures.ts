import { PROBLEM_CONTENT_TYPE, PROBLEM_TYPE_BASE, PROBLEM_TYPES, type Problem, type ProblemSlug } from '@contracts/problem'
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

/** An RFC 9457 error response, as the API sends it. */
export function problemResponse(slug: ProblemSlug, overrides: Partial<Problem> = {}) {
  const { status, title } = PROBLEM_TYPES[slug]
  return new Response(JSON.stringify({ type: PROBLEM_TYPE_BASE + slug, status, title, ...overrides }), {
    status,
    headers: { 'Content-Type': PROBLEM_CONTENT_TYPE },
  })
}
