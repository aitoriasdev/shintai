import { LoaderCircle } from 'lucide-react'
import { useI18n } from '@/shared/i18n/use-i18n'

export function Spinner({ label }: { label?: string }) {
  const { t } = useI18n()
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-8 text-sm text-muted">
      <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
      <span>{label ?? t.app.loading}…</span>
    </div>
  )
}
