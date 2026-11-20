const FIRST_YEAR = 1970
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - FIRST_YEAR + 1 }, (_, i) => CURRENT_YEAR - i)

interface YearSelectProps {
  value: number | null
  onChange: (year: number | null) => void
}

export function YearSelect({ value, onChange }: YearSelectProps) {
  return (
    <select
      aria-label="Release year"
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}
      className="h-9 rounded-full border border-border bg-surface px-3 text-sm text-text focus:border-accent focus:outline-none"
    >
      <option value="">Any year</option>
      {YEARS.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  )
}
