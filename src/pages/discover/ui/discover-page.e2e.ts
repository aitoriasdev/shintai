import { expect, test } from '@playwright/test'
import { gameCard, resetLibrary, stubCatalog } from '@/shared/lib/testing/e2e-catalog'
import { expectAccessible } from '@/shared/lib/testing/expect-accessible'

test.beforeEach(async ({ page }) => {
  await resetLibrary(page)
  await stubCatalog(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Notable games' })).toBeVisible()
})

test('browses, searches and filters the catalog', async ({ page }) => {
  await expect(page.getByRole('listitem')).toHaveCount(3)

  await page.keyboard.press('/')
  await page.keyboard.type('outer')
  await expect(page.getByRole('heading', { level: 1, name: 'Results for “outer”' })).toBeVisible()
  await expect(page).toHaveTitle('Results for “outer” · Shintai')
  await expect(page.getByRole('listitem')).toHaveCount(1)
  await expect(page.getByRole('status').filter({ hasText: 'Results for “outer”: 1 games' })).toBeAttached()

  await page.keyboard.press('Escape')
  await page.getByRole('combobox', { name: 'Release year' }).selectOption('2020')
  await expect(page.getByRole('heading', { level: 1, name: 'Notable games of 2020' })).toBeVisible()
  await expect(gameCard(page, 'Hades')).toBeVisible()
  await expect(page.getByRole('listitem')).toHaveCount(1)
})

test('meets WCAG 2.1 AA', async ({ page }) => {
  await expectAccessible(page)
})
