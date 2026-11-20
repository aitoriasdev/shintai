import type { LibraryEntry } from '@contracts/library'
import { CircleCheck, Gamepad2, Heart, Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { computeStats } from '../model/compute-stats'

function Stat({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2">{icon}</div>
      <div className="min-w-0">
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="text-xl font-bold text-text tabular-nums">
          {value}
          {hint && <span className="ml-1.5 text-xs font-medium text-muted">{hint}</span>}
        </dd>
      </div>
    </div>
  )
}

export function LibraryStats({ entries }: { entries: LibraryEntry[] }) {
  const stats = computeStats(entries)
  return (
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
        value={stats.averageScore === null ? '—' : stats.averageScore.toFixed(1)}
      />
    </dl>
  )
}
