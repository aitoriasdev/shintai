import { expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { makeEntry } from '@/shared/lib/testing/fixtures'
import { EntryBadges } from './entry-badges'

it('renders nothing for games outside the library', async () => {
  const screen = await render(<EntryBadges entry={undefined} />)
  expect(screen.container).toBeEmptyDOMElement()
})

it('shows score and completion', async () => {
  const screen = await render(<EntryBadges entry={makeEntry({ score: 9, completed: true })} />)
  await expect.element(screen.getByLabelText('Score 9 out of 10')).toBeVisible()
  await expect.element(screen.getByText('Completed')).toBeVisible()
})

it('hides badges that do not apply', async () => {
  const screen = await render(<EntryBadges entry={makeEntry()} />)
  await expect.element(screen.getByText('Completed')).not.toBeInTheDocument()
})
