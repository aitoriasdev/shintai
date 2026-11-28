import { useI18n } from '@/shared/i18n/use-i18n'
import { Skeleton } from '@/shared/ui/skeleton'
import { GRID_CLASS } from '../lib/grid-class'

export function GameGridSkeleton({ count = 12, label }: { count?: number; label?: string }) {
  const { t } = useI18n()
  return (
    <div role="status">
      <span className="sr-only">{label ?? t.discover.loading}…</span>
      <div className={GRID_CLASS} aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <div key={i}>
            <Skeleton className="aspect-[3/4] rounded-xl" />
            <Skeleton className="mt-3 h-3.5 w-3/4 rounded" />
            <Skeleton className="mt-2 h-3 w-1/3 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
