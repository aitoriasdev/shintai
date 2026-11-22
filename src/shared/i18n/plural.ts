type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string }

const rules = new Map<string, Intl.PluralRules>()

/** Picks the CLDR plural form of `count` for `locale` ("1 game", "2 games"), falling back to `other`. */
export function plural(locale: string, count: number, forms: PluralForms): string {
  let rule = rules.get(locale)
  if (!rule) {
    rule = new Intl.PluralRules(locale)
    rules.set(locale, rule)
  }
  return forms[rule.select(count)] ?? forms.other
}
