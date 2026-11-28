/** Where focus goes on close when the opener no longer exists (e.g. its card was removed). */
export function focusFallback(): HTMLElement | null {
  return document.querySelector<HTMLElement>('main[tabindex], main h1[tabindex]') ?? document.querySelector<HTMLElement>('main')
}
