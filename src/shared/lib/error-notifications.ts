/**
 * Store behind `<ErrorToast />`: visible + announced errors (3.3.1, 4.1.3).
 * Messages stay until dismissed, so there is no time limit to read them (2.2.1).
 */
let current: string | null = null
const listeners = new Set<() => void>()

function emit(next: string | null) {
  current = next
  listeners.forEach((listener) => listener())
}

export function showError(text: string) {
  emit(text)
}

export function dismissError() {
  emit(null)
}

export function subscribeToErrors(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getCurrentError() {
  return current
}
