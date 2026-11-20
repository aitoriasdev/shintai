import { z } from 'zod'

/** Minimal, stable snapshot of a game. Persisted inside library entries. */
export const gameSummarySchema = z.object({
  /** Wikidata Q-id when available (e.g. `Q17185964`), otherwise `enwiki:<pageId>`. */
  id: z.string().regex(/^(Q\d+|enwiki:\d+)$/),
  /** English Wikipedia page id. */
  pageId: z.number().int().positive(),
  /** Display title, without disambiguation suffixes like "(video game)". */
  title: z.string().min(1).max(300),
  /** Raw Wikipedia page title. */
  wikiTitle: z.string().min(1).max(300),
  description: z.string().max(500).nullable(),
  coverUrl: z.url().nullable(),
  year: z.number().int().nullable(),
})

export type GameSummary = z.infer<typeof gameSummarySchema>

/** Rich, on-demand information about a game. */
export interface GameDetails {
  extract: string | null
  coverUrl: string | null
  wikipediaUrl: string
  releaseDate: string | null
  platforms: string[]
  genres: string[]
  developers: string[]
  publishers: string[]
}

export interface GameSearchPage {
  games: GameSummary[]
  /** Offset for the next page, or null when there are no more results. */
  nextOffset: number | null
}

export const gameSearchQuerySchema = z.object({
  q: z.string().max(200).default(''),
  year: z.coerce.number().int().min(1950).max(2100).optional(),
  offset: z.coerce.number().int().min(0).max(9_999).default(0),
})

export type GameSearchQuery = z.infer<typeof gameSearchQuerySchema>
