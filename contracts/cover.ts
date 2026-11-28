import { z } from 'zod'

/** Hosts the API fetches cover art from. Anything else is refused, so the endpoint can't be used to reach other servers. */
export const COVER_HOSTS = ['upload.wikimedia.org', 'thumb.wikimedia.org'] as const

/** Widths the API resizes covers to: a card or the dialog at 1x and 2x pixel density. */
export const COVER_WIDTHS = [240, 480] as const

export type CoverWidth = (typeof COVER_WIDTHS)[number]

const COVER_SRC_ERROR = `Must be an HTTPS URL on ${COVER_HOSTS.join(' or ')}`

export const coverQuerySchema = z.object({
  /** The Wikimedia URL from a game's `coverUrl`. */
  src: z
    .url({ protocol: /^https$/, error: COVER_SRC_ERROR })
    // An exact hostname match, not a pattern: nothing else (no subdomain, look-alike or local address) gets through.
    .refine((url) => URL.canParse(url) && (COVER_HOSTS as readonly string[]).includes(new URL(url).hostname), { error: COVER_SRC_ERROR }),
  /** Target width in pixels; the image keeps its aspect ratio and is never enlarged. */
  w: z.enum(['240', '480'] as const satisfies readonly `${CoverWidth}`[]).transform((width) => Number(width) as CoverWidth),
})

export type CoverQuery = z.infer<typeof coverQuerySchema>
