import { GRID_CLASS } from './game-grid'

export function GameGridSkeleton({ count = 12, label = 'Loading games' }: { count?: number; label?: string }) {
  return (
    <div role="status">
      <span className="sr-only">{label}…</span>
      <div className={GRID_CLASS} aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="aspect-[3/4] animate-pulse bg-surface-2 motion-reduce:animate-none" />
            <div className="space-y-2 p-3">
              <div className="h-3.5 w-3/4 animate-pulse rounded bg-surface-2 motion-reduce:animate-none" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-surface-2 motion-reduce:animate-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
