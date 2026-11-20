import { expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/shared/lib/testing/render-with-providers'
import { makeGame } from '@/shared/lib/testing/fixtures'
import { GameGrid } from './game-grid'

const celeste = makeGame()
const hades = makeGame({ id: 'Q2', pageId: 2, title: 'Hades', description: '2020 video game' })

it('renders a card per game that opens its details', async () => {
  const onOpen = vi.fn()
  const screen = await renderWithProviders(<GameGrid label="Results" games={[celeste, hades]} onOpen={onOpen} />)

  await expect.element(screen.getByRole('listitem')).toHaveLength(2)

  await screen.getByRole('button', { name: 'Hades', exact: true }).click()
  expect(onOpen).toHaveBeenCalledWith(hades)
})

it('offers an explicit "Load more" control besides infinite scroll', async () => {
  const onLoadMore = vi.fn()
  const screen = await renderWithProviders(
    <div style={{ marginTop: '300vh' }}>
      <GameGrid label="Results" games={[celeste]} onOpen={vi.fn()} hasMore onLoadMore={onLoadMore} />
    </div>,
  )
  await screen.getByRole('button', { name: 'Load more games' }).click()
  expect(onLoadMore).toHaveBeenCalled()
})

it('asks for more games when the end of the grid is visible', async () => {
  const onLoadMore = vi.fn()
  await renderWithProviders(<GameGrid label="Results" games={[celeste]} onOpen={vi.fn()} hasMore onLoadMore={onLoadMore} />)
  await vi.waitFor(() => expect(onLoadMore).toHaveBeenCalled())
})
