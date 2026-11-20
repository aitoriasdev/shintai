import { Compass, Library } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export type AppView = 'discover' | 'library'

interface AppHeaderProps {
  view: AppView
  onViewChange: (view: AppView) => void
  libraryCount: number | undefined
  /** Search control for the current view. */
  search: ReactNode
}

const TABS = [
  { view: 'discover', label: 'Discover', icon: Compass },
  { view: 'library', label: 'My library', icon: Library },
] as const

export function AppHeader({ view, onViewChange, libraryCount, search }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <a href="#discover" className="flex items-center gap-2" onClick={() => onViewChange('discover')}>
          <img src="/favicon.svg" alt="" className="size-8" aria-hidden="true" />
          <span className="text-lg font-bold tracking-tight text-text">Shintai</span>
        </a>

        <nav aria-label="Main" className="order-3 flex w-full gap-1 sm:order-none sm:w-auto">
          {TABS.map(({ view: tab, label, icon: Icon }) => (
            <a
              key={tab}
              href={`#${tab}`}
              aria-current={view === tab ? 'page' : undefined}
              onClick={() => onViewChange(tab)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors sm:flex-none pointer-coarse:py-3',
                view === tab ? 'bg-surface-2 text-text' : 'text-muted hover:text-text',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
              {tab === 'library' && libraryCount !== undefined && (
                <>
                  <span aria-hidden="true" className="rounded-full bg-accent px-1.5 text-xs font-semibold text-on-accent tabular-nums">
                    {libraryCount}
                  </span>
                  <span className="sr-only">{` (${libraryCount} ${libraryCount === 1 ? 'game' : 'games'})`}</span>
                </>
              )}
            </a>
          ))}
        </nav>

        <div className="ml-auto w-full max-w-md flex-1 sm:w-auto">{search}</div>
      </div>
    </header>
  )
}
