import { type GameDetails, gameDetailsSchema } from '@contracts/game'
import type { DatabaseSync } from 'node:sqlite'
import { inject, injectable } from 'tsyringe'
import { z } from 'zod'
import { TOKENS, type Clock } from '../tokens'
import type { DetailsCache } from './details-cache'

/** SQLite-backed details cache (the local app), so game details are fetched from Wikimedia only once in a while. */
@injectable()
export class GameDetailsCache implements DetailsCache {
  constructor(
    @inject(TOKENS.Database) private readonly db: DatabaseSync,
    @inject(TOKENS.Clock) private readonly clock: Clock,
  ) {}

  /**
   * The cached details, or null when there are none, they are too old, or they were written in an older
   * shape of the contract (they are then fetched again and overwritten).
   */
  get(pageId: number, maxAgeMs: number): GameDetails | null {
    const row = this.db
      .prepare('SELECT payload FROM game_details_cache WHERE page_id = ? AND fetched_at >= ?')
      .get(pageId, this.clock.now() - maxAgeMs) as { payload: string } | undefined
    if (!row) return null
    const cached = gameDetailsSchema.safeParse(JSON.parse(row.payload))
    if (cached.success) return cached.data
    console.warn(`Cached details for page ${pageId} no longer match the contract; fetching them again.`, z.prettifyError(cached.error))
    return null
  }

  set(pageId: number, details: GameDetails): void {
    this.db
      .prepare(
        `INSERT INTO game_details_cache (page_id, payload, fetched_at) VALUES (?, ?, ?)
         ON CONFLICT (page_id) DO UPDATE SET payload = excluded.payload, fetched_at = excluded.fetched_at`,
      )
      .run(pageId, JSON.stringify(details), this.clock.now())
  }
}
