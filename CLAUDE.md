# CLAUDE.md

Guidance for Claude Code sessions working in this repository.

## Stack & Architecture

Viblooop web is a single Angular 20 application (standalone components, no NgModules) living under `web/`, not the repo root — there is no root `package.json`. It renders via SSR (`@angular/ssr` + an Express server in `web/src/server.ts`), ships as a PWA (`ngsw-config.json`), and is wrapped by Capacitor for iOS/Android native builds. There is no backend or database in this repo: it's a pure frontend calling an external API whose base URL is derived at runtime from `window.location.hostname` in `web/src/environment.ts`. State management is mostly RxJS `Subject`/`BehaviorSubject` instances living inside singleton services (`providedIn: 'root'`), with a single `@ngrx/signals` store (`shared/store/message.store.ts`) — there is no global app-wide store. Real-time behavior runs over one `socket.io-client` connection (`shared/services/socket/socket.service.ts`) that multiplexes both chat and in-app notifications; Firebase Cloud Messaging (`@angular/fire`) is a separate, push-notification-only channel. Styling combines Tailwind v4 (config inlined via `@theme` in `styles.scss`, no `tailwind.config.js`), DaisyUI, Flowbite, and Angular Material/CDK simultaneously — three UI systems coexist, see Do's/Don'ts below.

## Key Commands

Run from `web/` (there is nothing to run at the repo root):

- `npm start` — `ng serve --host 0.0.0.0 --port 4200`
- `npm run build` — `ng build`
- `npm run watch` — dev build with `--watch`
- `npm test` — `ng test` (Karma + Jasmine)
- `npm run serve:ssr:vibloop` — run the built SSR server
- `npm run extract-i18n-text` — extract i18n strings to `src/locale/source.xlf`

**There is no `lint` or `format` script.** No ESLint, Prettier, or Husky config exists yet (see Phase 4 tooling proposal, not yet applied). Don't assume `npm run lint` works.

## Folder Map (`web/src/app/`)

| Path | Purpose |
|---|---|
| `components/auth/` | Login (OTP request) and OTP-verification pages |
| `components/chat/` | Per-event chat panel + `inbox/` (conversation list) |
| `components/common/` | Header, footer, and other app-shell chrome |
| `components/events/` | Event browsing, details, and creation — includes both `create-event/` (legacy) and `create-event2/` (active wizard, see below) |
| `components/home/` | Landing/home page |
| `components/user/` | Read-only user views (e.g. `profile/`) |
| `components/user-profile/` | Editable profile pages — includes `edit-profile/` (active) |
| `directives/` | `blur-up`, `outside-click` |
| `guards/` | Route guards: `auth`, `profile-score`, `unsave-changes` |
| `interceptor/` | Functional HTTP interceptors: `auth`, `apiCaching`, `loader`, `ssrApi` |
| `shared/components/` | Reusable UI: notification panel, toast, event-created overlay, etc. |
| `shared/interfaces/` | The few explicit TypeScript interfaces that exist in the app |
| `shared/pipes/`, `shared/location-picker-component/` | Reusable pipes and the map/location picker |
| `shared/services/` | One folder per domain: `auth`, `events`, `user`, `notification`, `socket`, `http`, `message`, `loader`, `theme`, `web-storage`, `browser`, `drawer`, `popup`, `route`, `seo`, `service-workers` |
| `shared/store/` | `message.store.ts` — the only `@ngrx/signals` store in the app |

Outside `app/`: `assets/` (images, Lottie JSON, `firebase-messaging-sw.js`), `styles/` (SCSS abstracts/base/light-dark themes), `locale/` (i18n xlf), `environment.ts` (single config file — see Auth/secrets note below).

## Coding Conventions Observed

- **Naming**: kebab-case files and folders, Angular suffix convention (`.component.ts`, `.service.ts`, `.guard.ts`, `.pipe.ts`, `.directive.ts`). One outlier exists — `shared/interfaces/ResponseFormat.ts` is PascalCase — treat it as a legacy exception, not a pattern to copy.
- **Organization**: layer-based at the top (`components/`, `shared/`, `guards/`, `interceptor/`), feature-based folders nested inside `components/`. Follow this same nesting for new features rather than introducing a new top-level layer.
- **Services**: singleton (`providedIn: 'root'`), one service per domain, exposing state via RxJS `Subject`/`BehaviorSubject` fields (e.g. `AuthService.userDetails$`, `SocketService.notifications$`). New shared state should follow this pattern unless there's a specific reason to reach for `@ngrx/signals` (currently used only once).
- **API calls**: components/services call a per-domain service method, which calls into the thin `HttpService` wrapper (`shared/services/http/http.service.ts` — just `get`/`post`/`put`/`delete`/`makeHttpCall` passthroughs to `HttpClient`), which flows through the functional interceptors.
- **Error handling**: not centralized. Each component's own `.subscribe({ next, error })` block handles failures inline — typically `console.error(err)` plus a local component-state message shown in the template (see `components/auth/login/login.component.ts`). There's no global HTTP-error interceptor or toast-on-error convention; don't assume one exists when writing new API-calling code — match the local pattern instead.
- **Types**: the domain model is almost entirely untyped (`any`) — Event, User, Category, and ChatGroup have no formal interfaces, only a handful of ad hoc ones exist (`ChatMessage`, `AttendeesProfile`, the `NotificationType` enum). Don't assume a type exists; grep for actual field usage before relying on one (see `SPEC.md`).

