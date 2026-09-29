# Integration status check (2026-09-19)

This is a **static/code-level review**, done from a sandboxed environment
whose outbound network policy blocks `api.trello.com` and `*.herokuapp.com`
(confirmed: both return `403` at the egress proxy). No live HTTP request
to Trello or to the hosted `garminello.herokuapp.com` instance could be made
from here, so nothing below should be read as "confirmed broken" purely from
a runtime test — it's a list of concrete risk points found by reading the
code and cross-checking commit history, meant to focus a follow-up check
from an environment with normal internet access.

## garminello-web ↔ Trello

- The REST endpoints the server calls (`GET /1/members/me/boards`,
  `GET /1/boards/:id/lists`) and the query-param `key`/`token` auth scheme
  used by `node-trello` are still Trello's documented v1 REST API shape —
  nothing in the code itself looks structurally outdated.
- Bigger risk: **credential validity**. `TRELLO_API_KEY` /
  `TRELLO_OAUTH_SECRET` are supplied via env vars (`sample.env`,
  `sample.env-dev`) and aren't in the repo. Trello's API-key management UI
  has moved over the years (now under Power-Ups admin); an old key issued
  years ago should still work as long as it was never revoked, but this
  can't be confirmed without the actual deployed env vars and a live call.
- The browser SDK is loaded from `//api.trello.com/1/client.js?key=...`
  (protocol-relative URL) in `profile.html` and `trello_authorise.html`.
  This is Trello's older hosted JS client for the browser OAuth handshake
  (`Trello.authorize`). Worth confirming this script is still served at
  that path with current browsers (protocol-relative `//` URLs are fine
  under HTTPS pages, but should be checked given the page itself may be
  served over plain HTTP if the Heroku app's TLS/dyno setup has bit-rotted).

## garminello-web ↔ garminello-watch

- The API contract is internally consistent between the two repos as
  checked out here: field names the watch reads (`id`, `name`, `cards`,
  and the derived `t` field) line up with what `apiBoardLists` in
  `src/controllers/api.js` produces, and the `{status, error}` envelope /
  `status === 456` re-registration flow matches `ApiCall.onReceive` and
  `RegisterDelegate.mc` in `garminello-watch`.
- `garminello-watch/source/GarminelloApp.mc` hardcodes the API base URL to
  `https://garminello.herokuapp.com` at compile time — any change of hosting
  requires rebuilding and re-publishing the watch app via the Garmin
  Connect IQ store, not just a server-side deploy.
- No version negotiation beyond a `v` query param (`VERSION = "0.9"` in the
  watch app) that the server currently ignores except for logging
  (`apiConfig` stores it in `app_info` but doesn't branch on it).

## Hosting / operability

- Last commit in `garminello-web`: **2022-04-30**. Last commit in
  `garminello-watch`: **2016-06-22**.
- Heroku discontinued free dynos in **November 2022** — after this repo's
  last commit. Unless `garminello.herokuapp.com` has since been moved to a
  paid dyno (or elsewhere), the hosted instance is likely not running.
  This alone could explain "it doesn't work" independent of whether the
  Trello integration code itself is still correct.

## Modernization (2026-09-29)

Done from this sandbox and verified against a local PostgreSQL 16 (register,
login/logout, watch CRUD, watch-facing `/api/watch/*` endpoints, migrations,
seeds); Trello itself still unreachable from here (403 from the egress proxy).

- Node >=20 (`.nvmrc` 22), Dockerfile on `node:22`, lockfile committed.
- Express 5, Knex 3, Bookshelf 1.2 (knex peer range forced via `overrides`),
  pg 8, Passport 0.7, connect-pg-simple 10, express-session 1.19.
- Removed: gulp 3 + phantomjs test runner (replaced by `build.js` using esbuild,
  less, autoprefixer), `node-trello` (replaced by fetch-based `src/util/trello.js`),
  `express-validator`, `react*`, the `crypto` npm placeholder, and the dead
  Facebook strategy/config.
- Migration `20260929000000` converts `json` columns to `jsonb` (Bookshelf 1.x
  eager loading uses `select distinct`, which Postgres rejects on `json`).
- Old migrations/seeds rewritten for modern Knex (no injected `Promise`).
- Session secret can now be set via `SESSION_SECRET` (falls back to the old hardcoded value).
- `npm test` runs mocha in Node (7 tests: flash middleware, email validation, Trello client).

Remaining known issues:
- `npm audit`: 4 findings, all via `swig-templates` -> `optimist` -> `minimist`
  (CLI-only, not reachable at runtime). Swig is unmaintained; moving to another engine
  (nunjucks is nearly syntax-compatible) is the long-term fix.
- Passwords are HMAC-SHA1 with a weak salt (`Math.random`). Should migrate to
  scrypt/bcrypt with rehash-on-login.
- Bookshelf is effectively abandoned; consider Knex-only queries.
- Client still relies on jQuery/underscore/Bootstrap 3 globals from CDNs.

## Dead code

None known (Facebook strategy removed).

## Suggested next steps (from an environment with real network access)

1. `curl -I https://garminello.herokuapp.com/` — is the dyno even up?
2. With a valid key/token pair, hit `GET https://api.trello.com/1/members/me/boards?key=...&token=...` directly to confirm Trello's API still behaves as `node-trello`/`apiBoards` expects.
3. If the Heroku app is down, decide whether to re-deploy as-is (Heroku still supports classic buildpacks, but the Node version pin should be modernized first) or migrate hosting.
