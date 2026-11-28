import type { GameDetails } from '@contracts/game'
import { expect, it } from 'vitest'
import { MemoryDetailsCache } from './memory-details-cache'

const details = (extract: string): GameDetails => ({
  extract,
  coverUrl: null,
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Celeste_(video_game)',
  releaseDate: '2018-01-25',
  platforms: [],
  genres: [],
  developers: [],
  publishers: [],
})

it('returns details while they are fresh', () => {
  let now = 1_000
  const cache = new MemoryDetailsCache({ now: () => now })
  cache.set(1, details('Celeste'))
  expect(cache.get(1, 500)?.extract).toBe('Celeste')
  now = 2_000
  expect(cache.get(1, 500)).toBeNull()
})

it('keeps at most 500 games, dropping the oldest first', () => {
  const cache = new MemoryDetailsCache({ now: () => 0 })
  for (let pageId = 1; pageId <= 501; pageId++) cache.set(pageId, details(String(pageId)))
  expect(cache.get(1, 1)).toBeNull()
  expect(cache.get(2, 1)?.extract).toBe('2')
  expect(cache.get(501, 1)?.extract).toBe('501')
})
