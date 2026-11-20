import { expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { useDocumentTitle } from './use-document-title'

function Page({ title }: { title: string }) {
  useDocumentTitle(title)
  return null
}

it('sets a descriptive document title', async () => {
  const screen = await render(<Page title="Discover" />)
  expect(document.title).toBe('Discover · Shintai')
  await screen.rerender(<Page title="My library" />)
  expect(document.title).toBe('My library · Shintai')
})
