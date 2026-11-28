import type { GameSummary } from '@contracts/game'
import { type FocusEvent, useLayoutEffect, useRef } from 'react'
import { focusPageHeading } from './focus-page-heading'

/**
 * Keeps keyboard focus when the focused card disappears (e.g. un-favoriting it under the "Favorites"
 * filter): focus moves to the card that took its place, or to the page heading (2.4.3).
 */
export function useFocusRecovery(games: GameSummary[]) {
  const listRef = useRef<HTMLUListElement>(null)
  const focusedIndex = useRef<number | null>(null)

  const onFocus = (event: FocusEvent<HTMLUListElement>) => {
    const item = (event.target as HTMLElement).closest('li')
    focusedIndex.current = item ? [...event.currentTarget.children].indexOf(item) : null
  }
  const onBlur = (event: FocusEvent<HTMLUListElement>) => {
    // Focus deliberately moved elsewhere (not lost because the card was removed).
    const movedOutside = !event.currentTarget.contains(event.relatedTarget as Node | null)
    if (movedOutside && (event.target as HTMLElement).isConnected) focusedIndex.current = null
  }

  useLayoutEffect(() => {
    const index = focusedIndex.current
    if (index === null || (document.activeElement !== document.body && document.activeElement !== null)) return
    const items = listRef.current?.children
    const next = items?.[Math.min(index, items.length - 1)]
    const target = next?.querySelector<HTMLElement>('h2 button')
    if (target) target.focus()
    else focusPageHeading()
  }, [games])

  // The whole grid can unmount (e.g. "No games match these filters") while it holds focus.
  useLayoutEffect(
    () => () => {
      if (focusedIndex.current !== null) queueMicrotask(focusPageHeading)
    },
    [],
  )

  return { listRef, onFocus, onBlur }
}
