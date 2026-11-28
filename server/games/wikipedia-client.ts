import type { GameDetails, GameSearchPage } from '@contracts/game'
import { inject, injectable } from 'tsyringe'
import { WIKIMEDIA_USER_AGENT } from '../http/wikimedia-user-agent'
import { TOKENS, type FetchFn } from '../tokens'
import { parseFacts, sortByRank, toGameSummary, type SparqlRow, type WikiPage } from './wikipedia-mappers'

export const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php'
export const WIKIDATA_SPARQL = 'https://query.wikidata.org/sparql'
export const SEARCH_PAGE_SIZE = 24

/** Wikimedia asks API clients to identify themselves. */

/** Only English Wikipedia articles that carry a video game infobox (~28k games). */
const GAME_FILTER = 'hastemplate:"Infobox video game"'

const BASE_PARAMS = { action: 'query', format: 'json', formatversion: '2' } as const

const RETRY_DELAY_MS = 300

/** Network failures, rate limiting and server errors are worth one more try. */
function isTransient(error: UpstreamError): boolean {
  return error.status === null || error.status === 429 || error.status >= 500
}

/** Wikimedia could not be reached or answered with an error. `status` is null for network failures. */
export class UpstreamError extends Error {
  constructor(
    readonly status: number | null,
    url: string,
    options?: { cause?: unknown },
  ) {
    super(`Upstream request failed (${status ?? 'network error'}): ${url}`, options)
    this.name = 'UpstreamError'
  }
}

export function buildSearchQuery(text: string, year?: number | null): string {
  // Quotes and backslashes would break the CirrusSearch keyword syntax appended below.
  const cleaned = text.replace(/["\\]/g, ' ').replace(/\s+/g, ' ').trim()
  return [cleaned, GAME_FILTER, year ? `incategory:"${year} video games"` : null].filter(Boolean).join(' ')
}

type Facts = Pick<GameDetails, 'releaseDate' | 'platforms' | 'genres' | 'developers' | 'publishers'>

export interface WikipediaArticle {
  extract: string | null
  coverUrl: string | null
  url: string | null
}

/** Thin client over the Wikipedia Action API and the Wikidata SPARQL endpoint. Keyless. */
@injectable()
export class WikipediaClient {
  constructor(@inject(TOKENS.Fetch) private readonly fetchFn: FetchFn) {}

  private async getJson<T>(base: string, params: Record<string, string | number | undefined>): Promise<T> {
    try {
      return await this.request<T>(base, params)
    } catch (error) {
      if (!(error instanceof UpstreamError) || !isTransient(error)) throw error
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
      return this.request<T>(base, params)
    }
  }

  private async request<T>(base: string, params: Record<string, string | number | undefined>): Promise<T> {
    const url = new URL(base)
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
    }
    let res: Response
    try {
      res = await this.fetchFn(url, {
        headers: { 'User-Agent': WIKIMEDIA_USER_AGENT, Accept: 'application/json' },
        signal: AbortSignal.timeout(10_000),
      })
    } catch (cause) {
      // DNS failures, connection timeouts, offline machine…
      throw new UpstreamError(null, url.toString(), { cause })
    }
    if (!res.ok) throw new UpstreamError(res.status, url.toString())
    return (await res.json()) as T
  }

  /** With empty text it browses the catalogue by relevance, surfacing notable games first. */
  async searchGames(params: { text: string; year?: number | null; offset?: number }): Promise<GameSearchPage> {
    const data = await this.getJson<{ continue?: { gsroffset?: number }; query?: { pages?: WikiPage[] } }>(
      WIKIPEDIA_API,
      {
        ...BASE_PARAMS,
        generator: 'search',
        gsrsearch: buildSearchQuery(params.text, params.year),
        gsrlimit: SEARCH_PAGE_SIZE,
        gsroffset: params.offset || undefined,
        prop: 'pageimages|description|pageprops',
        ppprop: 'wikibase_item',
        piprop: 'thumbnail',
        pithumbsize: 400,
        pilicense: 'any',
        pilimit: SEARCH_PAGE_SIZE,
      },
    )
    return {
      games: sortByRank(data.query?.pages ?? []).map(toGameSummary),
      nextOffset: data.continue?.gsroffset ?? null,
    }
  }

  async getArticle(pageId: number): Promise<WikipediaArticle | null> {
    const data = await this.getJson<{ query?: { pages?: WikiPage[] } }>(WIKIPEDIA_API, {
      ...BASE_PARAMS,
      pageids: pageId,
      prop: 'extracts|pageimages|info',
      exintro: 1,
      explaintext: 1,
      piprop: 'thumbnail',
      pithumbsize: 800,
      pilicense: 'any',
      inprop: 'url',
    })
    const page = data.query?.pages?.[0]
    if (!page || page.missing) return null
    return { extract: page.extract?.trim() || null, coverUrl: page.thumbnail?.source ?? null, url: page.fullurl ?? null }
  }

  /** Release date, platforms, genres, developers and publishers from Wikidata. `qid` must be a validated Q-id. */
  async getFacts(qid: string): Promise<Facts> {
    const query = `SELECT ?kind ?valueLabel ?time ?precision WHERE {
  { VALUES (?kind ?prop) { ("platform" wdt:P400) ("genre" wdt:P136) ("developer" wdt:P178) ("publisher" wdt:P123) }
    wd:${qid} ?prop ?value . }
  UNION
  { wd:${qid} p:P577/psv:P577 [ wikibase:timeValue ?time ; wikibase:timePrecision ?precision ] . BIND("released" AS ?kind) }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,mul". }
}`
    const data = await this.getJson<{ results: { bindings: SparqlRow[] } }>(WIKIDATA_SPARQL, { query, format: 'json' })
    return parseFacts(data.results.bindings)
  }
}
