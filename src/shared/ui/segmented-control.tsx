import { useId } from 'react'

interface Option<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  /** Group label, announced by screen readers. */
  label: string
  options: ReadonlyArray<Option<T>>
  value: T
  onChange: (value: T) => void
}

/** Single-choice pill group built on native radios: Tab enters the group, arrow keys move the selection. */
export function SegmentedControl<T extends string>({ label, options, value, onChange }: SegmentedControlProps<T>) {
  const name = useId()

  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <div className="inline-flex flex-wrap rounded-full border border-control bg-surface p-1">
        {options.map((option) => (
          <label
            key={option.value}
            className="relative cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-text has-checked:bg-accent has-checked:text-on-accent has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent pointer-coarse:py-2.5"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
              className="absolute inset-0 cursor-pointer appearance-none rounded-full focus:outline-none"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
