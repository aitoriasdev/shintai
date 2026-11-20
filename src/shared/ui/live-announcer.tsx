import { useSyncExternalStore } from 'react'
import { getAnnouncement, subscribeToAnnouncements } from '@/shared/lib/announce'

/** Polite live region for `announce()`. Render once, near the root of the app. */
export function LiveAnnouncer() {
  const text = useSyncExternalStore(subscribeToAnnouncements, getAnnouncement)
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {text}
    </div>
  )
}
