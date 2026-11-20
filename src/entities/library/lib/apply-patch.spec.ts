import { describe, expect, it } from 'vitest'
import { makeEntry, makeGame } from '@/shared/lib/testing/fixtures'
import { applyPatch, withoutEntry } from './apply-patch'

describe('applyPatch', () => {
  it('prepends new games with defaults', () => {
    const existing = makeEntry({ game: makeGame({ id: 'Q2' }) })
    const result = applyPatch([existing], makeGame(), { favorite: true }, 50)
    expect(result).toEqual([{ game: makeGame(), score: null, completed: false, favorite: true, addedAt: 50, updatedAt: 50 }, existing])
  })

  it('merges into existing entries without mutating the input', () => {
    const entries = [makeEntry({ score: 3, addedAt: 1 })]
    const result = applyPatch(entries, makeGame(), { completed: true }, 99)
    expect(result[0]).toMatchObject({ score: 3, completed: true, addedAt: 1, updatedAt: 99 })
    expect(entries[0].completed).toBe(false)
  })
})

it('withoutEntry removes by game id', () => {
  expect(withoutEntry([makeEntry()], 'Q1')).toEqual([])
})
