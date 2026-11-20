import { expect, test } from '@playwright/test'
import { gameCard, resetLibrary, stubCatalog } from '@/shared/lib/testing/e2e-catalog'
import { expectAccessible } from '@/shared/lib/testing/expect-accessible'

test.beforeEach(async ({ page }) => {
  await resetLibrary(page)
  await stubCatalog(page)
  await page.goto('/')
  await expect(gameCard(page, 'Outer Wilds')).toBeVisible()
})

test('opens from the keyboard, contains focus and restores it on close (2.1.1, 2.4.3)', async ({ page }) => {
  const opener = page.getByRole('button', { name: 'Outer Wilds', exact: true })
  await opener.focus()
  await page.keyboard.press('Enter')

  const dialog = page.getByRole('dialog', { name: 'Outer Wilds' })
  await expect(dialog).toBeFocused()
  await expect(dialog.getByText('A wonderful game.')).toBeVisible()

  // Tabbing through every control never leaves the dialog: the page behind it is inert.
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab')
    const insideDialog = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]') || document.activeElement === document.body)
    expect(insideDialog).toBe(true)
  }

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(opener).toBeFocused()
})

test('meets WCAG 2.1 AA', async ({ page }) => {
  await page.getByRole('button', { name: 'Celeste', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Celeste' })
  await expect(dialog.getByText('Indie Studio')).toBeVisible()
  await expectAccessible(page, '[role="dialog"]')
})
