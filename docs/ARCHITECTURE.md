# Architecture

## High-level flow

1. A user signs up / logs in on the website (email + password, `passport-local`).
2. They click "Authorise with Trello" on `/home` (profile page), which loads
   Trello's browser SDK (`//api.trello.com/1/client.js?key=<TRELLO_API_KEY>`)
   and redirects through `/trello_authorise`, where `Trello.authorize(...)`
   runs the OAuth-style handshake in the browser and hands back a token.
   That token is POSTed to `/api/trello_token` and stored per-user
   (`trello_tokens` table).
3. On the watch, the user enters an 8-character activation code (generated
   client-side on the watch) into the web UI (`POST /api/watches`), creating
   an inactive `watches` row keyed by that code.
4. The watch calls `POST /api/watch/register` with the same activation code;
   the server activates the row and returns a `uuid`, which the watch stores
   and uses for all subsequent calls.
5. The watch calls the watch-facing API to fetch Trello boards/lists using
   the user's stored Trello token — the server acts as a proxy to Trello's
   REST API via `node-trello`, doing some transformation (card count/name
   truncation, `[Xm Ys]` duration parsing for workout playback) before
   returning JSON shaped for the constrained watch client.

## Route table

### Pages / session auth (`ensureAuthenticated`)

| Method | Path | Controller | Purpose |
|---|---|---|---|
| GET/POST | `/register`, `/login` | `login.js` | Local signup/login |
| GET | `/logout` | `login.js` | Logout |
| GET | `/` | `index.js#home` | Landing page |
| GET | `/home` | `index.js#profile` | Logged-in profile page (watch list, Trello link) |
| GET | `/privacy` | `index.js#privacy` | Privacy policy |
| GET | `/trello_authorise` | `index.js#trelloAuthorise` | Renders the page that runs the Trello browser OAuth handshake |

### Browser JSON API (`ensureApiAuthenticated`, session auth, normal HTTP codes)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/watches` | List the logged-in user's watches |
| GET | `/api/watches/:id` | Get one watch |
| POST | `/api/watches` | Create a watch entry from an activation code (watch side generates the code) |
| DELETE | `/api/watches/:id` | Remove a watch |
| GET/POST/DELETE | `/api/trello_token` | Read/store/remove the user's Trello token |

### Watch-facing API (`watch_uuid` auth via `app.param`, **always HTTP 200**)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/watch/register` | Exchange activation code → watch `uuid`, marks watch active, stores device profile (HR zones etc. from Garmin `UserProfile`) |
| GET | `/api/watch/config/:watch_uuid` | Health-check / feature-flag endpoint the watch polls on boot |
| GET | `/api/watch/boards/:watch_uuid` | Proxies Trello `GET /1/members/me/boards` (fields: name) |
| GET | `/api/watch/board_lists/:watch_uuid/:board_id` | Proxies Trello `GET /1/boards/:id/lists` (with cards), truncates card names to `TRELLO_CARD_NAME_SIZE`, caps total cards at `TRELLO_CARD_COUNT`, and parses a `[Xm Ys]` / `[Xm]` / `[Xs]` suffix out of card names into a `t` (seconds) field used for timed playback on the watch |

Error convention for the watch-facing routes (required by the Connect IQ SDK,
which doesn't propagate non-200 status codes to the app):
```json
{"status": 400, "error": "human readable message"}
```
`status: 456` specifically means "not registered / register again" and is
handled explicitly by the watch app (`GarminelloApi.mc` / `RegisterDelegate.mc`
in `garminello-watch`).

## Data model (`src/models/models.js`, `src/migrations/`)

- `users` — email/password (HMAC-SHA1 + per-user salt), `features` json blob
- `watches` — `activation_code`, `uuid`, `type` (e.g. `vivoactive_hr`), `active`,
  `profile` (json, Garmin `UserProfile` snapshot), `app_info` (json, last seen
  app version)
- `trello_tokens` — one per user, `username` + `token`

## Trello integration surface

- Server-side: `node-trello` (`new Trello(TRELLO_API_KEY, trello_token)`),
  used only in `src/controllers/api.js` for the two watch-facing board/list
  endpoints. Both call `GET /1/...` REST endpoints with `key`/`token` as
  query params — the classic Trello REST auth model.
- Client-side: Trello's hosted browser SDK
  `//api.trello.com/1/client.js?key=<TRELLO_API_KEY>`, used in
  `profile.html` and `trello_authorise.html` for `Trello.authorize(...)`,
  `Trello.token()`, `Trello.members.get('me', ...)`.
- Also bundled via browserify-shim as an npm package `trello`
  (`src/client/views/trello-token-view.js`) mapped to the global `Trello`
  from the script above (see `browserify-shim` config in `package.json`).

See `docs/INTEGRATION_STATUS.md` for what could/couldn't be verified about
whether this integration still works end-to-end.
