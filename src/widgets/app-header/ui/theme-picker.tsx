import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { useId, useSyncExternalStore } from 'react'
import { useI18n } from '@/shared/i18n/use-i18n'
import { cn } from 'cn'
import { getThemePreference, setThemePreference, subscribeToTheme, type ThemePreference } from '../model/theme-store'

const THEME_ICONS = { system: Monitor, light: Sun, dark: Moon } as const

/** Theme as three equal tiles built on native radios (Tab enters the group, arrow keys move the choice). */
export function ThemePicker() {
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
      <legend className="mb-2 text-sm font-semibold text-foreground">{t.preferences.theme}</legend>
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(THEME_ICONS) as ThemePreference[]).map((value) => {
          const Icon = THEME_ICONS[value]
          return (
            <label
              key={value}
              className={cn(
                'relative flex min-h-18 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-input px-1 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                // Selected: accent ring + tint + check mark, so the state is not carried by hue alone (1.4.1).
                'has-checked:border-primary has-checked:bg-primary/15 has-checked:text-foreground has-checked:ring-1 has-checked:ring-primary',
                'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary',
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
              <Check className="absolute top-1.5 right-1.5 hidden size-3.5 text-primary peer-checked:block" aria-hidden="true" />
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
