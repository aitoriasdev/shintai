import { SegmentedControl } from '@/shared/ui/segmented-control'
import type { LibraryFilters, SortKey, StatusFilter } from '../model/filter-library'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'favorites', label: 'Favorites' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Not completed' },
] as const satisfies ReadonlyArray<{ value: StatusFilter; label: string }>

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently added' },
  { value: 'title', label: 'Title' },
  { value: 'score', label: 'Score' },
  { value: 'year', label: 'Release year' },
] as const satisfies ReadonlyArray<{ value: SortKey; label: string }>

interface LibraryToolbarProps {
  filters: LibraryFilters
  onChange: (filters: LibraryFilters) => void
}

export function LibraryToolbar({ filters, onChange }: LibraryToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <SegmentedControl
        label="Show"
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={(status) => onChange({ ...filters, status })}
      />
      <label className="flex items-center gap-2 text-sm text-muted">
        Sort by
        <select
          value={filters.sort}
          onChange={(event) => onChange({ ...filters, sort: event.target.value as SortKey })}
          className="h-9 rounded-full border border-control bg-surface px-3 text-sm text-text pointer-coarse:h-11"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
