import { useState } from 'react'

/** True from the first render where `value` is truthy, and stays true (e.g. mount a lazy dialog on its first open). */
export function useHasBeenTruthy(value: unknown): boolean {
  const [hasBeen, setHasBeen] = useState(Boolean(value))
  if (value && !hasBeen) setHasBeen(true)
  return hasBeen
}
