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
- **Update (2026-09-19):** `package.json` now pins `"node": ">=22.0.0"` /
  `"npm": ">=10.0.0"` and a `package-lock.json` is committed. `npm install
  --legacy-peer-deps` and the `postinstall` `gulp build` were both verified
  to succeed on Node 22.22.2 (the peer-dep conflict is `consolidate@1.0.4`
  wanting `react@>=16.13.1` while this app pins `react@^15`; harmless since
  `consolidate`'s React support isn't used here — only its `swig` adapter
  is). `gulp` 3.x's `vinyl-fs`/`gaze` chain pulled in an ancient
  `graceful-fs` that crashed on Node 22 (`primordials is not defined`,
  via the `natives` package patching `fs`); fixed with an `overrides`
  entry pinning `graceful-fs` to `^4.2.11` across the tree — no gulpfile
  or plugin changes were needed. The server was also smoke-tested end to
  end against a local Postgres 16: `GET /` renders the Swig homepage, and
  `POST /api/watch/register` returns the documented always-200
  `{status, error}` envelope.

## Dead code (not a runtime bug, but worth knowing)

- `passport-facebook` is a dependency and `src/config/auth.js` has a
  Facebook app config (with placeholder `'1234'` credentials), but
  `src/util/passport.js` never calls `passport.use(new FacebookStrategy(...))`.
  Only the local email/password strategy is actually active. No Facebook
  login route exists in `routes.js` either.

## Suggested next steps (from an environment with real network access)

1. `curl -I https://garminello.herokuapp.com/` — is the dyno even up?
2. With a valid key/token pair, hit `GET https://api.trello.com/1/members/me/boards?key=...&token=...` directly to confirm Trello's API still behaves as `node-trello`/`apiBoards` expects.
3. If the Heroku app is down, decide whether to re-deploy as-is (Heroku still supports classic buildpacks, but the Node version pin should be modernized first) or migrate hosting.
