# SPEC.md

Functional specification derived from reading the frontend code (`web/src/app/`). This repo has **no backend**, so almost every entity below has no formal TypeScript type — fields are *inferred from how components and services use them*, not from a schema. Treat every field list as a starting point to verify against the actual API contract, not a guarantee.

## Core Entities (inferred)

### Event
No formal interface exists. Fields observed in use across `components/events/event-details/`, `components/events/event-card*`, `shared/services/events/events.service.ts`:
- `_id` — identifier
- `title`
- `eventDate`, `eventTime`, `endDate`
- `address { area, pinCode }`, `location`, `city`
- `category { title | name }` — category is sometimes a string, sometimes an object; inconsistent shape
- `tags` — array, drawn from `EventsService.eventTags` (client-side fixed list)
- `attendeeLimit`
- `attendees[]` / `participants[]` — both names seen; not reconciled
- `attendeeMix`, `audiencePreference` — gender/audience targeting fields used in `create-event2`
- `createdBy { username | userName | name }` — inconsistent field naming across usages
- `coverImage`, gallery images (see `removeEventGalleryImage` in `events.service.ts`)

### Category
No dedicated entity/model — represented two ways:
- A client-side fixed list, `EventsService.categoryList` (`Social`, `Travel Companion`, `Sports Activities`, `Local Events`, `Shopping Buddies`), fetched from `GET {apiBaseUrl}/categories` at runtime via `EventsService.getEventCategories()`
- A UI-only richer shape, `CategoryDisplayConfig` (`components/events/create-event2/create-event/create-event.config.ts`): `matches: string[]`, `title`, `description`, `materialIcon`, `accent: 'purple'|'green'|'blue'|'orange'|'pink'`, `kind?`, `soon?` — this is presentation config for the creation wizard, not a persisted entity.

### User
No formal interface. Fields observed across `shared/services/user/user.service.ts`, `shared/services/auth/auth.service.ts`, `components/user-profile/edit-profile2/`:
- `id`, `username` / `userName` (inconsistent)
- `profileImage`, `profilePhotos[]` (up to 12), `bio`, `dob`, `gender`, `location`
- `interests[]` (from `GET {apiBaseUrl}/getAllInterests`), `socialLinks[]`
- `wishlist[]` (toggled via a method duplicated in both `AuthService` and `UserService`)
- `verified` / `isVerified` (selfie verification flag, set via `POST {apiBaseUrl}/verifySelfieProfile`)

### ChatGroup (per-event chat room)
No separate persisted model — implicitly one room per `eventId`. Inbox entries (from `SocketService.inbox$`): `{ eventId, lastMessage, unreadCount }`. Individual messages have an explicit interface, `ChatMessage` (`components/chat/chat.component.ts`):
```
_id?, eventId, senderId, senderName, senderImage, text, createdAt
```

### Notification
No formal interface — accessed ad hoc as `_id, type, read, status, senderId/sender, eventId/event, message, senderImage`. The one formal piece is the `NotificationType` enum (`shared/components/notification/notification.component.ts`):
```
JOIN_REQUEST, JOIN_REQUEST_ACCEPTED, JOIN_REQUEST_REJECTED,
EVENT_REMINDER, EVENT_UPDATED, EVENT_LEFT, REVIEW, SYSTEM
```

The only other explicit interface in the codebase is `AttendeesProfile` (`components/events/event-details/event-details.component.ts`): `profileImage, userId, userName`. Everything else (`ResponseFormat.ts` in `shared/interfaces/`) is a generic API-response wrapper, not a domain entity.

## Feature List (as implemented)

