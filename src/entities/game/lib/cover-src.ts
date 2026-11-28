import type { CoverWidth } from '@contracts/cover'
import { IS_DEMO } from '@/shared/config/deployment'

/**
 * URL of a game's cover, resized: WebP, same-origin and only as large as the card needs, instead of Wikimedia's unscaled
 * original. The local API resizes it (`GET /api/covers`); the hosted demo uses Vercel's image optimisation.
 */
export function coverSrc(coverUrl: string, width: CoverWidth, demo = IS_DEMO): string {
  if (demo) return `/_vercel/image?${new URLSearchParams({ url: coverUrl, w: String(width), q: '75' })}`
  return `/api/covers?${new URLSearchParams({ src: coverUrl, w: String(width) })}`
}

/** `srcSet` for a cover shown about 240 CSS pixels wide: 1x and 2x pixel density. */
export function coverSrcSet(coverUrl: string): string {
  return `${coverSrc(coverUrl, 240)} 1x, ${coverSrc(coverUrl, 480)} 2x`
}
