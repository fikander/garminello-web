# garminello-web

Backend + web UI for **Garminello**: a bridge between Trello and Garmin Connect
IQ watches (see the companion repo `garminello-watch`). Users link their
Trello account on the website; the watch app then reads Trello boards/lists
as navigable menus and "plays" a list as a timed workout sequence.

Live instance (historically): https://garminello.herokuapp.com — see
`docs/INTEGRATION_STATUS.md` for current health/risk notes, since this could
not be verified live from this environment (outbound network to
`api.trello.com` / `*.herokuapp.com` is blocked by sandbox policy).

For more detail see `docs/ARCHITECTURE.md` and `docs/INTEGRATION_STATUS.md`.

## Stack

- Node.js + Express 4 (very old `engines.node: >=4.4.5` — long EOL, see status doc)
- Bookshelf/Knex ORM over PostgreSQL
- Passport (local email/password strategy only — a `passport-facebook`
  strategy is wired into `package.json`/`config/auth.js` but never
  registered with passport, so it's dead code)
- Server-rendered views via Swig templates
- Client app: Backbone.js + jQuery, built with gulp/browserify/babel
- `node-trello` for server-side Trello REST calls; Trello's browser
  `client.js` SDK for the OAuth-style token handshake done in the browser
- Deployment target: Heroku (`Procfile`, `Dockerfile` for local dev only)

## Repo layout

```
src/
  server.js          Express app bootstrap
  routes.js          All route definitions (see docs/ARCHITECTURE.md for the full table)
  config/            app.js (env-driven config), auth.js (unused FB config), db.js
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
4. Inside the container: `gulp build` then `gulp watch`.

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
- Heroku's free dyno tier was discontinued in Nov 2022; last commit here is
  from Apr 2022, so the hosted instance is likely not running unless it's
  since been moved to a paid dyno or another host.
- Dependency versions are ~2016-era (Express 4.13, Knex 0.8, Bookshelf 0.8,
  `node-trello` 1.1.2); `npm install` under a modern Node/npm may fail or
  behave differently than originally deployed.
- Trello's REST endpoints actually used (`/1/members/me/boards`,
  `/1/boards/:id/lists`) and the browser `//api.trello.com/1/client.js`
  SDK are the parts most likely to have drifted — could not be verified
  live from this sandbox (network egress to Trello/Heroku is blocked here).
