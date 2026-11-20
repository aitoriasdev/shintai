import { expect, it } from 'vitest'
import { cn } from './cn'

it('joins only truthy class names', () => {
  expect(cn('a', false, null, undefined, 'b', '')).toBe('a b')
})
