---
name: error-messages
description: Use when adding or changing an error the user can see (an API error response, a failed save, a failed import or a validation message), or when an error shows up in the UI as a generic "Request failed with status …" or "Could not reach the Shintai API".
---

# Error Messages

Shintai has no telemetry. The API describes each error as an [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) Problem Details object, and the UI shows it to the user. The user must be able to see the message, and a screen reader must announce it (WCAG 3.3.1, 4.1.3).

## How an error travels

1. **Contract.** `contracts/problem.ts` lists every problem type in `PROBLEM_TYPES`: a slug (`validation-failed`), its status and a fixed English `title`. Each `type` URI is `PROBLEM_TYPE_BASE + slug` and points to a section of `docs/api/problems.md`.
2. **Server.** Throw `ProblemError(slug, { detail?, errors? })` from `server/http/problem.ts`. Validation (`server/http/validation.ts`) throws `validation-failed` with an `errors` list (`pointer` for body fields, `parameter` for query and path parameters) or `malformed-json`. `localOnly()` answers `forbidden-host`, `cross-site-request` and `unsupported-media-type`. `app.onError` in `server/http/create-app.ts` maps domain errors (`GameNotFoundError` → `game-not-found`, `UpstreamError` → `upstream-unavailable`). Unknown routes and unexpected errors become `about:blank` problems (404, 500). Responses use `application/problem+json`. Never send a stack trace, an SQL message or upstream details to the client; log them.
3. **Client.** `apiRequest()` in `src/shared/api/api-client.ts` throws an `ApiError` with `status`, the parsed `problem` (or `null` when something other than the API answered, such as the dev proxy while the API is down) and its `slug`. Its `message` is the problem's `detail`, or its `title` when there is no detail.
4. **UI.** Pick the channel by what the user needs:
   - A failure the user must notice, like a write that was undone: `showError(text)` from `src/shared/lib/error-notifications.ts`. It renders a persistent, dismissible `role="alert"` toast, portaled outside the inert app root.
   - A result next to the control that caused it, like the backup import: inline text in the component.
   - A neutral status, like a result count or "Imported: …": `announce(text)` from `src/shared/lib/announce.ts`.

## Instructions

1. Find the layer where the error starts and follow the steps above. Reuse an existing problem type before adding one.
2. For a new type: add it to `PROBLEM_TYPES`, add its section to `docs/api/problems.md` (heading = slug; a test checks this), add it to the responses in `server/openapi/openapi-document.ts`, and run `yarn openapi`.
3. Write the message for the user: say what happened and what to do next ("Could not save your change, so it was undone. Is the Shintai API running?"). Use sentence case and full sentences, don't apologise, and don't expose internals.
4. Test it. Server: assert the status, the `application/problem+json` content type and the `type` in the route spec (`server/**/*.spec.ts`). UI: fake the response with `problemResponse(slug)` from `src/shared/lib/testing/fixtures.ts` and assert the message with role-based queries, for example `getByRole('alert')`. Every user-facing error needs a test that fails without it.
5. Run `yarn check`.

## Common mistakes

- **Swallowing the error**: an empty `catch`, or a fallback value with no message, is a silent failure. Log it at least. Optimistic library writes must roll back and call `showError()`.
- **Choosing the message by status code**: two problems can share a status (`game-not-found` and `entry-not-found` are both 404), and a 502 can come from the dev proxy rather than from Wikipedia. Use the `slug`.
- **Toasting validation errors**: errors the user can fix in place belong next to the field or control, not in the global toast.
- **Leaking upstream details**: Wikipedia/Wikidata failures become `upstream-unavailable` with no `detail`. The details go to the server log only.
