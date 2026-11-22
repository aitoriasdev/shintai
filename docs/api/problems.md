# Problem types

Every error the Shintai API sends is an [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) Problem Details object, served as `application/problem+json`. Its `type` is the address of one of the sections below.

Two errors have no Shintai type and use `about:blank`, with the HTTP status phrase as the title: an unknown `/api` route (404 `Not Found`) and an unexpected server error (500 `Internal Server Error`, logged on the server).

## validation-failed

- **Status:** 400
- **Title:** The request is not valid

A query parameter, path parameter or body field is missing or out of range. `errors` lists each one: `pointer` (an [RFC 6901](https://www.rfc-editor.org/rfc/rfc6901) JSON Pointer) for body fields, `parameter` for query and path parameters. A backup import is all or nothing, so one invalid entry rejects the whole file.

**What to do:** Fix the fields listed in `errors` and send the request again.

## malformed-json

- **Status:** 400
- **Title:** The request body is not valid JSON

The body could not be parsed as JSON.

**What to do:** Send a valid JSON body with `Content-Type: application/json`.

## forbidden-host

- **Status:** 403
- **Title:** The API only answers on this computer

The `Host` header is not a loopback name. This blocks DNS-rebinding attacks, where another website points its own domain at `127.0.0.1`.

**What to do:** Call the API at `127.0.0.1`, `localhost` or `[::1]`.

## cross-site-request

- **Status:** 403
- **Title:** Cross-site requests are not allowed

A write (`PUT`, `POST`, `DELETE`) came from another website: its `Origin` is not a loopback address, or the browser sent `Sec-Fetch-Site: cross-site`. This blocks cross-site request forgery.

**What to do:** Send writes from the Shintai app itself, or from a script that does not set a foreign `Origin`.

## game-not-found

- **Status:** 404
- **Title:** The game was not found

Wikipedia has no article with that page id, or it was deleted.

**What to do:** Search the catalogue again to get a current page id.

## entry-not-found

- **Status:** 404
- **Title:** The game is not in the library

`DELETE /api/library/{gameId}` was called for a game that is not in the library (or was already removed).

**What to do:** No action needed if you meant to remove it.

## unsupported-media-type

- **Status:** 415
- **Title:** Request bodies must be application/json

A request with a body did not send `Content-Type: application/json`. This also blocks `text/plain` "simple" requests that other sites can send without a CORS preflight.

**What to do:** Send the body as JSON with `Content-Type: application/json`.

## upstream-unavailable

- **Status:** 502
- **Title:** Wikipedia is unavailable right now

Wikipedia or Wikidata did not answer, or answered with an error, after one retry. The details are in the server log only.

**What to do:** Try again in a moment. Search results are cached for an hour and details for 30 days, so earlier results still work.
