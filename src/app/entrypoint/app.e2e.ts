import { expect, test } from '@playwright/test'
import { expectAccessible } from '@/shared/lib/testing/expect-accessible'

test('renders the app and meets WCAG 2.1 AA', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Shintai')
  await expect(page.getByRole('heading', { level: 1, name: 'Shintai' })).toBeVisible()
  await expectAccessible(page)
})
