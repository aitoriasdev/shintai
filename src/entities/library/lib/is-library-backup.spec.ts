import { expect, it } from 'vitest'
import { makeEntry } from '@/shared/lib/testing/fixtures'
import { isLibraryBackup } from './is-library-backup'

const backup = (entries: unknown[]) => ({ app: 'shintai', version: 1, exportedAt: 1, entries })

it('accepts a backup of valid entries', () => {
  expect(isLibraryBackup(backup([makeEntry(), makeEntry({ score: null })]))).toBe(true)
  expect(isLibraryBackup(backup([]))).toBe(true)
})

it.each([
  ['another app', { ...backup([]), app: 'other' }],
  ['another version', { ...backup([]), version: 2 }],
  ['entries that are not a list', { ...backup([]), entries: {} }],
  ['a score out of range', backup([makeEntry({ score: 11 })])],
  ['a fractional score', backup([makeEntry({ score: 7.5 })])],
  ['a flag that is not a boolean', backup([{ ...makeEntry(), favorite: 'yes' }])],
  ['a negative date', backup([makeEntry({ addedAt: -1 })])],
  ['a malformed game id', backup([makeEntry({ game: { ...makeEntry().game, id: '../etc' } })])],
  ['a cover that is not a URL', backup([makeEntry({ game: { ...makeEntry().game, coverUrl: 'cover.png' } })])],
  ['a missing title', backup([makeEntry({ game: { ...makeEntry().game, title: '' } })])],
])('refuses %s', (_, value) => {
  expect(isLibraryBackup(value)).toBe(false)
})
