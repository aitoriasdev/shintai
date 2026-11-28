import { afterEach, expect, it } from 'vitest'
import { focusFallback } from './focus-fallback'

afterEach(() => document.body.replaceChildren())

it('prefers a focusable main heading, then the main element', () => {
  document.body.innerHTML = '<main><h1 tabindex="-1">Discover</h1></main>'
  expect(focusFallback()).toBe(document.querySelector('h1'))

  document.body.innerHTML = '<main><h1>Discover</h1></main>'
  expect(focusFallback()).toBe(document.querySelector('main'))
})
