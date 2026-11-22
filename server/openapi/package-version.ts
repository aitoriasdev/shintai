import { readFileSync } from 'node:fs'

/** The app version from package.json, shown in the OpenAPI document. */
export function packageVersion(): string {
  const { version } = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { version: string }
  return version
}
