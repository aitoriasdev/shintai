import { expect, type Page, test } from '@playwright/test'
import { resetLibrary, stubCatalog } from '@/shared/lib/testing/e2e-catalog'
import { expectAccessible } from '@/shared/lib/testing/expect-accessible'

test.beforeEach(async ({ page }) => {
  await resetLibrary(page)
  await stubCatalog(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

async function openPreferences(page: Page, name = 'Preferences') {
  await page.getByRole('button', { name }).click()
  await expect(page.getByRole('group', { name })).toBeVisible()
}

test('the open preferences panel is accessible', async ({ page }) => {
  await openPreferences(page)
  await expectAccessible(page)
})

test('the light theme meets WCAG 2.1 AA on every page', async ({ page }) => {
  await openPreferences(page)
  await page.getByRole('radio', { name: 'Light' }).check()
  await page.keyboard.press('Escape')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

  await page.getByRole('button', { name: 'Favourite: Celeste' }).click()
  await expectAccessible(page)

  await page.getByRole('link', { name: /My library/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'My library' })).toBeVisible()
  await expectAccessible(page)

  await page.getByRole('button', { name: 'Celeste', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Celeste' })).toBeVisible()
  await expectAccessible(page)
})

test('the theme is applied before the app renders after a reload', async ({ page }) => {
  await openPreferences(page)
  await page.getByRole('radio', { name: 'Light' }).check()

  // Stop the app bundle from loading: only the inline script in index.html can set the theme now.
  await page.route('**/assets/*.js', (route) => route.abort())
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

test('picks the language before the app renders from the whole list of preferred languages', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'languages', { get: () => ['fr-FR', 'es-MX', 'en-US'] }))
  // Only the inline script in index.html runs: it must skip French and land on Spanish, like matchLocale().
  await page.route('**/assets/*.js', (route) => route.abort())
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'es-ES')
})

test('follows the operating system while set to "System"', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})

test('switches the interface to Spanish and remembers it', async ({ page }) => {
  await openPreferences(page)
  await page.getByRole('combobox', { name: 'Language' }).selectOption('es-ES')
  await page.keyboard.press('Escape')

  await expect(page.locator('html')).toHaveAttribute('lang', 'es-ES')
  await expect(page.getByRole('heading', { level: 1, name: 'Juegos destacados' })).toBeVisible()
  await expect(page).toHaveTitle('Descubrir · Shintai')

  await page.reload()
  await expect(page.getByRole('link', { name: 'Mi biblioteca (0 juegos)' })).toBeVisible()
  await page.getByRole('button', { name: 'Favorito: Celeste' }).click()
  await expect(page.getByRole('button', { name: 'Favorito: Celeste' })).toHaveAttribute('aria-pressed', 'true')
  await expectAccessible(page)
})
