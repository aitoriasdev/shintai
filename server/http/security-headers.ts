import { createHash } from 'node:crypto'
import { secureHeaders } from 'hono/secure-headers'

const INLINE_SCRIPT = /<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g

/**
 * CSP sources for the inline scripts in the built index.html (the pre-paint theme and language script), so the
 * policy allows exactly those scripts without 'unsafe-inline'. Computed from the file the server sends, so it can
 * never drift from the HTML.
 */
export function inlineScriptHashes(html: string): string[] {
  return [...html.matchAll(INLINE_SCRIPT)].map(([, body]) => `'sha256-${createHash('sha256').update(body).digest('base64')}'`)
}

/**
 * Security headers for every response (Hono's `secureHeaders`, tightened for Shintai):
 * - a strict Content Security Policy: the app's own files, cover art through our own API, no inline code except the
 *   hashed index.html script, no framing (clickjacking), no plugins, and Trusted Types for DOM sinks;
 * - COOP and CORP `same-origin`, so other sites can neither keep a handle to this window nor embed its responses;
 * - no camera, microphone, location and similar browser features.
 * There is no HSTS: the app is served over plain HTTP on 127.0.0.1, where it doesn't apply.
 */
export function securityHeaders(scriptHashes: readonly string[]) {
  return secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'none'"],
      scriptSrc: ["'self'", ...scriptHashes],
      styleSrc: ["'self'"],
      // Cover art comes resized from our own API (GET /api/covers), so no other image host is needed.
      imgSrc: ["'self'"],
      connectSrc: ["'self'"],
      manifestSrc: ["'self'"],
      baseUri: ["'none'"],
      formAction: ["'none'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      requireTrustedTypesFor: ["'script'"],
      trustedTypes: ["'none'"],
    },
    crossOriginOpenerPolicy: 'same-origin',
    crossOriginResourcePolicy: 'same-origin',
    referrerPolicy: 'no-referrer',
    xFrameOptions: 'DENY',
    strictTransportSecurity: false,
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
      payment: [],
      usb: [],
      serial: [],
      bluetooth: [],
      hid: [],
      displayCapture: [],
      browsingTopics: [],
    },
  })
}
