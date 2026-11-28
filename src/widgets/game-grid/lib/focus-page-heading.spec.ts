import { afterEach, expect, it } from 'vitest'
import { focusPageHeading } from './focus-page-heading'

afterEach(() => document.body.replaceChildren())

function renderPage() {
  document.body.innerHTML = '<main><h1 tabindex="-1">Library</h1><button type="button">Other</button></main>'
  return { heading: document.querySelector('h1')!, other: document.querySelector('button')! }
}

it('moves lost focus to the page heading', () => {
  const { heading } = renderPage()
  focusPageHeading()
  expect(document.activeElement).toBe(heading)
})

it('leaves focus alone when something already has it', () => {
  const { other } = renderPage()
  other.focus()
  focusPageHeading()
  expect(document.activeElement).toBe(other)
})
