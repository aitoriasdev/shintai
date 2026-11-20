import { m } from 'motion/react'
import { memo, type ReactNode } from 'react'
import type { GameSummary } from '@contracts/game'
import { GameCover } from './game-cover'

interface GameCardProps {
  game: GameSummary
  onOpen: (game: GameSummary) => void
  /** Status badges rendered over the cover (top-left). */
  badges?: ReactNode
  /** Quick actions rendered over the cover (top-right). */
  actions?: ReactNode
}

export const GameCard = memo(function GameCard({ game, onOpen, badges, actions }: GameCardProps) {
  return (
    <m.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface shadow-lg shadow-black/20 transition-[border-color,transform] duration-200 hover:-translate-y-1 hover:border-accent/50"
    >
      <button
        type="button"
        onClick={() => onOpen(game)}
        className="block w-full text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
      >
        <GameCover title={game.title} src={game.coverUrl} className="transition-transform duration-300 group-hover:scale-[1.03]" />
        <div className="space-y-1 p-3">
          <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-text">{game.title}</h3>
          <p className="line-clamp-1 text-xs text-muted">{game.description ?? (game.year ? String(game.year) : 'Video game')}</p>
        </div>
      </button>
      {badges && <div className="pointer-events-none absolute top-2 left-2 flex flex-col items-start gap-1">{badges}</div>}
      {actions && <div className="absolute top-2 right-2 flex flex-col gap-1.5">{actions}</div>}
    </m.article>
  )
})
