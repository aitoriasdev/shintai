import { expect, test } from '@playwright/test'
import { gameCard, resetLibrary, stubCatalog } from '@/shared/lib/testing/e2e-catalog'
import { expectAccessible } from '@/shared/lib/testing/expect-accessible'

test.beforeEach(async ({ page }) => {
  await resetLibrary(page)
  await stubCatalog(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Favorite: Celeste' }).click()
  await page.getByRole('button', { name: 'Completed: Hades' }).click()
  await expect(page.getByRole('link', { name: 'My library (2 games)' })).toBeVisible()
  await page.getByRole('link', { name: /My library/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'My library' })).toBeVisible()
})

test('filters, searches and removes library games', async ({ page }) => {
  await expect(page.getByRole('listitem')).toHaveCount(2)
  await expect(page.getByRole('definition').filter({ hasText: '50%' })).toBeVisible()

  await page.getByRole('radio', { name: 'Favorites' }).check()
  await expect(page.getByRole('listitem')).toHaveCount(1)
  await expect(page.getByRole('status').filter({ hasText: '1 of 2 games shown' })).toBeAttached()
  await page.getByRole('radio', { name: 'All' }).check()

  await page.getByRole('searchbox', { name: 'Search your library' }).fill('hades')
  await expect(page.getByRole('listitem')).toHaveCount(1)

  await page.getByRole('button', { name: 'Hades', exact: true }).click()
  page.once('dialog', (confirm) => confirm.accept())
  await page.getByRole('dialog').getByRole('button', { name: 'Remove from library' }).click()
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Clear search' }).click()
  await expect(page.getByRole('listitem')).toHaveCount(1)
  await expect(page.getByRole('link', { name: 'My library (1 game)' })).toBeVisible()
})

test('keeps keyboard focus when a card leaves the filtered view (2.4.3)', async ({ page }) => {
  await page.getByRole('radio', { name: 'Favorites' }).check()
  await expect(page.getByRole('listitem')).toHaveCount(1)

  await page.getByRole('button', { name: 'Favorite: Celeste' }).focus()
  await page.keyboard.press('Enter')

  await expect(page.getByRole('heading', { name: 'No games match these filters' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: 'My library' })).toBeFocused()
})

test('exports and re-imports a backup', async ({ page }) => {
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('link', { name: 'Export library backup' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/^shintai-backup-\d{4}-\d{2}-\d{2}\.json$/)
  const backupPath = await download.path()

  await resetLibrary(page)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Your library is empty' })).toBeVisible()

  await page.getByLabel('Backup file').setInputFiles(backupPath)
  await expect(page.getByRole('status').filter({ hasText: 'Imported: 2 added, 0 updated, 0 unchanged.' })).toBeVisible()
  await expect(gameCard(page, 'Celeste')).toBeVisible()
})

test('meets WCAG 2.1 AA', async ({ page }) => {
  await expectAccessible(page)
  await page.getByRole('radio', { name: 'Completed', exact: true }).check()
  await expectAccessible(page)
})
