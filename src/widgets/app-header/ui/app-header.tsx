import { Compass, Library } from 'lucide-react'
import type { ReactNode } from 'react'
import { useI18n } from '@/shared/i18n/use-i18n'
import { Badge } from '@/shared/ui/badge'
import { cn } from 'cn'
import type { AppView } from '../model/app-view'
import { PreferencesMenu } from './preferences-menu'

interface AppHeaderProps {
  view: AppView
  onViewChange: (view: AppView) => void
  libraryCount: number | undefined
  /** Search control for the current view. */
  search: ReactNode
}

const TABS = [
  { view: 'discover', icon: Compass },
  { view: 'library', icon: Library },
] as const

export function AppHeader({ view, onViewChange, libraryCount, search }: AppHeaderProps) {
  const { t } = useI18n()

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <a href="#discover" className="flex items-center gap-2" onClick={() => onViewChange('discover')}>
          <img src="/favicon.svg" alt="" className="size-8" aria-hidden="true" />
          <span className="text-lg font-bold tracking-tight text-foreground">Shintai</span>
        </a>

        <nav aria-label={t.header.nav} className="order-3 flex w-full gap-1 sm:order-none sm:w-auto">
          {TABS.map(({ view: tab, icon: Icon }) => (
            <a
              key={tab}
              href={`#${tab}`}
              aria-current={view === tab ? 'page' : undefined}
              onClick={() => onViewChange(tab)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors sm:flex-none pointer-coarse:py-3',
                view === tab ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {tab === 'discover' ? t.header.discover : t.header.library}
              {tab === 'library' && libraryCount !== undefined && (
                <>
                  <Badge aria-hidden="true" className="px-1.5 py-0 font-semibold tabular-nums">
                    {t.app.number(libraryCount)}
                  </Badge>
                  <span className="sr-only"> {t.header.libraryCount(libraryCount)}</span>
                </>
              )}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex min-w-0 flex-1 items-center gap-2 sm:max-w-md">
          <div className="min-w-0 flex-1">{search}</div>
          <PreferencesMenu />
        </div>
      </div>
    </header>
  )
}
