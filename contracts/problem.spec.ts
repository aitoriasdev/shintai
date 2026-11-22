import { describe, expect, it } from 'vitest'
import { PROBLEM_TYPE_BASE, PROBLEM_TYPES, problemSchema } from './problem'

describe('problem types', () => {
  it('use client-error or server-error statuses and absolute type URIs', () => {
    for (const [slug, { status }] of Object.entries(PROBLEM_TYPES)) {
      expect(status, slug).toBeGreaterThanOrEqual(400)
      expect(new URL(PROBLEM_TYPE_BASE + slug).protocol).toBe('https:')
    }
  })

  it('accepts an RFC 9457 body with the validation extension', () => {
    const problem = {
      type: `${PROBLEM_TYPE_BASE}validation-failed`,
      status: 400,
      title: PROBLEM_TYPES['validation-failed'].title,
      detail: 'patch.score: Too big',
      instance: '/api/library/Q1',
      errors: [{ pointer: '#/patch/score', detail: 'Too big' }],
    }
    expect(problemSchema.parse(problem)).toEqual(problem)
  })
})
