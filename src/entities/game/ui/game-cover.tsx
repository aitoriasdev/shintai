import { Gamepad2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/shared/lib/cn'

interface GameCoverProps {
  title: string
  src: string | null
  className?: string
  /** Load eagerly (e.g. inside a dialog) instead of lazily. */
  eager?: boolean
}

/** Box art with a lazy, fade-in image and a generated fallback when there is no cover. */
export function GameCover({ title, src, className, eager = false }: GameCoverProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const showImage = src && status !== 'error'

  return (
    <div className={cn('relative aspect-[3/4] overflow-hidden bg-surface-2', className)}>
      {showImage ? (
        <img
          src={src}
          alt={`${title} cover`}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={cn(
            'size-full object-cover transition-opacity duration-500',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
          )}
        />
      ) : (
        <div
          role="img"
          aria-label={`${title} (no cover available)`}
          className="flex size-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-accent/30 via-surface-2 to-surface p-4 text-center"
        >
          <Gamepad2 className="size-8 text-accent" aria-hidden="true" />
          <span className="line-clamp-3 text-sm font-semibold text-text/80">{title}</span>
        </div>
      )}
      {showImage && status === 'loading' && <div className="absolute inset-0 animate-pulse bg-surface-2" aria-hidden="true" />}
    </div>
  )
}
