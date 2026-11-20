import type { GameSummary } from '@contracts/game'
import { Library, SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLibraryEntries } from '@/entities/library/api/library-queries'
import { DEFAULT_FILTERS, filterLibrary } from '../model/filter-library'
import { LibraryToolbar } from './library-toolbar'
import { BackupActions } from './backup-actions'
import { GameGrid } from '@/widgets/game-grid/ui/game-grid'
import { GameGridSkeleton } from '@/widgets/game-grid/ui/game-grid-skeleton'
import { LibraryStats } from './library-stats'
import { EmptyState } from '@/shared/ui/empty-state'

interface LibraryPageProps {
  /** Search text from the header, applied locally. */
  query: string
  onOpen: (game: GameSummary) => void
  onBrowse: () => void
}

export function LibraryPage({ query, onOpen, onBrowse }: LibraryPageProps) {
  const library = useLibraryEntries()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const entries = useMemo(() => library.data ?? [], [library.data])
  const visible = useMemo(() => filterLibrary(entries, { ...filters, text: query }), [entries, filters, query])
  const games = useMemo(() => visible.map((entry) => entry.game), [visible])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">My library</h1>
          <p className="text-sm text-muted">Every game you have played, rated and loved. Stored locally in SQLite.</p>
        </div>
        <BackupActions />
      </div>

      {library.isPending ? (
        <GameGridSkeleton count={6} />
      ) : library.isError ? (
        <EmptyState icon={<Library className="size-6" />} title="Could not load your library">
          Is the Shintai API running? ({library.error.message})
        </EmptyState>
      ) : entries.length === 0 ? (
        <EmptyState icon={<Library className="size-6" />} title="Your library is empty">
          <p>Favorite, complete or rate any game and it lands here.</p>
          <button type="button" className="mt-3 font-medium text-accent hover:underline" onClick={onBrowse}>
            Discover games
          </button>
        </EmptyState>
      ) : (
        <>
          <LibraryStats entries={entries} />
          <LibraryToolbar filters={filters} onChange={setFilters} />
          {games.length === 0 ? (
            <EmptyState icon={<SearchX className="size-6" />} title="No games match these filters" />
          ) : (
            <GameGrid label="Library" games={games} onOpen={onOpen} />
          )}
        </>
      )}
    </div>
  )
}
