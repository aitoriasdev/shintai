import type { GameDetails } from '@contracts/game'
import { inject, injectable } from 'tsyringe'
import { TOKENS, type Clock } from '../tokens'
import type { DetailsCache } from './details-cache'

/** Most entries kept; the oldest is dropped first. Bounds memory in a long-lived serverless instance. */
const MAX_ENTRIES = 500

/** In-memory details cache for the hosted demo, where functions have no persistent disk. */
@injectable()
export class MemoryDetailsCache implements DetailsCache {
  private readonly entries = new Map<number, { details: GameDetails; fetchedAt: number }>()

  constructor(@inject(TOKENS.Clock) private readonly clock: Clock) {}

  get(pageId: number, maxAgeMs: number): GameDetails | null {
    const entry = this.entries.get(pageId)
    return entry && entry.fetchedAt >= this.clock.now() - maxAgeMs ? entry.details : null
  }

  set(pageId: number, details: GameDetails): void {
    this.entries.delete(pageId)
    this.entries.set(pageId, { details, fetchedAt: this.clock.now() })
    if (this.entries.size > MAX_ENTRIES) this.entries.delete(this.entries.keys().next().value as number)
  }
}
