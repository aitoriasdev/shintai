import { gameDetailsSchema } from '@contracts/game'
import { describe, expect, it } from 'vitest'
import { cleanTitle, extractYear, formatGenre, parseFacts, sortByRank, toGameSummary, toIsoReleaseDate } from './wikipedia-mappers'

describe('cleanTitle', () => {
  it.each([
    ['Celeste (video game)', 'Celeste'],
    ['Doom (1993 video game)', 'Doom'],
    ['Prey (2017 game)', 'Prey'],
    ['The Legend of Zelda: Breath of the Wild', 'The Legend of Zelda: Breath of the Wild'],
    ['Mercury (planet)', 'Mercury (planet)'],
  ])('%s → %s', (input, expected) => {
    expect(cleanTitle(input)).toBe(expected)
  })
})

describe('extractYear', () => {
  it('reads the first plausible year from the given texts', () => {
    expect(extractYear('2017 action-adventure video game')).toBe(2017)
    expect(extractYear(null, 'Doom (1993 video game)')).toBe(1993)
    expect(extractYear('Video game series')).toBeNull()
  })
})

describe('toGameSummary', () => {
  it('prefers the Wikidata id and cleans the title', () => {
    const game = toGameSummary({
      pageid: 1,
      title: 'Celeste (video game)',
      description: '2018 video game',
      thumbnail: { source: 'https://img/c.jpg', width: 1, height: 1 },
      pageprops: { wikibase_item: 'Q42' },
    })
    expect(game).toEqual({
      id: 'Q42',
      pageId: 1,
      title: 'Celeste',
      wikiTitle: 'Celeste (video game)',
      description: '2018 video game',
      coverUrl: 'https://img/c.jpg',
      year: 2018,
    })
  })

  it('falls back to the Wikipedia page id', () => {
    const game = toGameSummary({ pageid: 7, title: 'Markstrat' })
    expect(game.id).toBe('enwiki:7')
    expect(game.coverUrl).toBeNull()
    expect(game.description).toBeNull()
  })
})

it('sortByRank orders pages by search index', () => {
  const pages = [{ pageid: 2, title: 'b', index: 2 }, { pageid: 1, title: 'a', index: 1 }]
  expect(sortByRank(pages).map((p) => p.title)).toEqual(['a', 'b'])
})

it('formatGenre strips the "video game" suffix and capitalizes', () => {
  expect(formatGenre('role-playing video game')).toBe('Role-playing')
  expect(formatGenre('action-adventure game')).toBe('Action-adventure')
  expect(formatGenre('platformer')).toBe('Platformer')
})

describe('toIsoReleaseDate', () => {
  it('keeps only the precision Wikidata has, as an ISO 8601 date', () => {
    expect(toIsoReleaseDate('+2017-03-03T00:00:00Z', 11)).toBe('2017-03-03')
    expect(toIsoReleaseDate('2017-03-01T00:00:00Z', 10)).toBe('2017-03')
    expect(toIsoReleaseDate('2017-01-01T00:00:00Z', 9)).toBe('2017')
    expect(toIsoReleaseDate('2017-00-00T00:00:00Z', 11)).toBe('2017')
    expect(toIsoReleaseDate('2017-03-00T00:00:00Z', 11)).toBe('2017-03')
  })

  it('returns null for times it cannot read, including dates before the common era', () => {
    expect(toIsoReleaseDate('garbage', 11)).toBeNull()
    expect(toIsoReleaseDate('-0500-01-01T00:00:00Z', 9)).toBeNull()
  })

  it('always produces a date the contract accepts', () => {
    for (const date of ['2017', '2017-03', '2017-03-03']) expect(gameDetailsSchema.shape.releaseDate.parse(date)).toBe(date)
    expect(gameDetailsSchema.shape.releaseDate.safeParse('March 3, 2017').success).toBe(false)
  })
})

describe('parseFacts', () => {
  it('groups rows, dedupes, skips unlabeled items and keeps the earliest release', () => {
    const facts = parseFacts([
      { kind: { value: 'released' }, time: { value: '2017-03-03T00:00:00Z' }, precision: { value: '11' } },
      { kind: { value: 'released' }, time: { value: '2016-01-01T00:00:00Z' }, precision: { value: '9' } },
      { kind: { value: 'platform' }, valueLabel: { value: 'Wii U' } },
      { kind: { value: 'platform' }, valueLabel: { value: 'Wii U' } },
      { kind: { value: 'platform' }, valueLabel: { value: 'Q123' } },
      { kind: { value: 'genre' }, valueLabel: { value: 'action-adventure game' } },
      { kind: { value: 'developer' }, valueLabel: { value: 'Nintendo EPD' } },
      { kind: { value: 'publisher' }, valueLabel: { value: 'Nintendo' } },
      { kind: { value: 'unknown' }, valueLabel: { value: 'ignored' } },
    ])
    expect(facts).toEqual({
      releaseDate: '2016',
      platforms: ['Wii U'],
      genres: ['Action-adventure'],
      developers: ['Nintendo EPD'],
      publishers: ['Nintendo'],
    })
  })
})
