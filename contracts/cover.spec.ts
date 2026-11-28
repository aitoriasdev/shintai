import { expect, it } from 'vitest'
import { coverQuerySchema } from './cover'

const SRC = 'https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_V.png'

it('accepts Wikimedia cover URLs at the supported widths', () => {
  expect(coverQuerySchema.parse({ src: SRC, w: '240' })).toEqual({ src: SRC, w: 240 })
  expect(coverQuerySchema.parse({ src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/x.png/500px-x.png', w: '480' }).w).toBe(480)
})

it.each([
  ['another host', 'https://example.com/cover.png'],
  ['a look-alike host', 'https://upload.wikimedia.org.evil.example/cover.png'],
  ['plain HTTP', 'http://upload.wikimedia.org/cover.png'],
  ['a local address', 'https://127.0.0.1/cover.png'],
  ['not a URL', 'cover.png'],
])('refuses %s, so the API cannot be used to reach other servers', (_, src) => {
  expect(coverQuerySchema.safeParse({ src, w: '240' }).success).toBe(false)
})

it('refuses widths it does not resize to', () => {
  for (const w of ['100', '241', '4000', 'big']) expect(coverQuerySchema.safeParse({ src: SRC, w }).success).toBe(false)
})
