import type { ReactNode } from 'react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/ui/empty'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  children?: ReactNode
}

export function EmptyState({ icon, title, children }: EmptyStateProps) {
  return (
    <Empty className="mx-auto max-w-md py-24">
      <EmptyHeader>
        <EmptyMedia variant="icon" aria-hidden="true" className="size-14 rounded-2xl border border-border bg-card text-muted-foreground">
          {icon}
        </EmptyMedia>
        <EmptyTitle className="font-semibold text-foreground">{title}</EmptyTitle>
        {children && <EmptyDescription>{children}</EmptyDescription>}
      </EmptyHeader>
    </Empty>
  )
}
