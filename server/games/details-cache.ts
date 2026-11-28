import type { GameDetails } from '@contracts/game'

/** Where game details are kept between requests. Locally SQLite (GameDetailsCache); in the hosted demo, memory. */
export interface DetailsCache {
  /** The details, or null when there are none or they are older than `maxAgeMs`. */
  get(pageId: number, maxAgeMs: number): GameDetails | null
  set(pageId: number, details: GameDetails): void
}
