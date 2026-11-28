import type { LibraryEntry } from '@contracts/library'
import { useI18n } from '@/shared/i18n/use-i18n'
import { computeStats } from '../model/compute-stats'
import { LibraryStat } from './library-stat'

export function LibraryStats({ entries }: { entries: LibraryEntry[] }) {
  const { t } = useI18n()
  const stats = computeStats(entries)

  return (
    <section aria-labelledby="library-stats-title" className="space-y-4">
      <h2 id="library-stats-title" className="sr-only">
        {t.library.stats}
      </h2>
      <dl className="flex flex-wrap gap-x-10 gap-y-4">
        <LibraryStat tone="bg-primary" label={t.library.statGames} value={t.app.number(stats.total)} />
        <LibraryStat
          tone="bg-completed"
          label={t.library.statCompleted}
          value={t.app.number(stats.completed)}
          hint={t.library.completionRate(stats.completionRate)}
        />
        <LibraryStat tone="bg-favorite" label={t.library.statFavourites} value={t.app.number(stats.favorites)} />
        <LibraryStat
          tone="bg-score"
          label={t.library.statAverage}
          value={stats.averageScore === null ? t.library.noScoreYet : t.library.averageScore(stats.averageScore)}
        />
      </dl>
      {/* Completion at a glance; the same figure is in the text above, so the bar is decorative. */}
      <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-completed transition-[width] duration-500" style={{ width: `${stats.completionRate}%` }} />
      </div>
    </section>
  )
}
