import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createTestContainer } from '../testing/create-test-container'
import { createApp } from './create-app'
import { inlineScriptHashes } from './security-headers'

const sha256 = (text: string) => `'sha256-${createHash('sha256').update(text).digest('base64')}'`

describe('inlineScriptHashes', () => {
  it('hashes inline scripts and skips scripts loaded from a file', () => {
    const html = '<script>one()</script><script type="module" crossorigin src="/assets/app.js"></script><script>\n two()\n</script>'
    expect(inlineScriptHashes(html)).toEqual([sha256('one()'), sha256('\n two()\n')])
  })

  it("finds the pre-paint theme script in the app's index.html", () => {
    expect(inlineScriptHashes(readFileSync(new URL('../../index.html', import.meta.url), 'utf8'))).toHaveLength(1)
  })
})

describe('security headers', () => {
  function setup(staticRoot = '/nonexistent') {
    const { container } = createTestContainer({ config: { staticRoot } })
    return createApp(container)
  }

  it('sends a strict policy on every response, API errors included', async () => {
    for (const path of ['/api/health', '/api/nope']) {
      const res = await setup().request(path)
      const csp = res.headers.get('Content-Security-Policy') ?? ''
      expect(csp).toContain("default-src 'none'")
      expect(csp).toContain("frame-ancestors 'none'")
      expect(csp).toContain("object-src 'none'")
      expect(csp).toContain("require-trusted-types-for 'script'")
      expect(csp).not.toContain('unsafe-inline')
      expect(res.headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin')
      expect(res.headers.get('Cross-Origin-Resource-Policy')).toBe('same-origin')
      expect(res.headers.get('X-Frame-Options')).toBe('DENY')
      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(res.headers.get('Permissions-Policy')).toContain('camera=()')
      expect(res.headers.get('Strict-Transport-Security')).toBeNull()
    }
  })

  it('allows exactly the inline scripts of the index.html it serves', async () => {
    const root = mkdtempSync(join(tmpdir(), 'shintai-static-'))
    writeFileSync(join(root, 'index.html'), '<!doctype html><script>paintTheme()</script><div id="root"></div>')
    const res = await setup(root).request('/library')
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Security-Policy')).toContain(`script-src 'self' ${sha256('paintTheme()')};`)
  })
})
