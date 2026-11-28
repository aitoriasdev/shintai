import { type RefObject, useEffect, useRef } from 'react'
import { focusHeading } from './focus-heading'

/**
 * After `value` changes (not on the first render), moves focus to the `<h1>` inside `containerRef`, waiting for it if
 * the new content is still loading (2.4.3 Focus Order after a view change).
 */
export function useFocusHeadingOnChange(value: unknown, containerRef: RefObject<HTMLElement | null>) {
  const previous = useRef(value)
  useEffect(() => {
    if (previous.current === value) return
    previous.current = value
    if (containerRef.current) return focusHeading(containerRef.current)
  }, [value, containerRef])
}
