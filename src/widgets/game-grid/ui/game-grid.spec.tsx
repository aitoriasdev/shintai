import { afterEach, expect, it, vi } from 'vitest'
import { fakeApi, renderWithProviders } from '@/shared/lib/testing/render-with-providers'
import { makeEntry, makeGame } from '@/shared/lib/testing/fixtures'
import { GameGrid } from './game-grid'

afterEach(() => vi.restoreAllMocks())

const celeste = makeGame()
const hades = makeGame({ id: 'Q2', pageId: 2, title: 'Hades', description: '2020 video game' })

it('renders a card per game with library status and quick actions', async () => {
  vi.spyOn(window, 'fetch').mockImplementation(fakeApi(() => Response.json([makeEntry({ score: 9, favorite: true })])))
  const onOpen = vi.fn()
  const screen = await renderWithProviders(<GameGrid label="Results" games={[celeste, hades]} onOpen={onOpen} />)

  await expect.element(screen.getByRole('listitem')).toHaveLength(2)
  await expect.element(screen.getByLabelText('Score 9 out of 10')).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Favorite', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect.element(screen.getByRole('button', { name: 'Add to favorites' })).toBeVisible()

  await screen.getByRole('heading', { name: 'Hades' }).click()
  expect(onOpen).toHaveBeenCalledWith(hades)
})

it('asks for more games when the end of the grid is visible', async () => {
  vi.spyOn(window, 'fetch').mockImplementation(fakeApi(() => Response.json([])))
  const onLoadMore = vi.fn()
  await renderWithProviders(<GameGrid label="Results" games={[celeste]} onOpen={vi.fn()} hasMore onLoadMore={onLoadMore} />)
  await vi.waitFor(() => expect(onLoadMore).toHaveBeenCalled())
})
