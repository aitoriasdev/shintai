import { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { getAnnouncement, subscribeToAnnouncements } from '@/shared/lib/announce'

/**
 * Polite live region for `announce()`. Render once, near the root of the app. It portals to `<body>`
 * so it is never inside the `inert` app root while a dialog is open.
 */
export function LiveAnnouncer() {
  const text = useSyncExternalStore(subscribeToAnnouncements, getAnnouncement)
  return createPortal(
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {text}
    </div>,
    document.body,
  )
}
