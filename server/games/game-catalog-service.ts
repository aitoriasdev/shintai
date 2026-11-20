import type { GameDetails, GameSearchPage, GameSearchQuery } from '@contracts/game'
import { inject, injectable } from 'tsyringe'
import type { AppConfig } from '../config'
import { TOKENS } from '../tokens'
import { GameDetailsCache } from './game-details-cache'
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
    @inject(GameDetailsCache) private readonly cache: GameDetailsCache,
    @inject(TOKENS.Config) private readonly config: AppConfig,
  ) {}

  search(query: GameSearchQuery): Promise<GameSearchPage> {
    return this.wikipedia.searchGames({ text: query.q, year: query.year, offset: query.offset })
  }

  /** Wikipedia intro + large cover, enriched with Wikidata facts when a Q-id is known. Cached in SQLite. */
  async getDetails(pageId: number, qid?: string): Promise<GameDetails> {
    const cached = this.cache.get(pageId, this.config.detailsTtlMs)
    if (cached) return cached

    const [article, facts] = await Promise.all([
      this.wikipedia.getArticle(pageId),
      // Facts are a best-effort enrichment: never fail the request because of Wikidata.
      qid && isQid(qid) ? this.wikipedia.getFacts(qid).catch(() => null) : Promise.resolve(EMPTY_FACTS),
    ])
    if (!article) throw new GameNotFoundError(pageId)

    const details: GameDetails = {
      extract: article.extract,
      coverUrl: article.coverUrl,
      wikipediaUrl: article.url ?? `https://en.wikipedia.org/?curid=${pageId}`,
      ...(facts ?? EMPTY_FACTS),
    }
    // Do not cache partial results, so a transient Wikidata failure heals on the next visit.
    if (facts) this.cache.set(pageId, details)
    return details
  }
}
