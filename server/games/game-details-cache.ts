import type { GameDetails } from '@contracts/game'
import type { DatabaseSync } from 'node:sqlite'
import { inject, injectable } from 'tsyringe'
import { TOKENS, type Clock } from '../tokens'

/** SQLite-backed cache so game details are fetched from Wikimedia only once in a while. */
@injectable()
export class GameDetailsCache {
  constructor(
    @inject(TOKENS.Database) private readonly db: DatabaseSync,
    @inject(TOKENS.Clock) private readonly clock: Clock,
  ) {}

  get(pageId: number, maxAgeMs: number): GameDetails | null {
    const row = this.db
      .prepare('SELECT payload FROM game_details_cache WHERE page_id = ? AND fetched_at >= ?')
      .get(pageId, this.clock.now() - maxAgeMs) as { payload: string } | undefined
    return row ? (JSON.parse(row.payload) as GameDetails) : null
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
