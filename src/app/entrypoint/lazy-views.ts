import { lazy } from 'react'

// Split from the first-load bundle: Discover is the first screen, and the details dialog only opens on a click.
const loadLibraryPage = () => import('@/pages/library/ui/library-page')
const loadGameDetailsDialog = () => import('@/widgets/game-details/ui/game-details-dialog')

export const LibraryPage = lazy(() => loadLibraryPage().then((module) => ({ default: module.LibraryPage })))
export const GameDetailsDialog = lazy(() => loadGameDetailsDialog().then((module) => ({ default: module.GameDetailsDialog })))

/** Fetches the split chunks ahead of time (the browser caches the modules), so opening a view rarely waits. */
export function prefetchLazyViews() {
  void loadLibraryPage()
  void loadGameDetailsDialog()
}
