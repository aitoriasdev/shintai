import type { GameDetails, GameSummary } from '@contracts/game'
import type { Page } from '@playwright/test'

const game = (id: number, title: string, year: number): GameSummary => ({
  id: `Q${id}`,
  pageId: id,
  title,
  wikiTitle: title,
  description: `${year} video game`,
  coverUrl: null,
  year,
})

export const CATALOG = [game(1, 'Celeste', 2018), game(2, 'Hades', 2020), game(3, 'Outer Wilds', 2019)]

export const DETAILS: GameDetails = {
  extract: 'A wonderful game.',
  coverUrl: null,
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Example',
  releaseDate: 'January 1, 2020',
  platforms: ['Windows'],
  genres: ['Platformer'],
  developers: ['Indie Studio'],
  publishers: [],
}

/** Stubs the Wikipedia-backed catalog endpoints in the browser; library endpoints still hit the real API + SQLite. */
export async function stubCatalog(page: Page) {
  await page.route('**/api/games/search**', (route) => {
    const params = new URL(route.request().url()).searchParams
    const q = params.get('q')?.toLowerCase() ?? ''
    const year = params.get('year')
    const games = CATALOG.filter((g) => g.title.toLowerCase().includes(q) && (!year || g.year === Number(year)))
    return route.fulfill({ json: { games, nextOffset: null } })
  })
  await page.route('**/api/games/*/details**', (route) => route.fulfill({ json: DETAILS }))
}

/** A game card located by its title. */
export const gameCard = (page: Page, title: string) =>
  page.getByRole('listitem').filter({ has: page.getByRole('heading', { name: title, exact: true }) })

export async function resetLibrary(page: Page) {
  const res = await page.request.post('/api/__test__/reset')
  if (res.status() !== 204) throw new Error(`Library reset failed: ${res.status()}`)
}
