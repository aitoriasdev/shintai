import { expect, it } from 'vitest'
import { coverSrc, coverSrcSet } from './cover-src'

const COVER = 'https://upload.wikimedia.org/wikipedia/en/a/a5/Grand Theft Auto V.png'

it('points at the resizing endpoint with the encoded source and the width', () => {
  const url = new URL(coverSrc(COVER, 240), 'http://127.0.0.1')
  expect(url.pathname).toBe('/api/covers')
  expect(url.searchParams.get('src')).toBe(COVER)
  expect(url.searchParams.get('w')).toBe('240')
})

it('offers a 2x version for high-density screens', () => {
  expect(coverSrcSet(COVER)).toBe(`${coverSrc(COVER, 240)} 1x, ${coverSrc(COVER, 480)} 2x`)
})
