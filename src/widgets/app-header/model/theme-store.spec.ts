import { afterEach, expect, it } from 'vitest'
import { getThemePreference, setThemePreference, THEME_STORAGE_KEY } from './theme-store'

afterEach(() => {
  setThemePreference('system')
  window.localStorage.clear()
})

const root = document.documentElement

it('applies and saves an explicit theme', () => {
  setThemePreference('light')
  expect(getThemePreference()).toBe('light')
  expect(root.dataset.theme).toBe('light')
  expect(root.style.colorScheme).toBe('light')
  expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')

  setThemePreference('dark')
  expect(root.dataset.theme).toBe('dark')
})

it('resolves "system" to the operating system’s colour scheme', () => {
  setThemePreference('dark')
  setThemePreference('system')
  const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  expect(root.dataset.theme).toBe(systemTheme)
})

it('switches the colour tokens with the theme', () => {
  setThemePreference('light')
  expect(getComputedStyle(document.body).backgroundColor).toBe('rgb(245, 244, 250)')
  setThemePreference('dark')
  expect(getComputedStyle(document.body).backgroundColor).toBe('rgb(11, 11, 18)')
})
