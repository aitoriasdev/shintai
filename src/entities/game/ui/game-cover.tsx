import { ImageOff } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '@/shared/i18n/use-i18n'
import { coverSrc, coverSrcSet } from '../lib/cover-src'
import { cn } from 'cn'

interface GameCoverProps {
  title: string
  src: string | null
  className?: string
  /** Load eagerly (e.g. inside a dialog) instead of lazily. */
  eager?: boolean
  /** The largest image on first paint (the first covers of a grid): load it eagerly and before other images. */
  priority?: boolean
  /** Hide from assistive tech when the title is already next to the cover (1.1.1). */
  decorative?: boolean
}

/** Box art with a lazy, fade-in image, and a "no image" icon when there is no cover or it fails to load. */
export function GameCover({ title, src, className, eager = false, priority = false, decorative = false }: GameCoverProps) {
  const { t } = useI18n()
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  // A new source (e.g. the dialog swapping the thumbnail for a larger image) deserves a fresh attempt.
  const [currentSrc, setCurrentSrc] = useState(src)
  if (src !== currentSrc) {
    setCurrentSrc(src)
    setStatus('loading')
  }
  const showImage = src && status !== 'error'

  return (
    <div className={cn('relative aspect-[3/4] overflow-hidden bg-muted', className)} aria-hidden={decorative || undefined}>
      {showImage ? (
        <img
          src={coverSrc(src, 240)}
          srcSet={coverSrcSet(src)}
          alt={decorative ? '' : t.game.coverAlt(title)}
          loading={eager || priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={cn('size-full object-cover transition-opacity duration-500', status === 'loaded' ? 'opacity-100' : 'opacity-0')}
        />
      ) : (
        // The title is already next to the cover (card) or above it (dialog), so the fallback is just an icon.
        <div
          role={decorative ? undefined : 'img'}
          aria-label={decorative ? undefined : t.game.noCover(title)}
          className="grid size-full place-items-center text-muted-foreground"
        >
          <ImageOff className="size-10" strokeWidth={1.5} aria-hidden="true" />
        </div>
      )}
      {showImage && status === 'loading' && <div className="absolute inset-0 animate-pulse bg-muted motion-reduce:animate-none" aria-hidden="true" />}
    </div>
  )
}
