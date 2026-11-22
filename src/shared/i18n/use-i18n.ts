import { useSyncExternalStore } from 'react'
import { getLocale, getMessages, setLocale, subscribeToLocale } from './i18n-store'

/** Current language and its messages; re-renders when the language changes. */
export function useI18n() {
  const locale = useSyncExternalStore(subscribeToLocale, getLocale)
  return { locale, t: getMessages(), setLocale }
}
