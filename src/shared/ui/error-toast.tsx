import { AlertTriangle, X } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { dismissError, getCurrentError, subscribeToErrors } from '@/shared/lib/error-notifications'

/**
 * Alert region for `showError()`. Render once, near the root of the app. It portals to `<body>`
 * so errors stay announced and dismissible while a dialog makes the app root `inert`.
 */
export function ErrorToast() {
  const text = useSyncExternalStore(subscribeToErrors, getCurrentError)
  return createPortal(
    <div role="alert" className="fixed inset-x-4 bottom-4 z-[70] flex justify-center sm:inset-x-auto sm:right-6 sm:bottom-6">
      {text && (
        <div className="flex max-w-md items-start gap-3 rounded-2xl border border-danger bg-surface p-4 text-sm text-text shadow-2xl">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
          <p className="flex-1">{text}</p>
          <button
            type="button"
            onClick={dismissError}
            aria-label="Dismiss"
            className="-m-2 grid size-9 shrink-0 place-items-center rounded-full text-muted hover:text-text pointer-coarse:size-11"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>,
    document.body,
  )
}
