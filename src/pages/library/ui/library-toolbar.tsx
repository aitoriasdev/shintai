import { useI18n } from '@/shared/i18n/use-i18n'
import { SegmentedControl } from '@/shared/ui/segmented-control'
import type { LibraryFilters, SortKey, StatusFilter } from '../model/filter-library'

const SORT_KEYS = ['recent', 'title', 'score', 'year'] as const satisfies ReadonlyArray<SortKey>

interface LibraryToolbarProps {
  filters: LibraryFilters
  onChange: (filters: LibraryFilters) => void
}

export function LibraryToolbar({ filters, onChange }: LibraryToolbarProps) {
  const { t } = useI18n()
  const statusOptions = [
    { value: 'all', label: t.library.filterAll },
    { value: 'favorites', label: t.library.filterFavourites },
    { value: 'completed', label: t.library.filterCompleted },
    { value: 'pending', label: t.library.filterPending },
  ] as const satisfies ReadonlyArray<{ value: StatusFilter; label: string }>
  const sortLabels: Record<SortKey, string> = {
    recent: t.library.sortRecent,
    title: t.library.sortTitle,
    score: t.library.sortScore,
    year: t.library.sortYear,
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <SegmentedControl
        label={t.library.show}
        options={statusOptions}
        value={filters.status}
        onChange={(status) => onChange({ ...filters, status })}
      />
      <label className="flex items-center gap-2 text-sm text-muted">
        {t.library.sortBy}
        <select
          value={filters.sort}
          onChange={(event) => onChange({ ...filters, sort: event.target.value as SortKey })}
          className="h-9 rounded-full border border-control bg-surface px-3 text-sm text-text pointer-coarse:h-11"
        >
          {SORT_KEYS.map((key) => (
            <option key={key} value={key}>
              {sortLabels[key]}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
