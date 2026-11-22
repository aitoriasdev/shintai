import type { LibraryEntry } from '@contracts/library'
import { useI18n } from '@/shared/i18n/use-i18n'
import { cn } from '@/shared/lib/cn'
import { computeStats } from '../model/compute-stats'

/**
 * Each stat is a `<div>` that directly wraps one `<dt>`/`<dd>` pair, as valid `<dl>` content requires (1.3.1).
 * The figure is shown first, but the label still comes first in the DOM and for screen readers.
 */
function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone: string }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-3xl font-bold tracking-tight text-text tabular-nums">
        <span className={cn('mr-2 inline-block size-2 -translate-y-1.5 rounded-full', tone)} aria-hidden="true" />
        {value}
        {hint && <span className="ml-2 text-sm font-medium tracking-normal text-muted">{hint}</span>}
      </dd>
    </div>
  )
}

export function LibraryStats({ entries }: { entries: LibraryEntry[] }) {
  const { t } = useI18n()
  const stats = computeStats(entries)

  return (
    <section aria-labelledby="library-stats-title" className="space-y-4">
      <h2 id="library-stats-title" className="sr-only">
        {t.library.stats}
      </h2>
      <dl className="flex flex-wrap gap-x-10 gap-y-4">
        <Stat tone="bg-accent" label={t.library.statGames} value={t.app.number(stats.total)} />
        <Stat
          tone="bg-completed"
          label={t.library.statCompleted}
          value={t.app.number(stats.completed)}
          hint={t.library.completionRate(stats.completionRate)}
        />
        <Stat tone="bg-favorite" label={t.library.statFavourites} value={t.app.number(stats.favorites)} />
        <Stat
          tone="bg-score"
          label={t.library.statAverage}
          value={stats.averageScore === null ? t.library.noScoreYet : t.library.averageScore(stats.averageScore)}
        />
      </dl>
      {/* Completion at a glance; the same figure is in the text above, so the bar is decorative. */}
      <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-completed transition-[width] duration-500" style={{ width: `${stats.completionRate}%` }} />
      </div>
    </section>
  )
}
