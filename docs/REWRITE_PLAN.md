# Rewrite plan: modern stack (estimate, 2026-09-29)

Baseline: master after the 2026-09-29 in-place modernization (Node 22,
Express 5, Knex 3, Bookshelf 1.2, esbuild, fetch-based Trello client; see
`handover.md`). That made the app *run* on a current toolchain; this plan is
the next step — replacing the architecture (Backbone/Swig/Passport/Bookshelf).

Scope assumption: greenfield rewrite, **no migration of the existing prod
database** (users re-register, re-link Trello and re-pair watches). The one
thing that must *not* change is the watch-facing API, because the published
`garminello-watch` app hardcodes `https://garminello.herokuapp.com` and its
request/response shapes, and changing those means a Connect IQ store release.

## How big is this app really?

Small. Excluding images/PSDs, the whole thing is ~1,500 lines:

| Area | Today | Size |
|---|---|---|
| Server | Express 5, Passport local, Bookshelf 1.2/Knex 3, Swig | ~650 LOC (`api.js` is 293 of it) |
| Data | 3 tables (`users`, `watches`, `trello_tokens`) + `session` | 2 migrations |
| Browser UI | Backbone views (esbuild) + Swig pages, jQuery/Bootstrap 3 from CDN: landing, login, signup, profile (Trello link, add/list/delete watch), privacy, Trello authorise | ~8 views/templates |
| Watch API | 4 endpoints: register, config, boards, board_lists | ~130 LOC incl. card-time parsing |
| Tests | 7 mocha unit tests (no controller/DB tests, no CI) | – |

So the rewrite is a weekend-to-two-weeks job, not a project. The risk is in
the edges (watch contract, Trello auth handshake, Google OAuth setup,
hosting cutover), not the volume of code.

## Proposed stack

| Concern | Choice | Why |
|---|---|---|
| Runtime | Node 26 (or 24 LTS until 26 goes LTS in Oct 2026), TypeScript run natively (type stripping) or via `tsx` | Current; one language front and back |
| Package mgr / layout | pnpm, single repo with `server/` and `web/` (or one package with both) | App is too small for a real monorepo |
| HTTP server | **Hono** (or Fastify) | Small, typed, fetch-native; Express 5 is also fine if you want familiarity |
| DB | Postgres + **Drizzle ORM** + drizzle-kit migrations | Typed schema, SQL-shaped, trivial for 3 tables |
| Auth | **Better Auth** — email/password + Google social provider, DB-backed sessions, account linking | Gives user/pass *and* Google in one library; replaces Passport + hand-rolled HMAC-SHA1 hashing |
| Validation | zod | Shared between API and UI |
| Trello | reuse the fetch-based `src/util/trello.js` from master | Already off `node-trello` |
| Trello linking | server redirect to `https://trello.com/1/authorize?...&return_url=...&callback_method=fragment&scope=read&expiration=never` | Removes dependency on the legacy `client.js` browser SDK |
| Frontend | **React 19 + Vite**, React Router, TanStack Query, Tailwind (or plain CSS modules) | Requested; SPA served by the same server → same-origin cookies, no CORS |
| Tests | Vitest (+ supertest-style requests against Hono), Playwright for 1–2 smoke flows | |
| CI | GitHub Actions: typecheck, lint (Biome or ESLint), test | |
| Hosting | **Stay on Heroku** (Basic dyno + Postgres Essential) | Keeps the `garminello.herokuapp.com` hostname the watch needs. Moving elsewhere is possible but needs the Heroku app kept as a proxy, or a watch-app release |

## Non-negotiable: watch API contract

Port byte-for-byte, and pin it with contract tests *before* rewriting
(record responses from the current implementation as fixtures):

- Paths: `POST /api/watch/register`, `GET /api/watch/config/:uuid?v=`,
  `GET /api/watch/boards/:uuid`, `GET /api/watch/board_lists/:uuid/:board_id`.
- **Always HTTP 200**; errors as `{status, error}`; `status: 456` means
  "unknown watch / re-register" (this is what makes dropping the DB safe —
  existing watches will fall into the re-register flow).
- `register` request body fields `activation_code`, `profile`, `type`;
  response is the watch row.
