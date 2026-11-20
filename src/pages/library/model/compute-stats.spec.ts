import { expect, it } from 'vitest'
import { makeEntry } from '@/shared/lib/testing/fixtures'
import { computeStats } from './compute-stats'

it('summarizes an empty library', () => {
  expect(computeStats([])).toEqual({ total: 0, completed: 0, favorites: 0, averageScore: null, completionRate: 0 })
})

it('averages only rated games', () => {
  const stats = computeStats([
    makeEntry({ score: 7, completed: true }),
    makeEntry({ score: 8, favorite: true }),
    makeEntry({ score: null, completed: true }),
  ])
  expect(stats).toEqual({ total: 3, completed: 2, favorites: 1, averageScore: 7.5, completionRate: 67 })
})
