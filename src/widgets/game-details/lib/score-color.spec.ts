import { expect, it } from 'vitest'
import { scoreColor } from './score-color'

it('colours low, middling and high scores differently', () => {
  expect([1, 4].map(scoreColor)).toEqual(['bg-destructive text-on-status', 'bg-destructive text-on-status'])
  expect([5, 7].map(scoreColor)).toEqual(['bg-score text-on-status', 'bg-score text-on-status'])
  expect([8, 10].map(scoreColor)).toEqual(['bg-completed text-on-status', 'bg-completed text-on-status'])
})
