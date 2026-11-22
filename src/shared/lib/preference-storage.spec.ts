import { afterEach, expect, it, vi } from 'vitest'
import { readPreference, writePreference } from './preference-storage'

afterEach(() => vi.restoreAllMocks())

it('reads and writes a preference', () => {
  writePreference('shintai.test', 'value')
  expect(readPreference('shintai.test')).toBe('value')
})

it('falls back to the default, and says so, when storage is blocked', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new DOMException('Blocked', 'SecurityError')
  })
  expect(readPreference('shintai.test')).toBeNull()
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('"shintai.test"'), expect.any(DOMException))
})

it('logs a failed write instead of throwing', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Full', 'QuotaExceededError')
  })
  expect(() => writePreference('shintai.test', 'value')).not.toThrow()
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('"shintai.test"'), expect.any(DOMException))
})
