import type { Locale } from './locales'

/**
 * Formats an ISO 8601 date that is only as precise as the source knows (`2018`, `2018-01` or `2018-01-25`)
 * in the UI language: "25 January 2018" / "25 de enero de 2018", "January 2018" / "enero de 2018", "2018".
 */
export function formatReleaseDate(locale: Locale, isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const options: Intl.DateTimeFormatOptions = { timeZone: 'UTC', year: 'numeric' }
  if (month) options.month = 'long'
  if (month && day) options.day = 'numeric'
  return new Intl.DateTimeFormat(locale, options).format(Date.UTC(year, (month || 1) - 1, day || 1))
}
