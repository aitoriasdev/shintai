import { afterEach, expect, it } from 'vitest'
import { focusHeading } from './focus-heading'

afterEach(() => document.body.replaceChildren())

function container(html: string) {
  const element = document.createElement('main')
  element.innerHTML = html
  document.body.append(element)
  return element
}

it('focuses the heading that is already there', () => {
  const main = container('<h1 tabindex="-1">Discover</h1>')
  focusHeading(main)
  expect(document.activeElement?.textContent).toBe('Discover')
})

it('waits for a heading that renders later, such as a lazily loaded page', async () => {
  const main = container('<p>Loading</p>')
  focusHeading(main)
  const heading = document.createElement('h1')
  heading.tabIndex = -1
  heading.textContent = 'My library'
  main.replaceChildren(heading)
  await expect.poll(() => document.activeElement).toBe(heading)
})

it('stops waiting when cancelled', async () => {
  const main = container('')
  const stop = focusHeading(main)
  stop()
  const heading = document.createElement('h1')
  heading.tabIndex = -1
  main.append(heading)
  await new Promise((resolve) => setTimeout(resolve, 50))
  expect(document.activeElement).not.toBe(heading)
})
