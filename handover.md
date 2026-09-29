# Handover: modernization of garminello-web

Branch: `claude/festive-davinci-4ciwn4` (pushed, no PR opened). Date: 2026-09-29.

## Done
- Node >=20 (`.nvmrc` 22), Dockerfile on `node:22`, `package-lock.json` committed.
- Express 5, Knex 3, Bookshelf 1.2, pg 8, Passport 0.7, connect-pg-simple 10, express-session 1.19.
  Bookshelf's knex peer range stops at 0.21, so `overrides` in `package.json` forces knex 3.
- gulp 3 / PhantomJS replaced by `build.js` (esbuild + less + autoprefixer): `npm run build`, `npm run watch`.
  `postinstall` runs the build; output goes to git-ignored `public/`.
- `node-trello` replaced by fetch-based `src/util/trello.js` (same `get(path, query, cb)` interface).
- Removed `express-validator` (now `src/util/validate.js`), react*, `crypto` npm placeholder, Facebook strategy and `src/config/auth.js`.
- Migrations/seeds rewritten for modern Knex. New migration `20260929000000` converts `json` -> `jsonb`
  (Bookshelf 1.x eager loads use `select distinct`, which Postgres rejects on `json`).
- Logout fixed for Passport 0.6+ (callback form). `SESSION_SECRET` env var supported (falls back to old hardcoded secret).
- CDN links in layout updated (dead netdna/maxcdn -> cdnjs; Bootstrap 3.4.1, jQuery 3.7.1, underscore 1.13.7).
- Tests: `npm test` (mocha 11 + chai 4, `src/test/*.test.js`), 7 passing.

## Verified
Against local Postgres 16 (`pg_ctlcluster 16 main start`, user `postgres`/`postgres`, `ENVIRONMENT=development`
so seeds run): register, login/logout, `/api/watches`, `/api/trello_token`, `/api/watch/config|boards|register`.
Trello itself unreachable from the sandbox (403), so real Trello calls are untested. No browser check of the UI.

## Open / next steps
1. Open a PR if wanted; deploy check (`garminello.herokuapp.com` is live per the owner; dyno sleeps when idle).
2. Browser smoke test of the profile page and the Trello authorise flow with a real API key
   (client relies on jQuery/underscore globals from CDN and `window.Trello`).
3. `npm audit`: 4 findings via `swig-templates` -> `optimist` -> `minimist` (CLI only). Long-term: move to nunjucks.
4. Passwords are HMAC-SHA1 with a `Math.random` salt: migrate to scrypt/bcrypt with rehash-on-login.
5. Bookshelf is abandoned; consider plain Knex queries and dropping the `overrides`.
6. Migration `20260929000000` runs `ALTER ... TYPE jsonb` on existing prod DBs: try on a copy first.
7. No tests yet for controllers/DB; would need a test Postgres (or pg-mem) in CI. No CI config exists.

## Gotchas
- Watch-facing API (`/api/watch/*`) must always return HTTP 200 with `{status, error}` in the body.
- `pkill -f "node src/server.js"` inside a Bash tool call kills the tool's own shell; kill by PID instead.
