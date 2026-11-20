import { expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { makeEntry } from '@/shared/lib/testing/fixtures'
import { EntryBadges } from './entry-badges'

it('renders nothing for games outside the library', async () => {
  const screen = await render(<EntryBadges entry={undefined} />)
  expect(screen.container).toBeEmptyDOMElement()
})

it('announces the score in words and shows completion as text', async () => {
  const screen = await render(<EntryBadges entry={makeEntry({ score: 9, completed: true })} />)
  expect(screen.container.textContent).toBe('Your score: 9 out of 10Completed')
  await expect.element(screen.getByText('Completed')).toBeVisible()
})

it('hides badges that do not apply', async () => {
  const screen = await render(<EntryBadges entry={makeEntry()} />)
  expect(screen.container).toBeEmptyDOMElement()
})
