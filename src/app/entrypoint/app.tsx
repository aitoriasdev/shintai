import type { GameSummary } from '@contracts/game'
import { useCallback, useState } from 'react'
import { useLibraryEntries } from '@/entities/library/api/library-queries'
import { SearchField } from '@/features/search-games/ui/search-field'
import { DiscoverPage } from '@/pages/discover/ui/discover-page'
import { LibraryPage } from '@/pages/library/ui/library-page'
import { AppHeader } from '@/widgets/app-header/ui/app-header'
import { GameDetailsDialog } from '@/widgets/game-details/ui/game-details-dialog'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import { useHashView } from '../routing/use-hash-view'

export function App() {
  const [view, setView] = useHashView()
  const [search, setSearch] = useState({ discover: '', library: '' })
  const [selected, setSelected] = useState<GameSummary | null>(null)
  const discoverQuery = useDebouncedValue(search.discover, 350)
  const libraryCount = useLibraryEntries().data?.length

  const closeDetails = useCallback(() => setSelected(null), [])
  const browse = useCallback(() => setView('discover'), [setView])

  return (
    <>
      <AppHeader
        view={view}
        onViewChange={setView}
        libraryCount={libraryCount}
        search={
          <SearchField
            key={view}
            value={search[view]}
            onChange={(value) => setSearch((current) => ({ ...current, [view]: value }))}
            placeholder={view === 'discover' ? 'Search all games' : 'Search your library'}
          />
        }
      />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {view === 'discover' ? (
          <DiscoverPage query={discoverQuery} onOpen={setSelected} />
        ) : (
          <LibraryPage query={search.library} onOpen={setSelected} onBrowse={browse} />
        )}
      </main>
      <GameDetailsDialog game={selected} onClose={closeDetails} />
    </>
  )
}
