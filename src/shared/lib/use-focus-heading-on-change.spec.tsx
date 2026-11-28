import { useRef } from 'react'
import { expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { useFocusHeadingOnChange } from './use-focus-heading-on-change'

function Page({ view }: { view: string }) {
  const mainRef = useRef<HTMLElement>(null)
  useFocusHeadingOnChange(view, mainRef)
  return (
    <main ref={mainRef}>
      <h1 tabIndex={-1}>{view}</h1>
    </main>
  )
}

it('focuses the heading after the value changes, but not on the first render', async () => {
  const screen = await render(<Page view="Discover" />)
  expect(document.activeElement).toBe(document.body)

  await screen.rerender(<Page view="My library" />)
  await expect.element(screen.getByRole('heading', { name: 'My library' })).toHaveFocus()
})
