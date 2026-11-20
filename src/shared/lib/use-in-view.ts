import { useEffect, useState } from 'react'

/**
 * Tracks whether an element is within (or close to) the viewport. Returns a callback ref, so an
 * element that mounts later (e.g. a "load more" sentinel that appears conditionally) is observed too.
 */
export function useInView<T extends Element>(rootMargin = '600px') {
  const [node, setNode] = useState<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin })
    observer.observe(node)
    return () => observer.disconnect()
  }, [node, rootMargin])

  return { ref: setNode, inView: node !== null && inView }
}
