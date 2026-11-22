import { useI18n } from '@/shared/i18n/use-i18n'
import { GRID_CLASS } from './game-grid'

const pulse = 'animate-pulse bg-surface-2 motion-reduce:animate-none'

export function GameGridSkeleton({ count = 12, label }: { count?: number; label?: string }) {
  const { t } = useI18n()
  return (
    <div role="status">
      <span className="sr-only">{label ?? t.discover.loading}…</span>
      <div className={GRID_CLASS} aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <div key={i}>
            <div className={`aspect-[3/4] rounded-xl ${pulse}`} />
            <div className={`mt-3 h-3.5 w-3/4 rounded ${pulse}`} />
            <div className={`mt-2 h-3 w-1/3 rounded ${pulse}`} />
          </div>
        ))}
      </div>
    </div>
  )
}
