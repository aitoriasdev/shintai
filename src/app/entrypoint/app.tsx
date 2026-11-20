import type { GameSummary } from '@contracts/game'
import { useCallback, useState } from 'react'
import { SearchField } from '@/features/search-games/ui/search-field'
import { DiscoverPage } from '@/pages/discover/ui/discover-page'
import { AppHeader } from '@/widgets/app-header/ui/app-header'
import { GameDetailsDialog } from '@/widgets/game-details/ui/game-details-dialog'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import { ErrorToast } from '@/shared/ui/error-toast'
import { LiveAnnouncer } from '@/shared/ui/live-announcer'
import { SkipLink } from '@/shared/ui/skip-link'

const MAIN_ID = 'main'

export function App() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<GameSummary | null>(null)
  const query = useDebouncedValue(search, 350)
  const closeDetails = useCallback(() => setSelected(null), [])

  return (
    <>
      <SkipLink targetId={MAIN_ID} />
      <AppHeader search={<SearchField value={search} onChange={setSearch} label="Search all games" />} />
      <main id={MAIN_ID} tabIndex={-1} className="mx-auto max-w-7xl px-4 py-6 focus:outline-none sm:px-6 sm:py-8">
        <DiscoverPage query={query} onOpen={setSelected} />
      </main>
      <GameDetailsDialog game={selected} onClose={closeDetails} />
      <LiveAnnouncer />
      <ErrorToast />
    </>
  )
}
