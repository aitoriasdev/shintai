import { describe, expect, it } from 'vitest'
import { makeEntry, makeGame } from '@/shared/lib/testing/fixtures'
import { DEFAULT_FILTERS, filterLibrary } from './filter-library'

const pokemon = makeEntry({ game: makeGame({ id: 'Q1', title: 'Pokémon Red', year: 1996 }), score: 8, favorite: true, addedAt: 1 })
const celeste = makeEntry({ game: makeGame({ id: 'Q2', title: 'Celeste', year: 2018 }), score: null, completed: true, addedAt: 3 })
const doom = makeEntry({ game: makeGame({ id: 'Q3', title: 'doom', year: null }), score: 10, addedAt: 2 })
const all = [pokemon, celeste, doom]

const titles = (entries: typeof all) => entries.map((e) => e.game.title)

describe('filterLibrary', () => {
  it('defaults to most recently added', () => {
    expect(titles(filterLibrary(all, DEFAULT_FILTERS))).toEqual(['Celeste', 'doom', 'Pokémon Red'])
  })

  it.each([
    ['favorites', ['Pokémon Red']],
    ['completed', ['Celeste']],
    ['pending', ['doom', 'Pokémon Red']],
  ] as const)('filters by %s', (status, expected) => {
    expect(titles(filterLibrary(all, { ...DEFAULT_FILTERS, status }))).toEqual(expected)
  })

  it('matches text ignoring case and accents', () => {
    expect(titles(filterLibrary(all, { ...DEFAULT_FILTERS, text: ' POKEMON ' }))).toEqual(['Pokémon Red'])
  })

  it.each([
    ['title', ['Celeste', 'doom', 'Pokémon Red']],
    ['score', ['doom', 'Pokémon Red', 'Celeste']],
    ['year', ['Celeste', 'Pokémon Red', 'doom']],
  ] as const)('sorts by %s with unknown values last', (sort, expected) => {
    expect(titles(filterLibrary(all, { ...DEFAULT_FILTERS, sort }))).toEqual(expected)
  })

  it('does not mutate the input', () => {
    const input = [...all]
    filterLibrary(input, { ...DEFAULT_FILTERS, sort: 'title' })
    expect(input).toEqual(all)
  })
})
