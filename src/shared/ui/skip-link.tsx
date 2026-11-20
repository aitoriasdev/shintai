/** 2.4.1 Bypass Blocks: first focusable element, visible only while focused. */
export function SkipLink({ targetId, children = 'Skip to main content' }: { targetId: string; children?: string }) {
  return (
    <a
      href={`#${targetId}`}
      onClick={(event) => {
        // Hash links are used for routing, so move focus manually instead of changing the URL.
        event.preventDefault()
        document.getElementById(targetId)?.focus()
      }}
      className="fixed top-3 left-3 z-[60] -translate-y-24 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent focus:translate-y-0"
    >
      {children}
    </a>
  )
}
