import { Check, Monitor, Moon, Settings2, Sun } from 'lucide-react'
import { useId, useState, useSyncExternalStore } from 'react'
import { isLocale, LOCALE_NAMES, LOCALES } from '@/shared/i18n/locales'
import { useI18n } from '@/shared/i18n/use-i18n'
import { cn } from '@/shared/lib/cn'
import { getThemePreference, setThemePreference, subscribeToTheme, type ThemePreference } from '../model/theme-store'

const THEME_ICONS = { system: Monitor, light: Sun, dark: Moon } as const

/** Theme as three equal tiles built on native radios (Tab enters the group, arrow keys move the choice). */
function ThemePicker() {
  const { t } = useI18n()
  const theme = useSyncExternalStore(subscribeToTheme, getThemePreference)
  const name = useId()
  const labels: Record<ThemePreference, string> = {
    system: t.preferences.themeSystem,
    light: t.preferences.themeLight,
    dark: t.preferences.themeDark,
  }

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-text">{t.preferences.theme}</legend>
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(THEME_ICONS) as ThemePreference[]).map((value) => {
          const Icon = THEME_ICONS[value]
          return (
            <label
              key={value}
              className={cn(
                'relative flex min-h-18 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-control px-1 py-2.5 text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-text',
                // Selected: accent ring + tint + check mark, so the state is not carried by hue alone (1.4.1).
                'has-checked:border-accent has-checked:bg-accent/15 has-checked:text-text has-checked:ring-1 has-checked:ring-accent',
                'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent',
              )}
            >
              <input
                type="radio"
                name={name}
                value={value}
                checked={theme === value}
                onChange={() => setThemePreference(value)}
                className="peer absolute inset-0 cursor-pointer appearance-none rounded-xl focus:outline-none"
              />
              <Icon className="size-5" aria-hidden="true" />
              {labels[value]}
              <Check className="absolute top-1.5 right-1.5 hidden size-3.5 text-accent peer-checked:block" aria-hidden="true" />
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/**
 * Theme and language, in a native popover: the browser handles Escape, light dismiss and the focus
 * order (the panel follows its button). `aria-expanded` is also set explicitly, because not every
 * screen reader derives it from `popovertarget`.
 */
export function PreferencesMenu() {
  const { t, locale, setLocale } = useI18n()
  const panelId = useId()
  const languageId = useId()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        popoverTarget={panelId}
        aria-expanded={open}
        aria-label={t.preferences.button}
        title={t.preferences.button}
        className={cn(
          'grid size-11 shrink-0 place-items-center rounded-full border border-control text-muted transition-colors [anchor-name:--preferences] hover:bg-surface-2 hover:text-text',
          open && 'bg-surface-2 text-text',
        )}
      >
        <Settings2 className="size-5" aria-hidden="true" />
      </button>
      <div
        id={panelId}
        popover="auto"
        role="group"
        aria-label={t.preferences.button}
        onToggle={(event) => setOpen(event.newState === 'open')}
        className="preferences-popover w-76 max-w-[calc(100vw-2rem)] space-y-5 rounded-2xl border border-control bg-surface p-4 text-text shadow-2xl"
      >
        <ThemePicker />
        <div className="border-t border-border pt-4">
          <label htmlFor={languageId} className="mb-2 block text-sm font-semibold text-text">
            {t.preferences.language}
          </label>
          <select
            id={languageId}
            value={locale}
            onChange={(event) => {
              if (isLocale(event.target.value)) setLocale(event.target.value)
            }}
            className="h-11 w-full rounded-xl border border-control bg-surface px-3 text-sm text-text hover:bg-surface-2"
          >
            {LOCALES.map((option) => (
              <option key={option} value={option} lang={option}>
                {LOCALE_NAMES[option]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  )
}
