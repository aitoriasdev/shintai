import { describe, expect, it } from 'vitest'
import { libraryBackupSchema, upsertEntrySchema } from './library'

const game = {
  id: 'Q1',
  pageId: 1,
  title: 'Celeste',
  wikiTitle: 'Celeste (video game)',
  description: null,
  coverUrl: null,
  year: 2018,
}

describe('upsertEntrySchema', () => {
  it('defaults the patch to an empty object', () => {
    expect(upsertEntrySchema.parse({ game })).toEqual({ game, patch: {} })
  })

  it.each([0, 11, 7.5])('rejects score %s', (score) => {
    expect(upsertEntrySchema.safeParse({ game, patch: { score } }).success).toBe(false)
  })

  it('rejects malformed game ids', () => {
    expect(upsertEntrySchema.safeParse({ game: { ...game, id: 'DROP TABLE' } }).success).toBe(false)
  })
})

describe('libraryBackupSchema', () => {
  it('only accepts shintai backups', () => {
    expect(libraryBackupSchema.safeParse({ app: 'other', version: 1, exportedAt: 0, entries: [] }).success).toBe(false)
    expect(libraryBackupSchema.safeParse({ app: 'shintai', version: 1, exportedAt: 0, entries: [] }).success).toBe(true)
  })
})
