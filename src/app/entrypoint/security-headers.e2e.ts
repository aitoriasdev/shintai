import { expect, test } from '@playwright/test'
import { resetLibrary, stubCatalog } from '@/shared/lib/testing/e2e-catalog'

test('the app works under its Content Security Policy and Trusted Types', async ({ page }) => {
  // Collect every blocked script, style, image or DOM sink before the page's own code runs.
  await page.addInitScript(() => {
    const violations: string[] = []
    Object.assign(window, { cspViolations: violations })
    document.addEventListener('securitypolicyviolation', (event) => violations.push(`${event.effectiveDirective}: ${event.blockedURI}`))
  })
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  await resetLibrary(page)
  await stubCatalog(page)

  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  // Exercise the main flows: details dialog, a library write, the library page, preferences and the backup export.
  await page.getByRole('button', { name: 'Celeste', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Celeste' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await page.getByRole('button', { name: 'Favourite: Celeste' }).click()
  await page.getByRole('link', { name: /My library/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'My library' })).toBeVisible()
  await page.getByRole('button', { name: 'Preferences' }).click()
  await page.getByRole('radio', { name: 'Light' }).check()
  await page.getByRole('combobox', { name: 'Language' }).selectOption('es-ES')
  await page.keyboard.press('Escape')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: /Exportar/ }).click()
  await download

  expect(await page.evaluate(() => (window as unknown as { cspViolations: string[] }).cspViolations)).toEqual([])
  expect(consoleErrors.filter((text) => /Content Security Policy|Trusted Type/i.test(text))).toEqual([])
})

test('allows the inline theme script by its hash and refuses to be framed (clickjacking)', async ({ request }) => {
  const res = await request.get('/')
  expect(res.headers()['content-security-policy']).toMatch(/script-src 'self' 'sha256-[\w+/=]+';/)
  expect(res.headers()['content-security-policy']).not.toContain('unsafe-inline')
  expect(res.headers()['content-security-policy']).toContain("frame-ancestors 'none'")
  expect(res.headers()['x-frame-options']).toBe('DENY')
  expect(res.headers()['cross-origin-opener-policy']).toBe('same-origin')
})
