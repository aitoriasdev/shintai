import { expect, it } from 'vitest'
import { formatReleaseDate } from './format-release-date'

it('formats a full date in the UI language', () => {
  expect(formatReleaseDate('en-GB', '2018-01-25')).toBe('25 January 2018')
  expect(formatReleaseDate('es-ES', '2018-01-25')).toBe('25 de enero de 2018')
})

it('shows no more precision than the date has', () => {
  expect(formatReleaseDate('en-GB', '2018-01')).toBe('January 2018')
  expect(formatReleaseDate('es-ES', '2018-01')).toBe('enero de 2018')
  expect(formatReleaseDate('en-GB', '2018')).toBe('2018')
  expect(formatReleaseDate('es-ES', '2018')).toBe('2018')
})

it('does not shift the day in time zones behind UTC', () => {
  // A local-time Date for 1 January would print 31 December 2017 west of Greenwich.
  expect(formatReleaseDate('en-GB', '2018-01-01')).toBe('1 January 2018')
})
