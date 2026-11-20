import { expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { makeGame } from '@/shared/lib/testing/fixtures'
import { renderWithProviders } from '@/shared/lib/testing/render-with-providers'
import { GameCard } from './game-card'

it('exposes the title as a heading with a single named button', async () => {
  const onOpen = vi.fn()
  const game = makeGame()
  const screen = await renderWithProviders(<GameCard game={game} onOpen={onOpen} badges={<span>Completed</span>} />)

  await expect.element(screen.getByRole('heading', { level: 2, name: 'Celeste' })).toBeVisible()
  await expect.element(screen.getByText('2018 video game')).toBeVisible()
  // The cover repeats the title, so it is hidden from assistive tech.
  await expect.element(screen.getByRole('img')).not.toBeInTheDocument()

  await screen.getByRole('button', { name: 'Celeste' }).click()
  expect(onOpen).toHaveBeenCalledWith(game)
})

it('can be opened with the keyboard', async () => {
  const onOpen = vi.fn()
  await renderWithProviders(<GameCard game={makeGame()} onOpen={onOpen} />)
  await userEvent.tab()
  await userEvent.keyboard('{Enter}')
  expect(onOpen).toHaveBeenCalledOnce()
})
