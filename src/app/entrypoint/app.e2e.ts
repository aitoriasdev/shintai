import { expect, test } from '@playwright/test'
import { resetLibrary, stubCatalog } from '@/shared/lib/testing/e2e-catalog'
import { expectAccessible } from '@/shared/lib/testing/expect-accessible'

test.beforeEach(async ({ page }) => {
  await resetLibrary(page)
  await stubCatalog(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('offers a skip link as the first tab stop (2.4.1)', async ({ page }) => {
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Skip to main content' })
  await expect(skip).toBeFocused()
  await expect(skip).toBeInViewport()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
})

test('switching views updates the title and moves focus to the new heading (2.4.2, 2.4.3)', async ({ page }) => {
  await expect(page).toHaveTitle('Discover · Shintai')
  await page.getByRole('link', { name: /My library/ }).click()
  await expect(page).toHaveTitle('My library · Shintai')
  await expect(page.getByRole('heading', { level: 1, name: 'My library' })).toBeFocused()
  await expect(page.getByRole('link', { name: /My library/ })).toHaveAttribute('aria-current', 'page')

  await page.goBack()
  await expect(page.getByRole('heading', { level: 1, name: 'Notable games' })).toBeFocused()
})

test('reflows without horizontal scrolling at 320px (1.4.10)', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
  await expectAccessible(page)
})
