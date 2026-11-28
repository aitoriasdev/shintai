/** Fallback when no card is left to take focus: the page heading (rendered with tabIndex -1). */
export function focusPageHeading() {
  if (document.activeElement === document.body || document.activeElement === null) {
    document.querySelector<HTMLElement>('main h1')?.focus()
  }
}
