import { writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createOpenApiDocument } from './openapi-document'
import { packageVersion } from './package-version'

/** `yarn openapi`: regenerates docs/api/openapi.json, which Scalar publishes. */
export const OPENAPI_FILE = new URL('../../docs/api/openapi.json', import.meta.url)

export function serializeOpenApiDocument(): string {
  return `${JSON.stringify(createOpenApiDocument(packageVersion()), null, 2)}\n`
}

// pathToFileURL, not `file://${path}`: import.meta.url is percent-encoded (spaces, non-ASCII, Windows drive letters).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  writeFileSync(OPENAPI_FILE, serializeOpenApiDocument())
  console.log(`Wrote ${fileURLToPath(OPENAPI_FILE)}`)
}
