import type { GameSummary } from '@contracts/game'
import { Suspense, useCallback, useRef, useState } from 'react'
import { useLibraryEntries } from '@/entities/library/api/library-queries'
import { SearchField } from '@/features/search-games/ui/search-field'
import { DiscoverPage } from '@/pages/discover/ui/discover-page'
import { useI18n } from '@/shared/i18n/use-i18n'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import { useFocusHeadingOnChange } from '@/shared/lib/use-focus-heading-on-change'
import { useHasBeenTruthy } from '@/shared/lib/use-has-been-truthy'
import { useWhenIdle } from '@/shared/lib/use-when-idle'
import { ErrorToast } from '@/shared/ui/error-toast'
import { LiveAnnouncer } from '@/shared/ui/live-announcer'
import { SkipLink } from '@/shared/ui/skip-link'
import { Spinner } from '@/shared/ui/spinner'
import { AppHeader } from '@/widgets/app-header/ui/app-header'
import { useHashView } from '../routing/use-hash-view'
import { GameDetailsDialog, LibraryPage, prefetchLazyViews } from './lazy-views'

const MAIN_ID = 'main'

export function App() {
  const { t } = useI18n()
  const [view, setView] = useHashView()
  const [search, setSearch] = useState({ discover: '', library: '' })
  const [selected, setSelected] = useState<GameSummary | null>(null)
  const discoverQuery = useDebouncedValue(search.discover, 350)
  const libraryCount = useLibraryEntries().data?.length
  const mainRef = useRef<HTMLElement>(null)
  useFocusHeadingOnChange(view, mainRef)
  // The dialog chunk loads on the first open; after that the dialog stays mounted so it can animate out.
  const dialogUsed = useHasBeenTruthy(selected)
  useWhenIdle(prefetchLazyViews)

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
          <Suspense fallback={<Spinner label={t.library.loading} />}>
            <LibraryPage query={search.library} onOpen={setSelected} onBrowse={browse} />
          </Suspense>
        )}
      </main>
      {dialogUsed && (
        <Suspense fallback={null}>
          <GameDetailsDialog game={selected} onClose={closeDetails} />
        </Suspense>
      )}
      <LiveAnnouncer />
      <ErrorToast />
    </>
  )
}
