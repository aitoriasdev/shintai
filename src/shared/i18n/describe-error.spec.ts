import { expect, it } from 'vitest'
import { ApiError, NetworkError } from '@/shared/api/api-client'
import { problemResponse } from '@/shared/lib/testing/fixtures'
import { describeError } from './describe-error'
import { enGB } from './messages/en-gb'
import { esES } from './messages/es-es'

const apiError = async (res: Response) => new ApiError(res.status, await res.json())

it('says the API is unreachable when the request never got an answer', () => {
  const error = new NetworkError(new TypeError('Failed to fetch'))
  expect(describeError(error, enGB)).toBe('Could not reach the Shintai API. Is it running?')
  expect(describeError(error, esES)).toBe('No se pudo conectar con la API de Shintai. ¿Está en marcha?')
})

it('does not blame the API for an error in the UI itself', () => {
  // For example a 200 response whose body is not JSON, or a bug in a query's `select`.
  const error = new SyntaxError('Unexpected token < in JSON')
  expect(describeError(error, enGB)).toBe('Something went wrong in Shintai. Reload the page and try again.')
  expect(describeError(error, esES)).toBe('Algo ha fallado en Shintai. Recarga la página e inténtalo de nuevo.')
})

it('treats an error that is not a problem as unreachable, not as a Wikipedia outage', () => {
  // The Vite dev proxy answers 502 text/plain while the API is down.
  expect(describeError(new ApiError(502, null), enGB)).toBe('Could not reach the Shintai API. Is it running?')
})

it('words each known problem type in the UI language', async () => {
  const error = await apiError(problemResponse('upstream-unavailable'))
  expect(describeError(error, enGB)).toBe('Wikipedia is unavailable right now. Try again in a moment.')
  expect(describeError(error, esES)).toBe('Wikipedia no está disponible en este momento. Inténtalo de nuevo dentro de un rato.')
})

it("keeps the API's own detail for other problems in English, and does not mix languages in Spanish", () => {
  const error = new ApiError(500, { type: 'about:blank', status: 500, title: 'Internal Server Error' })
  expect(describeError(error, enGB)).toBe('Internal Server Error')
  expect(describeError(error, esES)).toBe('La API de Shintai devolvió un error (código 500).')
})
