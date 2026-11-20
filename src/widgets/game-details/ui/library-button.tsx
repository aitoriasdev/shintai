import type { GameSummary } from '@contracts/game'
import { BookmarkCheck, BookmarkPlus } from 'lucide-react'
import { useLibraryEntry, useRemoveEntry, useUpsertEntry } from '@/entities/library/api/library-queries'
import { IconButton } from '@/shared/ui/icon-button'

/** Adds a game to the library, or removes it (with its score and flags) after confirmation. */
export function LibraryButton({ game }: { game: GameSummary }) {
  const inLibrary = useLibraryEntry(game.id) !== undefined
  const upsert = useUpsertEntry()
  const remove = useRemoveEntry()

  const onClick = () => {
    if (!inLibrary) return upsert.mutate({ game, patch: {} })
    if (window.confirm(`Remove "${game.title}" from your library? Its score and status will be lost.`)) {
      remove.mutate(game.id)
    }
  }

  return (
    <IconButton
      label={inLibrary ? 'In library' : 'Add to library'}
      tone="accent"
      showLabel
      pressed={inLibrary}
      onClick={onClick}
      icon={inLibrary ? <BookmarkCheck className="size-4" aria-hidden="true" /> : <BookmarkPlus className="size-4" aria-hidden="true" />}
    />
  )
}
