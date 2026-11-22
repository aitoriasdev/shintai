import type { GameSummary } from '@contracts/game'
import { Library, SearchX } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLibraryEntries } from '@/entities/library/api/library-queries'
import { describeError } from '@/shared/i18n/describe-error'
import { useI18n } from '@/shared/i18n/use-i18n'
import { announce } from '@/shared/lib/announce'
import { useDocumentTitle } from '@/shared/lib/use-document-title'
import { EmptyState } from '@/shared/ui/empty-state'
import { GameGrid } from '@/widgets/game-grid/ui/game-grid'
import { GameGridSkeleton } from '@/widgets/game-grid/ui/game-grid-skeleton'
import { DEFAULT_FILTERS, filterLibrary } from '../model/filter-library'
import { BackupActions } from './backup-actions'
import { LibraryStats } from './library-stats'
import { LibraryToolbar } from './library-toolbar'

interface LibraryPageProps {
  /** Search text from the header, applied locally. */
  query: string
  onOpen: (game: GameSummary) => void
  onBrowse: () => void
}

export function LibraryPage({ query, onOpen, onBrowse }: LibraryPageProps) {
  const { t } = useI18n()
  const library = useLibraryEntries()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const entries = useMemo(() => library.data ?? [], [library.data])
  const visible = useMemo(() => filterLibrary(entries, { ...filters, text: query }), [entries, filters, query])
  const games = useMemo(() => visible.map((entry) => entry.game), [visible])
  useDocumentTitle(t.library.title)

  // 4.1.3: announce how many games match after filtering or searching (not on first load).
  const filtered = query.trim() !== '' || filters.status !== 'all'
  useEffect(() => {
    if (library.isSuccess && filtered) announce(t.library.shownCount(visible.length, entries.length))
  }, [library.isSuccess, filtered, visible.length, entries.length, t])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 tabIndex={-1} className="text-3xl font-bold tracking-tight text-text focus:outline-none sm:text-4xl">
            {t.library.title}
          </h1>
          <p className="mt-1 max-w-prose text-sm text-muted">{t.library.intro}</p>
        </div>
        <BackupActions />
      </div>

      {library.isPending ? (
        <GameGridSkeleton count={6} label={t.library.loading} />
      ) : library.isError ? (
        <EmptyState icon={<Library className="size-6" />} title={t.library.loadError}>
          <p role="alert">{describeError(library.error, t)}</p>
        </EmptyState>
      ) : entries.length === 0 ? (
        <EmptyState icon={<Library className="size-6" />} title={t.library.emptyTitle}>
          <p>{t.library.emptyHint}</p>
          <button type="button" className="mt-3 min-h-11 font-medium text-accent hover:underline" onClick={onBrowse}>
            {t.library.discoverGames}
          </button>
        </EmptyState>
      ) : (
        <>
          <LibraryStats entries={entries} />
          <LibraryToolbar filters={filters} onChange={setFilters} />
          {games.length === 0 ? (
            <EmptyState icon={<SearchX className="size-6" />} title={t.library.noMatches} />
          ) : (
            <GameGrid label={t.library.grid} games={games} onOpen={onOpen} />
          )}
        </>
      )}
    </div>
  )
}
