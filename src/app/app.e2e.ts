import { expect, test, type Page } from '@playwright/test'
import type { GameDetails, GameSummary } from '@contracts/game'

const game = (id: number, title: string, year: number): GameSummary => ({
  id: `Q${id}`,
  pageId: id,
  title,
  wikiTitle: title,
  description: `${year} video game`,
  coverUrl: null,
  year,
})

const CATALOG = [game(1, 'Celeste', 2018), game(2, 'Hades', 2020), game(3, 'Outer Wilds', 2019)]

const details: GameDetails = {
  extract: 'A wonderful game.',
  coverUrl: null,
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Example',
  releaseDate: 'January 1, 2020',
  platforms: ['Windows'],
  genres: ['Platformer'],
  developers: ['Indie Studio'],
  publishers: [],
}

/** The Wikipedia-backed catalog is stubbed; library endpoints hit the real API and SQLite. */
async function stubCatalog(page: Page) {
  await page.route('**/api/games/search**', (route) => {
    const q = new URL(route.request().url()).searchParams.get('q')?.toLowerCase() ?? ''
    return route.fulfill({ json: { games: CATALOG.filter((g) => g.title.toLowerCase().includes(q)), nextOffset: null } })
  })
  await page.route('**/api/games/*/details**', (route) => route.fulfill({ json: details }))
}

const card = (page: Page, title: string) => page.getByRole('article').filter({ has: page.getByRole('heading', { name: title }) })

test.beforeEach(async ({ page, request }) => {
  expect((await request.post('/api/__test__/reset')).status()).toBe(204)
  await stubCatalog(page)
  await page.goto('/')
})

test('favorites and completes games from the discover grid', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Notable games' })).toBeVisible()

  await card(page, 'Celeste').getByRole('button', { name: 'Add to favorites' }).click()
  await card(page, 'Hades').getByRole('button', { name: 'Mark as completed' }).click()

  await expect(card(page, 'Celeste').getByRole('button', { name: 'Favorite', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(card(page, 'Hades').getByText('Completed', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'My library, 2 games' })).toBeVisible()
})

test('searches the catalog', async ({ page }) => {
  await page.keyboard.press('/')
  await page.keyboard.type('outer')
  await expect(page.getByRole('heading', { name: 'Results for “outer”' })).toBeVisible()
  await expect(page.getByRole('article')).toHaveCount(1)
  await expect(card(page, 'Outer Wilds')).toBeVisible()
})

test('rates a game in the details dialog and persists it in SQLite', async ({ page }) => {
  await card(page, 'Outer Wilds').getByRole('heading').click()
  const dialog = page.getByRole('dialog', { name: 'Outer Wilds' })
  await expect(dialog.getByText('A wonderful game.')).toBeVisible()
  await expect(dialog.getByText('Indie Studio')).toBeVisible()

  await dialog.getByRole('radio', { name: '10 out of 10' }).click()
  await dialog.getByRole('button', { name: 'Mark as completed' }).click()
  await expect(dialog.getByRole('button', { name: 'In library' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()

  await page.reload()
  await page.getByRole('link', { name: /My library/ }).click()
  await expect(page).toHaveURL(/#library$/)
  await expect(card(page, 'Outer Wilds').getByLabel('Score 10 out of 10')).toBeVisible()
  await expect(page.getByRole('definition').filter({ hasText: '10.0' })).toBeVisible()
})

test('filters, searches and removes library games', async ({ page }) => {
  await card(page, 'Celeste').getByRole('button', { name: 'Add to favorites' }).click()
  await card(page, 'Hades').getByRole('button', { name: 'Mark as completed' }).click()
  await expect(page.getByRole('link', { name: 'My library, 2 games' })).toBeVisible()
  await page.getByRole('link', { name: /My library/ }).click()

  await page.getByRole('radio', { name: 'Favorites' }).click()
  await expect(page.getByRole('article')).toHaveCount(1)
  await page.getByRole('radio', { name: 'All' }).click()

  await page.getByRole('searchbox', { name: 'Search your library' }).fill('hades')
  await expect(page.getByRole('article')).toHaveCount(1)

  await card(page, 'Hades').getByRole('heading').click()
  page.once('dialog', (confirm) => confirm.accept())
  await page.getByRole('dialog').getByRole('button', { name: 'In library' }).click()
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Clear search' }).click()
  await expect(page.getByRole('article')).toHaveCount(1)
  await expect(page.getByRole('link', { name: 'My library, 1 game' })).toBeVisible()
})

test('exports and re-imports a backup', async ({ page }) => {
  await card(page, 'Celeste').getByRole('button', { name: 'Add to favorites' }).click()
  await expect(page.getByRole('link', { name: 'My library, 1 game' })).toBeVisible()
  await page.getByRole('link', { name: /My library/ }).click()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('link', { name: 'Export' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/^shintai-backup-\d{4}-\d{2}-\d{2}\.json$/)
  const backupPath = await download.path()

  await page.request.post('/api/__test__/reset')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Your library is empty' })).toBeVisible()

  await page.getByLabel('Backup file').setInputFiles(backupPath)
  await expect(page.getByRole('status')).toHaveText('Imported: 1 added, 0 updated, 0 unchanged.')
  await expect(card(page, 'Celeste')).toBeVisible()
})
