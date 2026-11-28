import { expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { GameCover } from './game-cover'

it('describes the cover art, or its absence', async () => {
  const withImage = await render(<GameCover title="Celeste" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />)
  await expect.element(withImage.getByRole('img', { name: 'Celeste cover art' })).toBeInTheDocument()

  const fallback = await render(<GameCover title="Hades" src={null} />)
  await expect.element(fallback.getByRole('img', { name: 'Hades (no cover art available)' })).toBeVisible()
})

it('shows a "no image" icon instead of repeating the title when there is no cover', async () => {
  const screen = await render(<GameCover title="Hades" src={null} />)
  const fallback = screen.getByRole('img', { name: 'Hades (no cover art available)' })
  await expect.element(fallback).toBeVisible()
  expect(fallback.element().textContent).toBe('')
  expect(fallback.element().querySelector('svg.lucide-image-off')).not.toBeNull()
})

it('is hidden from assistive tech when decorative', async () => {
  const screen = await render(<GameCover title="Celeste" src={null} decorative />)
  await expect.element(screen.getByRole('img')).not.toBeInTheDocument()
})

it('retries when the source changes after a failed load', async () => {
  const screen = await render(<GameCover title="Celeste" src="data:image/png;base64,broken" />)
  await expect.element(screen.getByRole('img', { name: 'Celeste (no cover art available)' })).toBeVisible()

  await screen.rerender(<GameCover title="Celeste" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />)
  await expect.element(screen.getByRole('img', { name: 'Celeste cover art' })).toBeInTheDocument()
})
