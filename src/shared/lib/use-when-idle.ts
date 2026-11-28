import { useEffect } from 'react'

/**
 * Runs `callback` once, after mount, when the browser is idle (at the latest after `timeout` ms), for work that must
 * not compete with the first paint, such as prefetching code. Falls back to a timer where `requestIdleCallback` is
 * missing (Safari). Pass a stable callback.
 */
export function useWhenIdle(callback: () => void, timeout = 3000) {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(callback, { timeout })
      return () => cancelIdleCallback(id)
    }
    const id = setTimeout(callback, timeout / 2)
    return () => clearTimeout(id)
  }, [callback, timeout])
}