## Auth Flow

Dual auth: OTP (`components/auth/login/`, `components/auth/otp-verification/`) and Google OAuth (`AuthService.googleLogin()` redirects the browser to `{authBaseUrl}/auth/google`). Session state is **httpOnly-cookie-based, not localStorage tokens** — `AuthService.initAuth()` hydrates an in-memory `userDetails$` `BehaviorSubject` via `GET /me` with `withCredentials: true`. Every HTTP request gets `withCredentials: true` from `interceptor/auth/auth.interceptor.ts`. That same file implements silent 401 refresh: `authInterceptorWithRefresh` catches 401s, calls `POST /refresh-access-token` once (queuing concurrent requests behind an `isRefreshing` flag + `refreshTokenSubject`), and falls back to `authService.logout(false)` if refresh also fails. `StorageService` (`shared/services/web-storage/`) is a generic storage wrapper used for non-auth data (theme, etc.) — don't repurpose it for tokens, there's currently no token to store client-side.

**Secrets note**: `web/src/environment.ts` has real Firebase, Google Maps, GTM/GA keys committed in plaintext, with no `.env` mechanism and no `environment.prod.ts` split. This is existing behavior, not something to silently replicate — flag it if asked to add new secrets rather than hardcoding another one into this file.

## Real-Time: Notifications & Chat

Both features share **one Socket.IO connection** owned by `shared/services/socket/socket.service.ts` (`io(Environment.serverUrl)`):

- **Chat** (per-event group): emits `chat:join` / `chat:leave` / `chat:message` / `chat:mark_read` / `chat:get_inbox`; listens on `chat:history` / `chat:message` / `chat:inbox` / `chat:unread_total` / `chat:error`. `components/chat/chat.component.ts` takes `@Input() eventId`, joins the room on init/change, and is embedded inside `components/events/event-details/`. `components/chat/inbox/` lists one entry per event conversation.
- **Notifications** (in-app): socket events `notifications` / `mark_all_read` / `mark_as_read`, surfaced through `shared/components/notification/notification.component.ts` (defines the 8-value `NotificationType` enum) and toast/badge logic in `components/common/header/header.component.ts`.
- **Push notifications** are a *separate* channel: Firebase Cloud Messaging via `shared/services/notification/notification.service.ts`, `assets/firebase-messaging-sw.js`, and `POST /register-fcm-token`. Don't conflate push (FCM) with in-app real-time (Socket.IO) — they're independently wired and can fail independently.

## Do's / Don'ts

- **Don't** add a fourth UI kit. Material, DaisyUI, and Flowbite already coexist; prefer matching whichever the file you're editing already uses rather than introducing a new one.
- **Don't** hardcode new hex colors into component SCSS. The active `create-event2` flow already drifted into ~4 near-identical purples and no shared elevation/radius scale — see `DESIGN_SYSTEM.md` (Phase 5) once written. Prefer the existing CSS-variable theme tokens (`styles/themes/`) where practical.
- **Don't** casually edit `components/events/create-event2/create-event/create-event.component.scss` — it's ~4000 lines of hand-rolled, mostly non-tokenized styling; small changes are easy to make inconsistent with the rest of the file.
- **Don't** touch `interceptor/auth/` or `shared/services/auth/` without asking first — the refresh-token queueing logic is easy to break in ways that only surface under concurrent-request race conditions.
- **Do** check whether you're editing the live component before changing it: `create-event2/` (not `create-event/`) is the active event-creation flow; `edit-profile/` is the active profile-edit flow. The non-"2" originals appear to be superseded but are still present in the tree.
- **Do** grep for actual field usage before trusting a type — most entities are `any` (see Coding Conventions above and `SPEC.md`).

## Guidance for Future Sessions

- Before modifying a component under `events/` or `user-profile/`, confirm which of the duplicate (`*2`) versions is actually routed in `app.routes.ts` — don't assume from folder name alone.
- Before adding a new shared service, check `shared/services/` for an existing one covering the same domain — several near-duplicate profile methods already exist between `AuthService` and `UserService` (`getMyProfile`/`getUserProfile` in both).
- No lint/format tooling is wired in yet; match existing file style manually until Phase 4 tooling (proposed separately) is installed with explicit approval.
- This file, `SPEC.md`, and `DESIGN_SYSTEM.md` are living documents generated from a point-in-time codebase read — re-verify against current code before relying on specifics (file paths, field names) for anything beyond a starting point.
