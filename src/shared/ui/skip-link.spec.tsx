import { expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'
import { SkipLink } from './skip-link'

it('is the first tab stop and moves focus to the target', async () => {
  const screen = await render(
    <>
      <SkipLink targetId="main" />
      <button type="button">Navigation</button>
      <main id="main" tabIndex={-1}>
        Content
      </main>
    </>,
  )

  await userEvent.tab()
  const link = screen.getByRole('link', { name: 'Skip to main content' })
  await expect.element(link).toHaveFocus()
  await userEvent.keyboard('{Enter}')
  await expect.element(screen.getByRole('main')).toHaveFocus()
})
