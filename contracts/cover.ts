import { z } from 'zod'

/** Hosts the API fetches cover art from. Anything else is refused, so the endpoint can't be used to reach other servers. */
export const COVER_HOSTS = ['upload.wikimedia.org', 'thumb.wikimedia.org'] as const

/** Widths the API resizes covers to: a card or the dialog at 1x and 2x pixel density. */
export const COVER_WIDTHS = [240, 480] as const

export type CoverWidth = (typeof COVER_WIDTHS)[number]

export const coverQuerySchema = z.object({
  /** The Wikimedia URL from a game's `coverUrl`. */
  src: z.url({ protocol: /^https$/, hostname: new RegExp(`^(${COVER_HOSTS.map((host) => host.replaceAll('.', '\\.')).join('|')})$`),
    error: `Must be an HTTPS URL on ${COVER_HOSTS.join(' or ')}`,
  }),
  /** Target width in pixels; the image keeps its aspect ratio and is never enlarged. */
  w: z.enum(['240', '480'] as const satisfies readonly `${CoverWidth}`[]).transform((width) => Number(width) as CoverWidth),
})

export type CoverQuery = z.infer<typeof coverQuerySchema>
