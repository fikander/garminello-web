# garminello-web

Backend + web UI for **Garminello**: a bridge between Trello and Garmin Connect
IQ watches (see the companion repo `garminello-watch`). Users link their
Trello account on the website; the watch app then reads Trello boards/lists
as navigable menus and "plays" a list as a timed workout sequence.

Live instance (historically): https://garminello.herokuapp.com — see
`docs/INTEGRATION_STATUS.md` for current health/risk notes, since this could
not be verified live from this environment (outbound network to
`api.trello.com` / `*.herokuapp.com` is blocked by sandbox policy).

For more detail see `docs/ARCHITECTURE.md`, `docs/INTEGRATION_STATUS.md`,
and `docs/REWRITE_PLAN.md` (modern-stack rewrite estimate).

## Stack

- Node.js >=20 (`.nvmrc`: 22) + Express 5. Tests: `npm test` (mocha + chai, `src/test/`)
- Bookshelf 1.2 / Knex 3 ORM over PostgreSQL (bookshelf's knex peer range is stale; `overrides` in package.json forces knex 3. Eager loads use `select distinct`, hence `json` columns became `jsonb` in migration 20260929000000)
- Passport 0.7 (local email/password strategy only)
- Server-rendered views via Swig templates (`swig-templates` fork)
- Client app: Backbone.js + jQuery, bundled with esbuild (`build.js`; `npm run build` / `npm run watch`)
- `src/util/trello.js` (fetch-based, replaced `node-trello`) for server-side Trello REST calls; Trello's browser
  `client.js` SDK for the OAuth-style token handshake done in the browser
- Deployment target: Heroku (`Procfile`, `Dockerfile` for local dev only)

## Repo layout

```
src/
  server.js          Express app bootstrap
  routes.js          All route definitions (see docs/ARCHITECTURE.md for the full table)
  config/            app.js (env-driven config), db.js
  controllers/       index.js (pages), login.js (auth), api.js (REST API, incl. watch-facing API)
  models/            Bookshelf models: User, Watch, TrelloToken
  migrations/        Knex schema migrations
  util/passport.js   Passport strategy registration (local only)
  client/            Backbone app, templates, static assets, less
```

## Local dev

See `README.md` for the full docker-compose + ngrok workflow. Summary:

1. Copy `sample.env-dev` → `.env-dev`, fill in `TRELLO_API_KEY` /
   `TRELLO_OAUTH_SECRET` (from Trello's Power-Ups admin / API key page).
2. `cp docker-compose-sample.yml docker-compose.yml`, adjust volumes.
3. `docker-compose build && docker-compose up -d`
4. Inside the container: `npm run build` then `npm run watch`.

## Two distinct APIs served from `routes.js`

1. **Browser/user API** (`/api/watches*`, `/api/trello_token*`) — session
   auth via Passport, normal HTTP status codes.
2. **Watch-facing API** (`/api/watch/*`) — a different auth model keyed off
   a per-watch `uuid` (`app.param('watch_uuid', ...)`), and importantly:
   **always returns HTTP 200**, with real errors embedded as
   `{status, error}` in the JSON body. This is a documented constraint of
   the Garmin Connect IQ SDK's HTTP client, which doesn't surface non-200
   status codes to the watch app — see `docs/ARCHITECTURE.md` for the exact
   contract shared with `garminello-watch`.

## Known risks / things to check before assuming this works

See `docs/INTEGRATION_STATUS.md` for the full list. Highlights:
- Per the owner (2026-09), `garminello.herokuapp.com` is still live (dyno
  sleeps when idle, so the first request after idle is slow).
- Dependencies were modernized on 2026-09-29; see `handover.md` for state and open items.
- Trello's REST endpoints actually used (`/1/members/me/boards`,
  `/1/boards/:id/lists`) and the browser `//api.trello.com/1/client.js`
  SDK are the parts most likely to have drifted — could not be verified
  live from this sandbox (network egress to Trello/Heroku is blocked here).
