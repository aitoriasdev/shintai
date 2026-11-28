import type { CoverQuery } from '@contracts/cover'
import sharp from 'sharp'
import { inject, injectable } from 'tsyringe'
import { UpstreamError } from '../games/wikipedia-client'
import { WIKIMEDIA_USER_AGENT } from '../http/wikimedia-user-agent'
import { TOKENS, type FetchFn } from '../tokens'

/** Covers on Wikipedia are small; anything bigger than this is not a cover and is refused unread. */
const MAX_COVER_BYTES = 15 * 1024 * 1024
const FETCH_TIMEOUT_MS = 10_000

/** Fetches cover art from Wikimedia and returns it resized to `w` pixels wide (never enlarged) as WebP. */
@injectable()
export class CoverService {
  constructor(@inject(TOKENS.Fetch) private readonly fetchFn: FetchFn) {}

  async resize({ src, w }: CoverQuery): Promise<Uint8Array<ArrayBuffer>> {
    const original = await this.fetchCover(src)
    try {
      const resized = await sharp(original, { limitInputPixels: 40_000_000 })
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toBuffer()
      return new Uint8Array(resized)
    } catch (error) {
      throw new UpstreamError(null, src, { cause: error })
    }
  }

  private async fetchCover(src: string): Promise<Uint8Array> {
    let res: Response
    try {
      // `redirect: 'error'`: a redirect could lead away from the allowed Wikimedia hosts.
      res = await this.fetchFn(src, {
        headers: { 'User-Agent': WIKIMEDIA_USER_AGENT, Accept: 'image/*' },
        redirect: 'error',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      })
    } catch (error) {
      throw new UpstreamError(null, src, { cause: error })
    }
    if (!res.ok) throw new UpstreamError(res.status, src)
    if (Number(res.headers.get('Content-Length') ?? 0) > MAX_COVER_BYTES) throw new UpstreamError(res.status, src)
    const body = new Uint8Array(await res.arrayBuffer())
    if (body.byteLength > MAX_COVER_BYTES) throw new UpstreamError(res.status, src)
    return body
  }
}
