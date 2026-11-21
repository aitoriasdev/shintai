---
name: error-messages
description: Use when adding or changing an error the user can see (an API error response, a failed save, a failed import or a validation message), or when an error shows up in the UI as a generic "Request failed with status …".
---

# Error Messages

Shintai has no error codes or telemetry. An error is a plain English sentence that travels from the API to the UI, where the user must be able to see it and a screen reader must announce it (WCAG 3.3.1, 4.1.3).

## How an error travels

1. **Server.** Validation failures come from the Zod schemas in `contracts/` (`server/http/validation.ts`). Client errors are thrown as `HTTPException(status, { message })`. Domain errors are mapped to a status in `app.onError` in `server/http/create-app.ts` (`GameNotFoundError` → 404, `UpstreamError` → 502). Every error body is `{ error: string }`. Unexpected errors are logged and become a generic 500. Never send a stack trace or an SQL message to the client.
2. **Client.** `apiRequest()` in `src/shared/api/api-client.ts` throws an `ApiError` with the status and the server's `error` text.
3. **UI.** Pick the channel by what the user needs:
   - A failure the user must notice, like a write that was undone: `showError(text)` from `src/shared/lib/error-notifications.ts`. It renders a persistent, dismissible `role="alert"` toast, portaled outside the inert app root.
   - A result next to the control that caused it, like the backup import: inline text in the component.
   - A neutral status, like a result count or "Imported: …": `announce(text)` from `src/shared/lib/announce.ts`.

## Instructions

1. Find the layer where the error starts and follow the steps above. Reuse an existing error class or status mapping before adding a new one.
2. Write the message for the user: say what happened and what to do next ("Could not save your change, so it was undone. Is the Shintai API running?"). Use sentence case and full sentences, don't apologise, and don't expose internals.
3. If the server adds a new domain error, map it in `app.onError` and add a case to the matching route spec (`server/**/*.spec.ts`), asserting the status and the `{ error }` body.
4. In the UI, assert the message with role-based queries in the component spec, for example `getByRole('alert')` for `showError()`. Every user-facing error needs a test that fails without it.
5. Run `yarn check`.

## Common Mistakes

- **Swallowing the error**: an empty `catch`, or a fallback value with no message, is a silent failure. Optimistic library writes must roll back and call `showError()`.
- **Toasting validation errors**: errors the user can fix in place belong next to the field or control, not in the global toast.
- **Leaking upstream details**: Wikipedia/Wikidata failures become "Wikipedia is unavailable right now" (502). The details go to the server log only.