- `config` response `{active, user: {features}}`.
- `board_lists` shape: lists with `id`, `name`, `cards[]` of `{name, t?}`
  (card `id` removed, `[1m30s]` time tag parsed into `t` seconds and
  stripped, names truncated to `TRELLO_CARD_NAME_SIZE`, total cards capped
  at `TRELLO_CARD_COUNT`).
- Watch UUID stays a ≤32-char string (the watch stores it).

## Things to fix on the way (found reading the current code)

- **IDOR**: `GET/DELETE /api/watches/:id` don't check `user_id` — any logged-in
  user can read/delete any watch by id. Scope every query by the session user.
- Passwords are `HMAC-SHA1(salt, pw)` with a `Math.random` salt — replaced by Better Auth's scrypt/argon2.
- Watch UUIDs/ids come from `Math.random()` — use `crypto.randomUUID()` /
  `crypto.randomBytes`.
- Trello tokens stored in plaintext — at least encrypt at rest with an app key.
- Activation-code pairing has no expiry — add a TTL (e.g. 15 min).
- `addTrelloToken` has unhandled promise branches; `apiBoards` checks
  `=== undefined` on a possibly-missing related row.
- Swig (unmaintained, the source of the remaining `npm audit` findings) and
  Bookshelf (abandoned, needs a knex `overrides` hack) go away.

## Google login specifics

- Google Cloud project → OAuth consent screen (External, scopes `openid email
  profile` only — non-sensitive, so no Google verification review needed) →
  Web OAuth client with redirect URI `https://garminello.herokuapp.com/api/auth/callback/google`
  (+ `http://localhost:<port>/...` for dev).
- Link accounts by verified email so a user can use either method.
- Optional but recommended with email/password: email verification and
  password reset → needs a transactional email provider (Resend, Postmark,
  SES). Adds ~0.5–1 day and a small recurring cost. Could be skipped
  initially if Google login is the "easy" path.

## Estimate

For one developer who knows the stack (or you + Claude writing most of the code):

| # | Work | Effort |
|---|---|---|
| 1 | Scaffold: TS, pnpm, Vite+React, Hono, Drizzle, lint/format, docker-compose Postgres, CI (none exists yet) | 0.5 d |
| 2 | Schema + migrations (users/sessions/accounts from Better Auth, `watches`, `trello_tokens`) | 0.5 d |
| 3 | Watch API contract tests (fixtures from current code) + port | 1 d |
| 4 | Auth: email/password + Google, session middleware, login/signup pages | 1–1.5 d |
| 5 | User API: watches CRUD (pairing via activation code), Trello token | 0.5 d |
| 6 | Trello authorize redirect flow + "linked as @username" / unlink | 0.5–1 d |
| 7 | React UI: landing (content from `index.html`), login/signup, dashboard, privacy; basic responsive styling | 1.5–2 d |
| 8 | Heroku: Node buildpack, Postgres add-on, env vars, release-phase migrations, custom 404/health | 0.5 d |
| 9 | End-to-end check with the watch simulator / real watch, cutover, rollback plan | 0.5–1 d |
| | Optional: email verification + password reset | +0.5–1 d |
| | **Total** | **~6.5–9 dev-days** (≈2 weeks part-time) |

Realistically, with Claude doing the bulk of the typing, the code can be done
in a few focused sessions; the calendar time is dominated by the manual bits
only you can do: Google Cloud console setup, confirming the Trello API key in
the Power-Ups admin, Heroku config, and testing on a watch.

## Cutover plan

1. Build the new app on a branch; deploy to a **second** Heroku app
   (e.g. `garminello-next`) with its own Postgres.
2. Point a Connect IQ simulator build at `garminello-next` to validate the
   watch contract end-to-end (only a local build; no store release needed).
3. When happy, deploy the new code to the original `garminello` Heroku app
   with a fresh DB (or promote via pipeline). Existing watches get `456` and
   re-register; users sign up again.
4. Keep the old release in Heroku's release history for instant rollback.

## Open questions for you

- Keep Heroku (simplest, keeps hostname) vs. move (Fly/Render/Railway) and
  keep a tiny Heroku proxy? Recommendation: keep Heroku.
- Email verification / password reset in v1, or Google-first and add later?
- Any appetite for a watch-app release? If yes, worth adding a versioned
  `/api/watch/v2` and a custom domain so hosting is never pinned again.
