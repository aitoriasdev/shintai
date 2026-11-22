import type { GameDetails } from '@contracts/game'
import { afterEach, expect, it, vi } from 'vitest'
import { openDatabase } from '../database/database'
import { GameDetailsCache } from './game-details-cache'

const HOUR = 60 * 60 * 1000

const DETAILS: GameDetails = {
  extract: 'A mountain-climbing platformer.',
  coverUrl: null,
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Celeste_(video_game)',
  releaseDate: '2018-01-25',
  platforms: ['Windows'],
  genres: ['Platformer'],
  developers: ['Maddy Makes Games'],
  publishers: [],
}

function setup() {
  const db = openDatabase(':memory:')
  const clock = { now: () => 10 * HOUR }
  return { db, clock, cache: new GameDetailsCache(db, clock) }
}

afterEach(() => vi.restoreAllMocks())

it('returns details while they are fresh', () => {
  const { cache, clock } = setup()
  cache.set(1, DETAILS)
  expect(cache.get(1, HOUR)).toEqual(DETAILS)

  clock.now = () => 12 * HOUR
  expect(cache.get(1, HOUR)).toBeNull()
})

it('treats details cached in an older shape of the contract as missing, and says why', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  const { cache, db } = setup()
  // Before release dates became ISO 8601, the API cached them already formatted in English.
  const old = { ...DETAILS, releaseDate: 'January 25, 2018' }
  db.prepare('INSERT INTO game_details_cache (page_id, payload, fetched_at) VALUES (?, ?, ?)').run(1, JSON.stringify(old), 10 * HOUR)

  expect(cache.get(1, HOUR)).toBeNull()
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('page 1 no longer match the contract'), expect.stringContaining('releaseDate'))
})
