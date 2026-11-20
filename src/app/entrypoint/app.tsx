import { ErrorToast } from '@/shared/ui/error-toast'
import { LiveAnnouncer } from '@/shared/ui/live-announcer'
import { SkipLink } from '@/shared/ui/skip-link'

const MAIN_ID = 'main'

export function App() {
  return (
    <>
      <SkipLink targetId={MAIN_ID} />
      <main id={MAIN_ID} tabIndex={-1} className="mx-auto max-w-7xl px-4 py-6 focus:outline-none sm:px-6 sm:py-8">
        <h1 className="text-2xl font-bold text-text">Shintai</h1>
        <p className="text-sm text-muted">Your videogame life, stored locally.</p>
      </main>
      <LiveAnnouncer />
      <ErrorToast />
    </>
  )
}
