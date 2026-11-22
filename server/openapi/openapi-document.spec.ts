import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { createApp } from '../http/create-app'
import { createTestContainer } from '../testing/create-test-container'
import { PROBLEM_TYPES } from '@contracts/problem'
import { createOpenApiDocument } from './openapi-document'
import { OPENAPI_FILE, serializeOpenApiDocument } from './write-openapi-document'

const document = createOpenApiDocument('0.0.0-test')
const METHODS = new Set(['GET', 'PUT', 'POST', 'DELETE'])

describe('OpenAPI document', () => {
  it('is committed up to date (run `yarn openapi` after changing the API)', () => {
    expect(readFileSync(OPENAPI_FILE, 'utf8')).toBe(serializeOpenApiDocument())
  })

  it('documents every API route the app serves', () => {
    const app = createApp(createTestContainer().container)
    const served = app.routes
      .filter(({ method, path }) => METHODS.has(method) && path.startsWith('/api/') && !path.includes('*'))
      .map(({ method, path }) => `${method} ${path.replace(/:(\w+)/g, '{$1}')}`)
    const documented = Object.entries(document.paths).flatMap(([path, operations]) =>
      Object.keys(operations).map((method) => `${method.toUpperCase()} ${path}`),
    )
    expect(new Set(served)).toEqual(new Set(documented))
  })

  it('resolves every $ref to a component', () => {
    const refs = [...JSON.stringify(document).matchAll(/"\$ref":"#\/components\/schemas\/(\w+)"/g)].map(([, name]) => name)
    expect(refs.length).toBeGreaterThan(0)
    for (const name of refs) expect(document.components.schemas, name).toHaveProperty(name)
  })

  it('has a docs section for every problem type, so each `type` URI resolves', () => {
    const headings = readFileSync(new URL('../../docs/api/problems.md', import.meta.url), 'utf8').match(/^## .+$/gm) ?? []
    expect(headings.map((heading) => heading.slice(3))).toEqual(Object.keys(PROBLEM_TYPES))
  })

  it('is served by the API', async () => {
    const res = await createApp(createTestContainer().container).request('/api/openapi.json')
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ openapi: '3.1.1', info: { title: 'Shintai API' } })
  })
})
