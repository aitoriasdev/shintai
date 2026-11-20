import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

const WCAG_21_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']

/** Fails with a readable list when axe-core finds WCAG 2.1 A/AA (or best-practice) violations on the page. */
export async function expectAccessible(page: Page, include?: string) {
  const builder = new AxeBuilder({ page }).withTags(WCAG_21_AA)
  if (include) builder.include(include)
  const { violations } = await builder.analyze()
  expect(violations.map((v) => `${v.id} (${v.impact}): ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
}
