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
  await expect.element(screen.getByText('Your score: 9 out of 10')).toBeInTheDocument()
  await expect.element(screen.getByRole('button', { name: 'Favourite: Celeste' })).toHaveAttribute('aria-pressed', 'true')
  await expect.element(screen.getByRole('button', { name: 'Favourite: Hades' })).toHaveAttribute('aria-pressed', 'false')

  await screen.getByRole('button', { name: 'Hades', exact: true }).click()
  expect(onOpen).toHaveBeenCalledWith(hades)
})

it('offers an explicit "Load more" control besides infinite scroll', async () => {
  vi.spyOn(window, 'fetch').mockImplementation(fakeApi(() => Response.json([])))
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
  vi.spyOn(window, 'fetch').mockImplementation(fakeApi(() => Response.json([])))
  const onLoadMore = vi.fn()
  await renderWithProviders(<GameGrid label="Results" games={[celeste]} onOpen={vi.fn()} hasMore onLoadMore={onLoadMore} />)
  await vi.waitFor(() => expect(onLoadMore).toHaveBeenCalled())
})

it('moves focus to the next card when the focused card is removed (2.4.3)', async () => {
  vi.spyOn(window, 'fetch').mockImplementation(fakeApi(() => Response.json([])))
  const outerWilds = makeGame({ id: 'Q3', pageId: 3, title: 'Outer Wilds' })
  const screen = await renderWithProviders(<GameGrid label="Results" games={[celeste, hades, outerWilds]} onOpen={vi.fn()} />)

  ;(screen.getByRole('button', { name: 'Favourite: Hades' }).element() as HTMLElement).focus()
  await screen.rerender(<GameGrid label="Results" games={[celeste, outerWilds]} onOpen={vi.fn()} />)
  await expect.element(screen.getByRole('button', { name: 'Outer Wilds', exact: true })).toHaveFocus()

  await screen.rerender(<GameGrid label="Results" games={[celeste]} onOpen={vi.fn()} />)
  await expect.element(screen.getByRole('button', { name: 'Celeste', exact: true })).toHaveFocus()
})

it('falls back to the page heading when the grid disappears while focused', async () => {
  vi.spyOn(window, 'fetch').mockImplementation(fakeApi(() => Response.json([])))
  const page = (games: typeof celeste[] | null) => (
    <main>
      <h1 tabIndex={-1}>My library</h1>
      {games && <GameGrid label="Results" games={games} onOpen={vi.fn()} />}
    </main>
  )
  const screen = await renderWithProviders(page([celeste]))

  ;(screen.getByRole('button', { name: 'Celeste', exact: true }).element() as HTMLElement).focus()
  await screen.rerender(page(null))
  await expect.element(screen.getByRole('heading', { name: 'My library' })).toHaveFocus()
})

it('does not steal focus that moved elsewhere on purpose', async () => {
  vi.spyOn(window, 'fetch').mockImplementation(fakeApi(() => Response.json([])))
  const screen = await renderWithProviders(
    <>
      <input aria-label="Elsewhere" />
      <GameGrid label="Results" games={[celeste, hades]} onOpen={vi.fn()} />
    </>,
  )
  ;(screen.getByRole('button', { name: 'Hades', exact: true }).element() as HTMLElement).focus()
  await screen.getByRole('textbox', { name: 'Elsewhere' }).click()
  await screen.rerender(
    <>
      <input aria-label="Elsewhere" />
      <GameGrid label="Results" games={[celeste]} onOpen={vi.fn()} />
    </>,
  )
  await expect.element(screen.getByRole('textbox', { name: 'Elsewhere' })).toHaveFocus()
})
