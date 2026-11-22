import { afterEach, expect, it } from 'vitest'
import { getMessages, LOCALE_STORAGE_KEY, setLocale } from './i18n-store'

afterEach(() => {
  setLocale('en-GB')
  window.localStorage.clear()
})

it('switches the catalogue, the page language, its description and the saved preference', () => {
  const meta = document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'description' }))
  setLocale('es-ES')
  expect(getMessages().header.library).toBe('Mi biblioteca')
  // 3.1.1 Language of Page.
  expect(document.documentElement.lang).toBe('es-ES')
  expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('es-ES')
  expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toMatch(/^Tu diario de videojuegos/)

  setLocale('en-GB')
  expect(getMessages().header.library).toBe('My library')
  expect(document.documentElement.lang).toBe('en-GB')
  meta.remove()
})

it('formats counts and numbers for each language', () => {
  setLocale('es-ES')
  const es = getMessages()
  expect(es.header.libraryCount(1)).toBe('(1 juego)')
  expect(es.header.libraryCount(3)).toBe('(3 juegos)')
  expect(es.library.averageScore(7.5)).toBe('7,5')
  expect(es.library.completionRate(25)).toBe('25\u00a0%') // Spanish separates the % sign with a no-break space
  expect(es.backup.imported(1, 2, 0)).toBe('Importación completada: 1 añadido, 2 actualizados, 0 sin cambios.')

  setLocale('en-GB')
  const en = getMessages()
  expect(en.header.libraryCount(1)).toBe('(1 game)')
  expect(en.library.averageScore(7.5)).toBe('7.5')
  expect(en.library.completionRate(25)).toBe('25%')
  expect(en.app.number(12_345)).toBe('12,345')
})
