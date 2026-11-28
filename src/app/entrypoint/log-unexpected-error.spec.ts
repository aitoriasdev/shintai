import { afterEach, expect, it, vi } from 'vitest'
import { ApiError, NetworkError } from '@/shared/api/api-client'
import { logUnexpectedError } from './log-unexpected-error'

afterEach(() => vi.restoreAllMocks())

it('logs errors that are bugs in the UI', () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const bug = new SyntaxError('Unexpected token < in JSON')
  logUnexpectedError(bug)
  expect(error).toHaveBeenCalledWith('Unexpected error in a Shintai request.', bug)
})

it('leaves API and network failures to the UI, which already shows them', () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  logUnexpectedError(new ApiError(404, { type: 'about:blank', status: 404, title: 'Not Found' }))
  logUnexpectedError(new NetworkError(new TypeError('Failed to fetch')))
  expect(error).not.toHaveBeenCalled()
})
