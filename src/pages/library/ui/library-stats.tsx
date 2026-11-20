import type { LibraryEntry } from '@contracts/library'
import { CircleCheck, Gamepad2, Heart, Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { computeStats } from '../model/compute-stats'

/** Each stat is a `<div>` that directly wraps one `<dt>`/`<dd>` pair, as valid `<dl>` content requires (1.3.1). */
function Stat({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="relative rounded-2xl border border-border bg-surface py-4 pr-4 pl-17">
      <dt className="text-xs text-muted">
        <span aria-hidden="true" className="absolute top-1/2 left-4 grid size-10 -translate-y-1/2 place-items-center rounded-xl bg-surface-2">
          {icon}
        </span>
        {label}
      </dt>
      <dd className="text-xl font-bold text-text tabular-nums">
        {value}
        {hint && <span className="ml-1.5 text-xs font-medium text-muted">{hint}</span>}
      </dd>
    </div>
  )
}

export function LibraryStats({ entries }: { entries: LibraryEntry[] }) {
  const stats = computeStats(entries)
  return (
    <section aria-labelledby="library-stats-title">
      <h2 id="library-stats-title" className="sr-only">
        Statistics
      </h2>
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat icon={<Gamepad2 className="size-5 text-accent" aria-hidden="true" />} label="Games" value={String(stats.total)} />
      <Stat
        icon={<CircleCheck className="size-5 text-completed" aria-hidden="true" />}
        label="Completed"
        value={String(stats.completed)}
        hint={`${stats.completionRate}%`}
      />
      <Stat icon={<Heart className="size-5 text-favorite" aria-hidden="true" />} label="Favorites" value={String(stats.favorites)} />
      <Stat
        icon={<Star className="size-5 text-score" aria-hidden="true" />}
        label="Average score"
        value={stats.averageScore === null ? 'None yet' : stats.averageScore.toFixed(1)}
      />
    </dl>
    </section>
  )
}
