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

test('rates and completes a game, persisted in SQLite', async ({ page }) => {
  await page.getByRole('button', { name: 'Outer Wilds', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Outer Wilds' })

  await dialog.getByRole('radio', { name: '9 out of 10' }).check()
  await dialog.getByRole('radio', { name: '9 out of 10' }).press('ArrowRight')
  await expect(dialog.getByRole('radio', { name: '10 out of 10' })).toBeChecked()
  await dialog.getByRole('button', { name: 'Completed: Outer Wilds' }).click()
  await expect(dialog.getByRole('button', { name: 'Remove from library' })).toBeVisible()
  await page.keyboard.press('Escape')

  await page.reload()
  await expect(gameCard(page, 'Outer Wilds').getByText('Your score: 10 out of 10')).toBeAttached()
  await expect(page.getByRole('button', { name: 'Completed: Outer Wilds' })).toHaveAttribute('aria-pressed', 'true')
})

test('meets WCAG 2.1 AA', async ({ page }) => {
  await page.getByRole('button', { name: 'Celeste', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Celeste' })
  await dialog.getByRole('radio', { name: '3 out of 10' }).check()
  await expect(dialog.getByText('Indie Studio')).toBeVisible()
  await expectAccessible(page, '[role="dialog"]')
})

test('keeps the cover and the close button in place while the game information scrolls', async ({ page }) => {
  // Short enough for the information to overflow the panel.
  await page.setViewportSize({ width: 1024, height: 420 })
  await page.getByRole('button', { name: 'Outer Wilds', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Outer Wilds' })
  await expect(dialog.getByText('A wonderful game.')).toBeVisible()

  const cover = dialog.getByRole('img', { name: /Outer Wilds/ })
  const close = dialog.getByRole('button', { name: 'Close' })
  // Wait for the opening animation (a slight scale and slide) to settle before measuring.
  let previous: Awaited<ReturnType<typeof cover.boundingBox>> = null
  await expect
    .poll(async () => {
      const box = await cover.boundingBox()
      const settled = JSON.stringify(box) === JSON.stringify(previous)
      previous = box
      return settled
    })
    .toBe(true)
  const before = { cover: await cover.boundingBox(), close: await close.boundingBox() }

  // Scroll the column that holds the title, as the mouse wheel would.
  const scrolled = await dialog.getByRole('heading', { name: 'Outer Wilds' }).evaluate((heading) => {
    let column = heading.parentElement
    while (column && getComputedStyle(column).overflowY !== 'auto') column = column.parentElement
    if (!column || column.scrollHeight <= column.clientHeight) return 0
    column.scrollTop = column.scrollHeight
    return column.scrollTop
  })
  expect(scrolled).toBeGreaterThan(0)
  await expect(dialog.getByRole('heading', { name: 'Outer Wilds' })).not.toBeInViewport()

  expect(await cover.boundingBox()).toEqual(before.cover)
  expect(await close.boundingBox()).toEqual(before.close)
  await expectAccessible(page)
})
