import type { InjectionToken } from 'tsyringe'
import type { DatabaseSync } from 'node:sqlite'
import type { AppConfig } from './config'

export interface Clock {
  now(): number
}

export type FetchFn = typeof fetch

/** Injection tokens for values that are not classes. */
export const TOKENS = {
  Config: Symbol('Config') as InjectionToken<AppConfig>,
  Database: Symbol('Database') as InjectionToken<DatabaseSync>,
  Clock: Symbol('Clock') as InjectionToken<Clock>,
  Fetch: Symbol('Fetch') as InjectionToken<FetchFn>,
} as const