- **Event creation** — two parallel implementations exist: `components/events/create-event/` (legacy, single-page Tailwind form) and `components/events/create-event2/create-event/` (active, 4-step wizard: category → details → media/pricing → review). Both call `EventsService.createEvent()` → `POST {apiBaseUrl}/createEvent`. Update goes through `EventsService.updateEvent()` → `POST {apiBaseUrl}/updateEvent`.
- **Browsing/discovery** — `components/events/explore-events/` (with `explore-by-vibe`, `just-for-you`, `trending-nearby` sub-features), backed by `EventsService.getAllEvents()`, `getEventsByCategory()`, `getNearbyEvents()`, `getRelatedNearbyEvents()`.
- **Joining a event** — `event-details.component.ts` calls `POST {apiBaseUrl}/requestJoinEvent` directly via the raw `HttpService` (not through `EventsService`, unlike every other event API call — an inconsistency worth normalizing later). Join status is tracked client-side via `EventJoinStatusStore` (`shared/services/events/event-join-status.store.ts`) and fetched via `EventsService.getJoinStatus()`.
- **Join-request accept/reject** — event creator accepts/rejects from the notification panel or event-details page: `POST {apiBaseUrl}/acceptJoinRequest`, `POST {apiBaseUrl}/rejectJoinEventRequest`, both called inline from `event-details.component.ts`.
- **Notifications** — real-time via Socket.IO (`notifications`, `mark_all_read`, `mark_as_read` events) plus push via Firebase Cloud Messaging (`POST {apiBaseUrl}/register-fcm-token`). Displayed via `shared/components/notification/` and the header badge/toast (`components/common/header/`).
- **Chat** — pure Socket.IO per-event room (`chat:join/leave/message/mark_read/get_inbox`), embedded in `event-details`, with a separate inbox view (`components/chat/inbox/`).
- **Profile CRUD** — Create: implicit at signup (`AuthService.createUser`). Read: `UserService.getMyProfile()` / `getUserProfile(userId)` (both duplicated in `AuthService`). Update: `UserService.updateUserProfile()` (multipart form, `POST {apiBaseUrl}/updateProfile`). **Delete: not implemented** — see Known Gaps below.
- **Auth — OTP**: `AuthService.sendOTP()` / `verifyOTP()` / `createUser()` / `login()`, UI in `components/auth/login/` + `components/auth/otp-verification/`.
- **Auth — Google OAuth**: `AuthService.googleLogin()` redirects to `{authBaseUrl}/auth/google`; session returns as an httpOnly cookie, hydrated via `AuthService.initAuth()` (`GET /me`).

## Known Edge Cases / Gaps (factual, code-observed)

- **No TODO/FIXME comments exist anywhere in `web/src`** (re-confirmed by grep) — gaps below were found by reading behavior, not by comment markers.
- **Delete account is unimplemented**: `edit-profile2.component.ts` → `confirmDeleteAccount()` closes the confirmation dialog and shows `alert('Delete account is not connected yet.')` — no API call is made. There is no delete-account endpoint anywhere in `UserService` or `AuthService`.
- **Duplicate event-creation flows**: `create-event/` (legacy) and `create-event2/create-event/` (active 4-step wizard) both exist in the tree; routing determines which is live — verify in `app.routes.ts` before editing either.
- **Duplicate profile-edit flow**: `edit-profile2/` exists alongside an implied original edit-profile component.
- **Inconsistent join-request API placement**: `requestJoinEvent`, `acceptJoinRequest`, and `rejectJoinEventRequest` are called directly via the raw `HttpService` from within `event-details.component.ts`, while every other event API call goes through `EventsService`. A future refactor should probably move these into `EventsService` for consistency.
- **Duplicated profile-fetch methods**: `getMyProfile()` and `getUserProfile()` exist in both `AuthService` and `UserService` with the same signatures — unclear which is canonical.
- **Two mapping libraries** present as dependencies (`mapbox-gl` and `@angular/google-maps`) — only one is likely used in the actual location-picker/map rendering; worth confirming before adding new map-related code.
- **Inconsistent field naming** across the loosely-typed Event/User objects: `attendees` vs `participants`, `username` vs `userName` vs `name`, `category` as string vs object — callers must defensively check both forms rather than trusting one.
- **Category is not a first-class typed entity** — it's either a plain string (`EventsService.categoryList`) or a UI-only display-config object (`CategoryDisplayConfig`), with no shared backing type between the two.
