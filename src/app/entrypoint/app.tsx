import type { GameSummary } from '@contracts/game'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLibraryEntries } from '@/entities/library/api/library-queries'
import { SearchField } from '@/features/search-games/ui/search-field'
import { DiscoverPage } from '@/pages/discover/ui/discover-page'
import { LibraryPage } from '@/pages/library/ui/library-page'
import { useI18n } from '@/shared/i18n/use-i18n'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import { ErrorToast } from '@/shared/ui/error-toast'
import { LiveAnnouncer } from '@/shared/ui/live-announcer'
import { SkipLink } from '@/shared/ui/skip-link'
import { AppHeader } from '@/widgets/app-header/ui/app-header'
import { GameDetailsDialog } from '@/widgets/game-details/ui/game-details-dialog'
import { useHashView } from '../routing/use-hash-view'

const MAIN_ID = 'main'

export function App() {
  const { t } = useI18n()
  const [view, setView] = useHashView()
  const [search, setSearch] = useState({ discover: '', library: '' })
  const [selected, setSelected] = useState<GameSummary | null>(null)
  const discoverQuery = useDebouncedValue(search.discover, 350)
  const libraryCount = useLibraryEntries().data?.length
  const mainRef = useRef<HTMLElement>(null)
  const previousView = useRef(view)

  // 2.4.3: after switching views, move focus to the new page heading (not on first load).
  useEffect(() => {
    if (previousView.current === view) return
    previousView.current = view
    mainRef.current?.querySelector<HTMLElement>('h1')?.focus()
  }, [view])

  const closeDetails = useCallback(() => setSelected(null), [])
  const browse = useCallback(() => setView('discover'), [setView])

  return (
    <>
      <SkipLink targetId={MAIN_ID} />
      <AppHeader
        view={view}
        onViewChange={setView}
        libraryCount={libraryCount}
        search={
          <SearchField
            key={view}
            value={search[view]}
            onChange={(value) => setSearch((current) => ({ ...current, [view]: value }))}
            label={view === 'discover' ? t.header.searchAll : t.header.searchLibrary}
          />
        }
      />
      <main id={MAIN_ID} ref={mainRef} tabIndex={-1} className="mx-auto max-w-7xl px-4 py-6 focus:outline-none sm:px-6 sm:py-8">
        {view === 'discover' ? (
          <DiscoverPage query={discoverQuery} onOpen={setSelected} />
        ) : (
          <LibraryPage query={search.library} onOpen={setSelected} onBrowse={browse} />
        )}
      </main>
      <GameDetailsDialog game={selected} onClose={closeDetails} />
      <LiveAnnouncer />
      <ErrorToast />
    </>
  )
}
