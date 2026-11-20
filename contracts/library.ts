import { z } from 'zod'
import { gameSummarySchema } from './game'

export const scoreSchema = z.number().int().min(1).max(10)

export const libraryEntrySchema = z.object({
  game: gameSummarySchema,
  /** Personal score from 1 to 10, or null when not rated yet. */
  score: scoreSchema.nullable(),
  completed: z.boolean(),
  favorite: z.boolean(),
  /** Unix epoch milliseconds. */
  addedAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
})

export type LibraryEntry = z.infer<typeof libraryEntrySchema>

export const entryPatchSchema = z
  .object({
    score: scoreSchema.nullable(),
    completed: z.boolean(),
    favorite: z.boolean(),
  })
  .partial()

export type EntryPatch = z.infer<typeof entryPatchSchema>

/** Body of `PUT /api/library/:gameId`: creates the entry if needed, then applies the patch. */
export const upsertEntrySchema = z.object({
  game: gameSummarySchema,
  patch: entryPatchSchema.default({}),
})

export type UpsertEntryBody = z.infer<typeof upsertEntrySchema>

export const LIBRARY_BACKUP_VERSION = 1

export const libraryBackupSchema = z.object({
  app: z.literal('shintai'),
  version: z.literal(LIBRARY_BACKUP_VERSION),
  exportedAt: z.number().int(),
  entries: z.array(libraryEntrySchema).max(100_000),
})

export type LibraryBackup = z.infer<typeof libraryBackupSchema>

export interface ImportResult {
  added: number
  updated: number
  skipped: number
}
