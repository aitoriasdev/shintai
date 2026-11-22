import { afterEach, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'
import { setLocale } from '@/shared/i18n/i18n-store'
import { setThemePreference } from '../model/theme-store'
import { AppHeader } from './app-header'

afterEach(() => {
  setLocale('en-GB')
  setThemePreference('system')
  window.localStorage.clear()
})

const renderHeader = () =>
  render(<AppHeader view="discover" onViewChange={() => {}} libraryCount={1} search={<input aria-label="search" />} />)

it('opens from the header and closes with Escape, returning focus to its button', async () => {
  const screen = await renderHeader()
  const button = screen.getByRole('button', { name: 'Preferences' })
  await expect.element(screen.getByRole('button', { name: 'Preferences', expanded: false })).toBeVisible()

  await button.click()
  await expect.element(screen.getByRole('group', { name: 'Preferences' })).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Preferences', expanded: true })).toBeVisible()

  await screen.getByRole('radio', { name: 'Dark' }).click()
  await userEvent.keyboard('{Escape}')
  await expect.element(screen.getByRole('button', { name: 'Preferences', expanded: false })).toHaveFocus()
  await expect.element(screen.getByRole('radio', { name: 'Dark' })).not.toBeInTheDocument()
})

it('switches the theme', async () => {
  const screen = await renderHeader()
  await screen.getByRole('button', { name: 'Preferences' }).click()

  await screen.getByRole('radio', { name: 'Light' }).click()
  expect(document.documentElement.dataset.theme).toBe('light')
  await expect.element(screen.getByRole('radio', { name: 'Light' })).toBeChecked()

  await screen.getByRole('radio', { name: 'Dark' }).click()
  expect(document.documentElement.dataset.theme).toBe('dark')
})

it('switches the language of the whole interface', async () => {
  const screen = await renderHeader()
  await screen.getByRole('button', { name: 'Preferences' }).click()

  await screen.getByRole('combobox', { name: 'Language' }).selectOptions('Español (España)')
  expect(document.documentElement.lang).toBe('es-ES')
  await expect.element(screen.getByRole('link', { name: 'Mi biblioteca (1 juego)' })).toBeVisible()
  await expect.element(screen.getByRole('combobox', { name: 'Idioma' })).toHaveValue('es-ES')
  // Each language is named in itself, so it can be found from any UI language.
  await expect.element(screen.getByRole('option', { name: 'English (UK)' })).toHaveAttribute('lang', 'en-GB')
})
