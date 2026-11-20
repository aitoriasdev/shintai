import { expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { GameCover } from './game-cover'

it('describes the cover art, or its absence', async () => {
  const withImage = await render(<GameCover title="Celeste" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />)
  await expect.element(withImage.getByRole('img', { name: 'Celeste cover art' })).toBeInTheDocument()

  const fallback = await render(<GameCover title="Hades" src={null} />)
  await expect.element(fallback.getByRole('img', { name: 'Hades (no cover art available)' })).toBeVisible()
})

it('is hidden from assistive tech when decorative', async () => {
  const screen = await render(<GameCover title="Celeste" src={null} decorative />)
  await expect.element(screen.getByRole('img')).not.toBeInTheDocument()
})
