import { readPreference, writePreference } from '@/shared/lib/preference-storage'

export const THEMES = ['system', 'light', 'dark'] as const
export type ThemePreference = (typeof THEMES)[number]

/** Also read by the inline script in `index.html`, which applies the theme before the first paint. */
export const THEME_STORAGE_KEY = 'shintai.theme'

const lightQuery = window.matchMedia('(prefers-color-scheme: light)')

function isTheme(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value)
}

let preference: ThemePreference = (() => {
  const saved = readPreference(THEME_STORAGE_KEY)
  return isTheme(saved) ? saved : 'system'
})()
const listeners = new Set<() => void>()

/** `<html data-theme>` always holds the resolved theme, so the stylesheet needs only one set of light tokens. */
function applyToDocument() {
  const resolved = preference === 'system' ? (lightQuery.matches ? 'light' : 'dark') : preference
  document.documentElement.dataset.theme = resolved
  document.documentElement.style.colorScheme = resolved
}
applyToDocument()

// "System" follows the OS live, e.g. when it switches to dark mode at sunset.
lightQuery.addEventListener('change', () => {
  if (preference === 'system') applyToDocument()
})

export function getThemePreference(): ThemePreference {
  return preference
}

export function setThemePreference(next: ThemePreference) {
  writePreference(THEME_STORAGE_KEY, next)
  if (next === preference) return
  preference = next
  applyToDocument()
  listeners.forEach((listener) => listener())
}

export function subscribeToTheme(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
