import type { GameSummary } from '@contracts/game'
import { X } from 'lucide-react'
import { useId, useState } from 'react'
import { useI18n } from '@/shared/i18n/use-i18n'
import { Dialog } from '@/shared/ui/dialog'
import { GameDetailsBody } from './game-details-body'

interface GameDetailsDialogProps {
  game: GameSummary | null
  onClose: () => void
}

export function GameDetailsDialog({ game, onClose }: GameDetailsDialogProps) {
  const { t } = useI18n()
  const titleId = useId()
  // Keep rendering the last game while the dialog animates out.
  const [shown, setShown] = useState(game)
  if (game && game !== shown) setShown(game)

  return (
    <Dialog open={game !== null} onClose={onClose} labelledBy={titleId}>
      {shown && (
        <>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.app.close}
            className="absolute top-4 right-4 z-10 grid size-11 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-border"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
          <GameDetailsBody key={shown.id} game={shown} titleId={titleId} />
        </>
      )}
    </Dialog>
  )
}
