import type { GameSummary } from '@contracts/game'
import { GameCard } from '@/entities/game/ui/game-card'
import { useLibraryEntry } from '@/entities/library/api/library-queries'
import { EntryBadges } from '@/entities/library/ui/entry-badges'
import { CompletedButton } from '@/features/toggle-completed/ui/completed-button'
import { FavoriteButton } from '@/features/toggle-favorite/ui/favorite-button'

interface GameGridItemProps {
  game: GameSummary
  onOpen: (game: GameSummary) => void
  priority: boolean
}

/** A game card with its library badges and the favourite and completed toggles. */
export function GameGridItem({ game, onOpen, priority }: GameGridItemProps) {
  const entry = useLibraryEntry(game.id)
  return (
    <GameCard
      game={game}
      onOpen={onOpen}
      priority={priority}
      badges={<EntryBadges entry={entry} />}
      actions={
        <>
          <FavoriteButton game={game} />
          <CompletedButton game={game} />
        </>
      }
    />
  )
}
