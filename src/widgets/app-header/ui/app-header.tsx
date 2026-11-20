import type { ReactNode } from 'react'

interface AppHeaderProps {
  /** Search control for the current view. */
  search: ReactNode
}

export function AppHeader({ search }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <a href="/" className="flex items-center gap-2">
          <img src="/favicon.svg" alt="" className="size-8" aria-hidden="true" />
          <span className="text-lg font-bold tracking-tight text-text">Shintai</span>
        </a>

        <div className="ml-auto w-full max-w-md flex-1 sm:w-auto">{search}</div>
      </div>
    </header>
  )
}
