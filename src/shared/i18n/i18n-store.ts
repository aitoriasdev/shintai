import { readPreference, writePreference } from '@/shared/lib/preference-storage'
import { isLocale, type Locale, matchLocale } from './locales'
import { enGB, type Messages } from './messages/en-gb'
import { esES } from './messages/es-es'

/** Also read by the inline script in `index.html`, which sets `<html lang>` before the first paint. */
export const LOCALE_STORAGE_KEY = 'shintai.locale'

const CATALOGUES: Record<Locale, Messages> = { 'en-GB': enGB, 'es-ES': esES }

function initialLocale(): Locale {
  const saved = readPreference(LOCALE_STORAGE_KEY)
  return isLocale(saved) ? saved : matchLocale(navigator.languages)
}

let locale = initialLocale()
const listeners = new Set<() => void>()

function applyToDocument() {
  // 3.1.1 Language of Page: screen readers switch voice and pronunciation with it.
  document.documentElement.lang = locale
  document.querySelector('meta[name="description"]')?.setAttribute('content', CATALOGUES[locale].app.description)
}
applyToDocument()

export function getLocale(): Locale {
  return locale
}

/** The current catalogue, for code outside React (e.g. a mutation's error handler). */
export function getMessages(): Messages {
  return CATALOGUES[locale]
}

export function setLocale(next: Locale) {
  writePreference(LOCALE_STORAGE_KEY, next)
  if (next === locale) return
  locale = next
  applyToDocument()
  listeners.forEach((listener) => listener())
}

export function subscribeToLocale(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
