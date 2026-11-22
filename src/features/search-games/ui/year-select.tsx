import { useId } from 'react'
import { useI18n } from '@/shared/i18n/use-i18n'

const FIRST_YEAR = 1970
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - FIRST_YEAR + 1 }, (_, i) => CURRENT_YEAR - i)

interface YearSelectProps {
  value: number | null
  onChange: (year: number | null) => void
}

export function YearSelect({ value, onChange }: YearSelectProps) {
  const id = useId()
  const { t } = useI18n()
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-sm text-muted">
        {t.discover.releaseYear}
      </label>
      <select
        id={id}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}
        className="h-9 rounded-full border border-control bg-surface px-3 text-sm text-text pointer-coarse:h-11"
      >
        <option value="">{t.discover.anyYear}</option>
        {YEARS.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  )
}
