import { domAnimation, LazyMotion } from 'motion/react'
import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import type { GameSummary } from '@contracts/game'
import { GameCard } from './game-card'

const game: GameSummary = {
  id: 'Q1',
  pageId: 1,
  title: 'Celeste',
  wikiTitle: 'Celeste (video game)',
  description: '2018 video game',
  coverUrl: null,
  year: 2018,
}

it('shows title, description and a fallback cover, and opens on click', async () => {
  const onOpen = vi.fn()
  const screen = await render(
    <LazyMotion features={domAnimation}>
      <GameCard game={game} onOpen={onOpen} badges={<span>9/10</span>} actions={<button type="button">Fav</button>} />
    </LazyMotion>,
  )

  await expect.element(screen.getByRole('heading', { name: 'Celeste' })).toBeVisible()
  await expect.element(screen.getByText('2018 video game')).toBeVisible()
  await expect.element(screen.getByRole('img', { name: 'Celeste (no cover available)' })).toBeVisible()
  await expect.element(screen.getByText('9/10')).toBeVisible()

  await screen.getByRole('heading', { name: 'Celeste' }).click()
  expect(onOpen).toHaveBeenCalledWith(game)
})
