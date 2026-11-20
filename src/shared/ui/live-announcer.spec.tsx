import { expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { announce } from '@/shared/lib/announce'
import { LiveAnnouncer } from './live-announcer'

it('exposes announcements through a polite status region', async () => {
  const screen = await render(<LiveAnnouncer />)
  const region = screen.getByRole('status')
  await expect.element(region).toHaveAttribute('aria-live', 'polite')

  announce('24 games found')
  await expect.element(region).toHaveTextContent('24 games found')
})
