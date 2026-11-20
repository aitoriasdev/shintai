/** 4.1.3 Status Messages: store behind `<LiveAnnouncer />` for polite, screen-reader-only announcements. */
let message = ''
const listeners = new Set<() => void>()

function emit(next: string) {
  message = next
  listeners.forEach((listener) => listener())
}

export function announce(text: string) {
  // Clear first so identical consecutive messages are announced again.
  emit('')
  queueMicrotask(() => emit(text))
}

export function subscribeToAnnouncements(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getAnnouncement() {
  return message
}
