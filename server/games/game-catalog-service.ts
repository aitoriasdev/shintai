import type { GameDetails, GameSearchPage, GameSearchQuery } from '@contracts/game'
import { inject, injectable } from 'tsyringe'
import type { AppConfig } from '../config'
import { TOKENS } from '../tokens'
import type { DetailsCache } from './details-cache'
import { WikipediaClient } from './wikipedia-client'
import { isQid } from './wikipedia-mappers'

const EMPTY_FACTS = { releaseDate: null, platforms: [], genres: [], developers: [], publishers: [] }

export class GameNotFoundError extends Error {
  constructor(pageId: number) {
    super(`Game ${pageId} was not found`)
    this.name = 'GameNotFoundError'
  }
}

@injectable()
export class GameCatalogService {
  constructor(
    @inject(WikipediaClient) private readonly wikipedia: WikipediaClient,
    @inject(TOKENS.DetailsCache) private readonly cache: DetailsCache,
    @inject(TOKENS.Config) private readonly config: AppConfig,
  ) {}

  search(query: GameSearchQuery): Promise<GameSearchPage> {
    return this.wikipedia.searchGames({ text: query.q, year: query.year, offset: query.offset })
  }

  /**
   * Wikipedia intro + large cover, enriched with Wikidata facts when a Q-id is known.
   * Only complete results (article + Wikidata facts) are cached in SQLite.
   */
  async getDetails(pageId: number, qid?: string): Promise<GameDetails> {
    const cached = this.cache.get(pageId, this.config.detailsTtlMs)
    if (cached) return cached

    const [article, facts] = await Promise.all([
      this.wikipedia.getArticle(pageId),
      // Facts are a best-effort enrichment: never fail the request because of Wikidata.
      qid && isQid(qid) ? this.wikipedia.getFacts(qid).catch(() => null) : Promise.resolve(null),
    ])
    if (!article) throw new GameNotFoundError(pageId)

    const details: GameDetails = {
      extract: article.extract,
      coverUrl: article.coverUrl,
      wikipediaUrl: article.url ?? `https://en.wikipedia.org/?curid=${pageId}`,
      ...(facts ?? EMPTY_FACTS),
    }
    // Without facts (no Q-id given, or Wikidata failed) the result is partial: don't cache it, so a
    // later request with a Q-id, or after Wikidata recovers, gets the full details.
    if (facts) this.cache.set(pageId, details)
    return details
  }
}
