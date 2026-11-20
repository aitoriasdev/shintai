import { useCallback, useSyncExternalStore } from 'react'
import type { AppView } from '@/widgets/app-header/ui/app-header'

function readView(): AppView {
  return window.location.hash === '#library' ? 'library' : 'discover'
}

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

/** Current view, mirrored in the URL hash so reloads and the back button keep working. */
export function useHashView() {
  const view = useSyncExternalStore(subscribe, readView)
  const setView = useCallback((next: AppView) => {
    if (readView() !== next) window.location.hash = next
  }, [])
  return [view, setView] as const
}
