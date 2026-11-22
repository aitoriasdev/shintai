/** Languages the UI is translated into. British English is the source catalogue. */
export const LOCALES = ['en-GB', 'es-ES'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en-GB'

/** Each language is named in itself, so people can find theirs whatever the current UI language is. */
export const LOCALE_NAMES: Record<Locale, string> = {
  'en-GB': 'English (UK)',
  'es-ES': 'Español (España)',
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

/** Picks the best match for the browser's preferred languages: any Spanish variant → es-ES, otherwise en-GB. */
export function matchLocale(preferred: readonly string[]): Locale {
  for (const tag of preferred) {
    const language = tag.toLowerCase().split('-')[0]
    if (language === 'es') return 'es-ES'
    if (language === 'en') return 'en-GB'
  }
  return DEFAULT_LOCALE
}
