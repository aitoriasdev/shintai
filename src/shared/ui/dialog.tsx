import { AnimatePresence, m } from 'motion/react'
import { type ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

/** Element that holds the rest of the app; made `inert` while a dialog is open. */
const APP_ROOT_ID = 'root'

/** Where focus goes on close when the opener no longer exists (e.g. its card was removed). */
function focusFallback(): HTMLElement | null {
  return document.querySelector<HTMLElement>('main[tabindex], main h1[tabindex]') ?? document.querySelector<HTMLElement>('main')
}

interface DialogProps {
  open: boolean
  onClose: () => void
  /** Id of the element that names the dialog. */
  labelledBy: string
  children: ReactNode
}

/**
 * Accessible modal dialog: the rest of the page becomes `inert` (focus and screen readers stay
 * inside), Escape and the backdrop close it, page scroll is locked and focus is restored on close
 * (to the opener, or to the main content when the opener has been removed meanwhile).
 *
 * Global live regions (`LiveAnnouncer`, `ErrorToast`) portal to `<body>`, outside the inert root,
 * so they keep working while a dialog is open.
 */
export function Dialog({ open, onClose, labelledBy, children }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const appRoot = document.getElementById(APP_ROOT_ID)
    const { overflow } = document.body.style

    appRoot?.setAttribute('inert', '')
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      appRoot?.removeAttribute('inert')
      document.body.style.overflow = overflow
      const target = previouslyFocused?.isConnected ? previouslyFocused : focusFallback()
      target?.focus()
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            className="relative max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-t-3xl border border-input bg-card shadow-2xl focus:outline-none sm:rounded-3xl"
            initial={{ y: 40, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 40, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
          >
            {children}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
