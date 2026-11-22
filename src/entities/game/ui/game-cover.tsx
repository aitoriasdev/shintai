import { Gamepad2 } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '@/shared/i18n/use-i18n'
import { cn } from '@/shared/lib/cn'

interface GameCoverProps {
  title: string
  src: string | null
  className?: string
  /** Load eagerly (e.g. inside a dialog) instead of lazily. */
  eager?: boolean
  /** Hide from assistive tech when the title is already next to the cover (1.1.1). */
  decorative?: boolean
}

/** Box art with a lazy, fade-in image, and a plain title label (like a blank cartridge) when there is no cover. */
export function GameCover({ title, src, className, eager = false, decorative = false }: GameCoverProps) {
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
    <div className={cn('relative aspect-[3/4] overflow-hidden bg-surface-2', className)} aria-hidden={decorative || undefined}>
      {showImage ? (
        <img
          src={src}
          alt={decorative ? '' : t.game.coverAlt(title)}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={cn('size-full object-cover transition-opacity duration-500', status === 'loaded' ? 'opacity-100' : 'opacity-0')}
        />
      ) : (
        <div
          role={decorative ? undefined : 'img'}
          aria-label={decorative ? undefined : t.game.noCover(title)}
          className="flex size-full flex-col justify-between border-t-4 border-accent p-4"
        >
          <Gamepad2 className="size-6 text-accent" aria-hidden="true" />
          <span className="line-clamp-4 text-lg leading-tight font-bold tracking-tight text-balance text-text" aria-hidden="true">
            {title}
          </span>
        </div>
      )}
      {showImage && status === 'loading' && <div className="absolute inset-0 animate-pulse bg-surface-2 motion-reduce:animate-none" aria-hidden="true" />}
    </div>
  )
}
