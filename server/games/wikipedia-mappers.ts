import type { GameDetails, GameSummary } from '@contracts/game'

/** Page shape returned by the MediaWiki Action API (formatversion=2). */
export interface WikiPage {
  pageid: number
  title: string
  index?: number
  description?: string
  extract?: string
  fullurl?: string
  missing?: boolean
  thumbnail?: { source: string; width: number; height: number }
  pageprops?: { wikibase_item?: string }
}

export interface SparqlRow {
  kind: { value: string }
  valueLabel?: { value: string }
  time?: { value: string }
  precision?: { value: string }
}

const DISAMBIGUATION = /\s*\((?:[^()]*\b(?:video )?games?\b[^()]*)\)$/i
const YEAR = /\b(19[5-9]\d|20\d{2})\b/
const QID = /^Q\d+$/

/** "Celeste (video game)" → "Celeste", "Doom (1993 video game)" → "Doom". */
export function cleanTitle(title: string): string {
  return title.replace(DISAMBIGUATION, '').trim() || title
}

export function extractYear(...texts: Array<string | null | undefined>): number | null {
  for (const text of texts) {
    const match = text?.match(YEAR)
    if (match) return Number(match[1])
  }
  return null
}

export function isQid(value: string): boolean {
  return QID.test(value)
}

export function toGameSummary(page: WikiPage): GameSummary {
  const qid = page.pageprops?.wikibase_item
  return {
    id: qid && isQid(qid) ? qid : `enwiki:${page.pageid}`,
    pageId: page.pageid,
    title: cleanTitle(page.title),
    wikiTitle: page.title,
    description: page.description ?? null,
    coverUrl: page.thumbnail?.source ?? null,
    year: extractYear(page.description, page.title),
  }
}

/** Generator pages come back unordered; `index` holds the search rank. */
export function sortByRank(pages: WikiPage[]): WikiPage[] {
  return [...pages].sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
}

/** "role-playing video game" → "Role-playing", "action-adventure game" → "Action-adventure". */
export function formatGenre(label: string): string {
  const trimmed = label.replace(/\s+(?:video\s+)?game$/i, '').trim() || label
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

/**
 * Turns a Wikidata time into an ISO 8601 date that is only as precise as Wikidata is (9 = year, 10 = month,
 * 11 = day): `2017`, `2017-03` or `2017-03-03`. The UI formats it in the user's language.
 */
export function toIsoReleaseDate(time: string, precision: number): string | null {
  const match = time.match(/^\+?(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null
  const [, year, month, day] = match
  if (precision <= 9 || month === '00') return year
  if (precision === 10 || day === '00') return `${year}-${month}`
  return `${year}-${month}-${day}`
}

type Facts = Pick<GameDetails, 'releaseDate' | 'platforms' | 'genres' | 'developers' | 'publishers'>

export function parseFacts(rows: SparqlRow[]): Facts {
  const sets = { platform: new Set<string>(), genre: new Set<string>(), developer: new Set<string>(), publisher: new Set<string>() }
  let earliest: { time: string; precision: number } | null = null

  for (const row of rows) {
    const kind = row.kind.value
    if (kind === 'released' && row.time) {
      const candidate = { time: row.time.value, precision: Number(row.precision?.value ?? 9) }
      if (!earliest || candidate.time < earliest.time) earliest = candidate
      continue
    }
    const label = row.valueLabel?.value
    // Items without an English label come back as their raw Q-id: skip them.
    if (!label || isQid(label) || !(kind in sets)) continue
    sets[kind as keyof typeof sets].add(kind === 'genre' ? formatGenre(label) : label)
  }

  return {
    releaseDate: earliest ? toIsoReleaseDate(earliest.time, earliest.precision) : null,
    platforms: [...sets.platform],
    genres: [...sets.genre],
    developers: [...sets.developer],
    publishers: [...sets.publisher],
  }
}
