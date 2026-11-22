# Shintai API

Shintai's UI talks to a small local API. You can call it yourself too, for example to script a backup.

## Where it runs

The API runs only on your machine, at `http://127.0.0.1:4321` by default. Set `SHINTAI_PORT` to change the port. It never listens on other network interfaces.

Start it with `yarn start`, or with `yarn dev` while developing. The API also serves its OpenAPI document at `GET /api/openapi.json`.

## What it accepts

The API protects your library from other websites you visit while it runs. It refuses:

- requests whose `Host` header is not `127.0.0.1`, `localhost` or `[::1]`
- writes from another site (an `Origin` that isn't loopback, or `Sec-Fetch-Site: cross-site`)
- request bodies that aren't `application/json`

Every request is validated against the same schemas the app uses. There is no authentication: anything that can reach `127.0.0.1` on your machine can use the API.

## Errors

Errors are [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) Problem Details, sent as `application/problem+json`:

```json
{
  "type": "https://github.com/aitoriasdev/shintai/blob/main/docs/api/problems.md#validation-failed",
  "status": 400,
  "title": "The request is not valid",
  "detail": "patch.score: Too big: expected number to be <=10",
  "instance": "/api/library/Q17185964",
  "errors": [{ "pointer": "#/patch/score", "detail": "Too big: expected number to be <=10" }]
}
```

Use `type` to tell errors apart: `title` never changes for a type, and `detail` describes this occurrence. [Problem types](./problems.md) lists every type.

## Data

Your library lives in a SQLite file (`SHINTAI_DB_PATH`, `./data/shintai.db` by default). The catalogue comes from English Wikipedia and Wikidata, so game titles, descriptions and facts are in English. Release dates are ISO 8601 (`2013-09-17`, or `2013-09` and `2013` when Wikidata knows only the month or year), so clients can format them in any language.
