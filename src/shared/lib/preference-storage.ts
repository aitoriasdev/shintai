/**
 * localStorage for small UI preferences (language, theme). Storage can be unavailable (private mode,
 * blocked site data): reads then fall back to the default and writes only last until the page reloads.
 * Either way the failure is logged, so it is never silent.
 */
export function readPreference(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch (error) {
    console.warn(`Could not read the "${key}" preference; using the default.`, error)
    return null
  }
}

export function writePreference(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch (error) {
    console.warn(`Could not save the "${key}" preference; it applies until the page reloads.`, error)
  }
}
