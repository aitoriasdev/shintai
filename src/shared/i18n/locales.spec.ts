import { expect, it } from 'vitest'
import { isLocale, matchLocale } from './locales'

it('matches the first supported language the browser prefers', () => {
  expect(matchLocale(['es-MX', 'en-US'])).toBe('es-ES')
  expect(matchLocale(['en-US', 'es-ES'])).toBe('en-GB')
  expect(matchLocale(['fr-FR', 'es'])).toBe('es-ES')
})

it('falls back to British English', () => {
  expect(matchLocale(['fr-FR', 'de'])).toBe('en-GB')
  expect(matchLocale([])).toBe('en-GB')
})

it('accepts only the supported locale tags', () => {
  expect(isLocale('es-ES')).toBe(true)
  expect(isLocale('es')).toBe(false)
  expect(isLocale(null)).toBe(false)
})
