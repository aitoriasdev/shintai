import type { CoverWidth } from '@contracts/cover'

/**
 * URL of a game's cover resized by the API (`GET /api/covers`): WebP, same-origin and only as large as the card needs,
 * instead of Wikimedia's unscaled original.
 */
export function coverSrc(coverUrl: string, width: CoverWidth): string {
  return `/api/covers?${new URLSearchParams({ src: coverUrl, w: String(width) })}`
}

/** `srcSet` for a cover shown about 240 CSS pixels wide: 1x and 2x pixel density. */
export function coverSrcSet(coverUrl: string): string {
  return `${coverSrc(coverUrl, 240)} 1x, ${coverSrc(coverUrl, 480)} 2x`
}
