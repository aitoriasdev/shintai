import { useEffect, useRef, useState } from 'react'

/** Tracks whether an element is within (or close to) the viewport. */
export function useInView<T extends Element>(rootMargin = '600px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin })
    observer.observe(node)
    return () => observer.disconnect()
  }, [rootMargin])

  return { ref, inView }
}
