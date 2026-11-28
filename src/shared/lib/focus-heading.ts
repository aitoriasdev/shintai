/**
 * Focuses the first `<h1>` inside `container` (2.4.3 after a view change). When the heading isn't rendered yet, as
 * with a lazily loaded page, it waits for it. Returns a function that stops waiting.
 */
export function focusHeading(container: HTMLElement): () => void {
  const heading = container.querySelector<HTMLElement>('h1')
  if (heading) {
    heading.focus()
    return () => {}
  }
  const observer = new MutationObserver(() => {
    const rendered = container.querySelector<HTMLElement>('h1')
    if (!rendered) return
    observer.disconnect()
    rendered.focus()
  })
  observer.observe(container, { childList: true, subtree: true })
  return () => observer.disconnect()
}
