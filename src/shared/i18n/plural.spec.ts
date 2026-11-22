import { expect, it } from 'vitest'
import { plural } from './plural'

const forms = { one: 'juego', many: 'de juegos', other: 'juegos' }

it('picks the CLDR plural form for the locale', () => {
  expect(plural('es-ES', 1, forms)).toBe('juego')
  expect(plural('es-ES', 0, forms)).toBe('juegos')
  expect(plural('es-ES', 2, forms)).toBe('juegos')
  expect(plural('en-GB', 1, { one: 'game', other: 'games' })).toBe('game')
})

it('falls back to "other" when a form is missing', () => {
  expect(plural('es-ES', 1_000_000, { one: 'juego', other: 'juegos' })).toBe('juegos')
})
