# Viblooop Web Functional Specification

## 1. Purpose and scope

Viblooop is a community-event web application for discovering, creating, joining, and discussing social experiences. This document specifies the behavior implemented by the Angular frontend in `web/` as of August 2026.

It is deliberately a frontend specification. API names identify the integrations the UI expects, but do not describe or guarantee backend behavior.

## 2. Product capabilities

The application enables a visitor or signed-in member to:

- discover events by category, featured vibe, date/cost filter, and proximity;
- view an event’s details, host, attendees, media, map, related events, reviews, and join state;
- request to join an event and, for hosts, accept or reject requests;
- create or edit an event through a guided four-step flow;
- maintain a profile, interests, photos, social links, and selfie-verification status;
- save events to a wishlist;
- exchange real-time messages with members of an event;
- receive in-app and browser push notifications;
- review eligible events; and
- use the site as an SSR-rendered PWA, including its Capacitor mobile wrapper.

## 3. User roles and access

| User state | Available behavior |
| --- | --- |
| Visitor | Browse the home page, event lists, event details, profiles, and login flow. |
| Authenticated member | Access notifications, chats, wishlist, protected profile-edit drawer, and event creation. |
| Profile-qualified member | Create an event only after the profile-score guard permits it. |
| Event host | Edit the host’s event, remove its gallery images, and act on its join requests. |

Authentication is cookie-session based. The client restores the signed-in user by calling `GET /auth/me` with credentials; it does not use browser-stored access tokens as the source of truth.

## 4. Navigation and route behavior

| Route | Screen / behavior | Access control |
| --- | --- | --- |
| `/` | Landing page and discovery entry points. | Public |
| `/events/:eventId` | Event details. | Public; actions are conditional on session/ownership. |
| `/eventCategories/:categoryId` | Events within a category. | Public |
| `/explore` | Expanded event discovery. | Public |
| `/profile` | Current member profile view. | Public route |
| `/profile/edit` | Full profile editor. | Unsaved-changes prompt on exit |
| `/profile/update` | Profile-setup form. | Public route |
| `/my-events` | Events created by the current user. | Public route; data depends on current user state |
| `/my-wishlist` | Saved events. | Authentication required |
| `/chats` | Event-chat inbox. | Authentication required |
| `/notifications` | Notification centre. | Authentication required |
| `/create-event` | Guided event create/edit experience. | Authentication and profile-score required; unsaved-changes prompt |
| `/login` | Email OTP and Google sign-in entry point. | Public |
| `/(drawer:edit-profile)` | Profile editor in the named drawer outlet. | Authentication and unsaved-changes protection |
| `/**` | Not-found page. | Public |

The `/admin` route is currently guarded but renders the login component rather than a distinct administration UI.

## 5. Functional requirements

### 5.1 Home and discovery

The home experience introduces the product and directs users into categories, events, and event creation. Shared event cards link to event detail pages and render event metadata defensively because API event fields may vary in shape.

The Explore screen provides:

- category loading and category selection;
- featured-vibe shortcuts for Social, Games, and Travel;
- quick filters for all events, tonight, this weekend, free events, and nearby events;
- a browser-geolocation prompt for the Nearby filter, followed by a nearby-events request using a 50 km radius;
- empty states and transient error/info messages; and
- a past-event presentation that includes attendance, ratings, photos, location, and host information when present.

The category listing screen requests events for the selected category. Event details also request related events and may open the physical location in Google Maps.

### 5.2 Authentication and session management

The login journey supports two sign-in methods:

1. Email OTP: request an OTP, submit it for verification, and create a user when the email does not yet have an account.
2. Google OAuth: redirect the browser to the authentication service and return to the frontend after the provider callback.

Authenticated requests include credentials. On a `401`, the HTTP interceptor attempts one refresh request and queues concurrent failures until it succeeds or fails. On refresh failure, the client clears session state and can redirect to login. Logout calls the remote logout endpoint and clears local in-memory user state.

### 5.3 Profile and identity

The profile experience displays profile imagery, banner, bio, location, pronouns, gender, social links, interests, verification state, statistics, and review summary where data is available.

The profile setup and edit flows support:

- profile photo and banner upload;
- up to 12 profile-gallery photos, including removal of retained photos;
- username, email, biography, location, date of birth, pronouns, and gender;
- interest selection with a UI limit/selection rules;
- validated social links across supported platforms; and
- save-state tracking and confirmation before discarding unsaved changes.

Selfie verification opens a camera-based capture flow, captures a selfie, submits it with the profile image, and refreshes the displayed verification state after success. If verification is unsuccessful, the flow must show a clear failure state and provide a **Retry** action that lets the member capture and submit a new selfie without leaving the verification experience.

The edit screen also exposes logout and a delete-account confirmation dialog. At present, confirmation does **not** issue a frontend account-deactivation request; it displays that the connection is unavailable.

### 5.4 Event lifecycle

#### Creating and editing events

`/create-event` is a four-step, client-validated wizard:

1. **Vibe** — choose an event category. The selected category determines the creation style: a standard Event, a Play session, or an Escape/trip. Categories marked “soon” are presentation options but do not define a separate submission flow.
2. **Essentials** — provide title, start date, location, capacity, and either a start time (Event/Play) or an end date (Escape). A location requires street, area, and PIN code; landmark is optional.
3. **Scene** — add a cover image, free/paid pricing, audience, expectations, host notes, and chat-access preferences.
4. **Review** — confirm the completed event before submission.

The form validates required values, prevents past date/time choices for new Event/Play submissions, requires an end date no earlier than the start date for Escapes, requires a positive price for paid events, and takes the user to the first invalid step on submit. It builds multipart `FormData`, serialising address and expectations as JSON. Cover-image handling supports an uploaded cover and a fallback default cover appropriate to the selected creation type.

**Capacity.** A host chooses either a limited capacity or an open capacity. Limited events accept a capacity between 2 and 250 attendees, with quick choices of 10, 20, 50, and 100. Open capacity is represented in the submitted form as `999999` and removes the limited-capacity validation.

**Audience preference.** The form records `audiencePreference` and `attendeeMix` with one of three choices:

| Choice | Submitted audience preference | Mix value | Intended UI meaning |
| --- | --- | ---: | --- |
| Open for all | `open` | `50` | Anyone may request to join. |
| Women-focused | `women` | `10` | A space intended to be mostly women. |
| Men-focused | `men` | `90` | A space intended to be mostly men. |

The frontend presents women- and men-focused choices as audience preferences; definitive join eligibility is an API policy decision and must be enforced by the server if required.

**Chat access preference.** The host chooses whether `hostOnlyChat` is enabled:

| Setting | Submitted value | Intended member experience |
| --- | --- | --- |
| Everyone can chat | `false` | Joined attendees can chat and coordinate together. |
| Host-only chat | `true` | Attendees can view host updates; only the host is intended to post. |

The wording adapts to the creation type: Event, Play, or Escape. This flag is included in the event payload. The current frontend specification treats it as a preference; message-permission enforcement must also exist in the chat API/socket layer for the restriction to be effective.

**Host notes and expectations.** Hosts can select expectation chips (Live DJ, Drinks, Games, Networking, Food, and Music) and add pre-written notes appropriate to the creation type, or write their own event description. Host notes are limited to 500 characters and can cover logistics such as arrival time, food, venue, travel plans, or post-acceptance location sharing.

#### Editing an event

The create-event feature becomes the edit-event flow when opened with `mode=edit` and an `eventId` (or through its edit drawer inputs). The client first loads the event, then hydrates category, title, dates/times, address, capacity mode, audience preference/mix, chat-access preference, safety fields, expectations, tags, pricing, description, and cover-image state.

The edit flow opens on the Essentials step, labels the screen **Edit Event**, and changes the final review step to **Review Changes**. It preserves the same category-specific date rules and field validation, while allowing an existing event date to be displayed/edited without the new-event date-picker minimum. The edit submission adds `eventId` to the multipart payload and calls the update endpoint. If no replacement cover is selected, it keeps the existing cover; if none is available, it supplies the default-cover fallback. The host can separately remove existing gallery images from the event details page.

Successful creation shows an event-created overlay with actions to view the new event or finish the flow. The edit flow saves changes without showing the creation overlay.

#### Event details

An event details page composes the following sections when data is available:

- hero imagery and title;
- description/about information;
- date, time, capacity, price, audience, and other facts;
- address and an interactive map/location panel;
- host profile card and profile modal;
- attendee list and host-only join-request drawer;
- image gallery, with host removal of gallery items;
- event reviews;
- nearby/related events; and
- the event chat card.

The host can open the event editor and delete gallery items. Join status is represented in a dedicated signal store so detail views can update action state after a request or host decision.

#### Joining

An authenticated member can request to join an event. The UI retrieves and displays the request status where available. A host can accept or reject a pending request from the event details/request UI; the client then refreshes the relevant event and join-request state.

`My Events` loads events created by the signed-in user. The UI also has support for displaying events the member has attended where supplied by the API.

### 5.5 Wishlist

Members can toggle an event’s saved state from applicable event UI. The wishlist page retrieves and renders saved events, and requires an authenticated session.

### 5.6 Reviews

The UI retrieves event reviews and presents reviewer name, image, date, and comment. **Only members recorded as attendees of an event may provide a review for that event.** An eligible attendee can submit a rating/comment payload and can remove their own review through a protected call. The API must enforce attendee eligibility and ownership; the UI should show review actions only when the current member is eligible.

### 5.7 Chat

Each event has one group chat. The embedded chat panel receives an event ID and joins/leaves its room as the displayed event changes. The inbox presents a conversation per accessible event, including last message, member count, and unread count.

Supported real-time operations are:

- register the current user on the shared socket connection;
- request an inbox;
- join or leave an event room;
- receive message history and live messages;
- send a non-empty message; and
- mark an event chat as read and update the aggregate unread count.

### 5.8 Notifications

In-app notifications are rendered in the header and notifications page. The header must show an unread **notification count** for unread in-app notifications and a separate unread **chat-message count** for messages across the member’s accessible event chats. The notification count is derived from the real-time notification collection; the chat count is the Socket.IO `chat:unread_total` and is also reflected as a per-conversation `unreadCount` in the chat inbox.

When a member opens/views the notification list, every unread notification that does not require an action is marked seen/read immediately and synchronised across the member’s active sessions. A pending **join request** is the exception: it remains unread/visible until the host accepts or rejects it, so the required action is not lost. Users can also mark an individual notification, selected notifications, or all notifications as read. The frontend recognizes these notification categories: join request, join request accepted, join request rejected, event reminder, event updated, event left, review, and system.

Browser push notifications use Firebase Cloud Messaging separately from the Socket.IO channel. On a supported browser, the app requests permission, registers `firebase-messaging-sw.js`, obtains an FCM token, sends it to the configured API, and shows foreground notifications when permission is granted.

## 6. Frontend API integration contract

All API calls use the runtime base URL in `src/environment.ts`; requests normally carry credentials. The frontend currently calls these endpoints:

| Area | Endpoints used by the web client |
| --- | --- |
| Authentication | `POST /auth/send-otp`, `/auth/verify-otp`, `/auth/create-user`, `/auth/login`, `/auth/refresh-access-token`; `GET /auth/me`; `DELETE /auth/logout`; `GET /auth/google` |
| Profile | `POST /updateProfile`, `/verifySelfieProfile`, `/getMyProfile`, `/getUserProfile`, `/getAttendeeDetails`; `GET /getAllInterests` |
| Events | `GET /getAllEvents`, `GET /categories`, `POST /getAllEventsByCategory`, `/getEventDetails`, `/createEvent`, `/updateEvent`, `/removeEventGalleryImage`, `/getJoinStatus`, `/requestJoinEvent`, `/acceptJoinRequest`, `/rejectJoinEventRequest`; `GET /events/nearby`, `/events/getRelatedEvents` |
| Location | `POST /getAddressFromPinCode`, `/getGeoLocation` |
| Wishlist | `POST /toggleWishlistEvent`; `GET /getWishlistedEvents` |
| Reviews | `POST /review/getEventReviews`, `/review/add`, `/review/delete` |
| Notifications | `POST /register-fcm-token` plus Socket.IO notification events |

Several views also use `HttpService.makeHttpCall` directly for legacy endpoints. API responses are generally consumed as `{ success, statusCode, message, data }`, but the frontend contains defensive handling for response-shape variations.

## 7. Client-side data expectations

The codebase has limited formal domain typing. The following fields are the principal values consumed by the UI.

| Entity | Primary frontend fields |
| --- | --- |
| Event | `_id`, `title`, `description`, `image`, `gallery`, `eventDate`, `endDate`, `eventTime`, `address`, `location`, `attendeeLimit`, `attendees`, `cost`, `price`, `tags`, `category`, `createdBy`, `averageRating`, `totalRatings`, audience fields |
| Address | `street`, `area`, `city`, `state`, `country`, `pinCode`, and optionally formatted/coordinate data |
| User | `id`/`_id`, `username`/`userName`, email, profile image/banner/photos, bio, location, demographics, interests, social links, verification, and rating fields |
| Chat message | `_id`, `eventId`, `senderId`, `senderName`, `senderImage`, `text`, `createdAt` |
| Notification | `_id`, `type`, `read`, `status`, sender fields, event fields, message, and creation time |

Consumers must tolerate current naming differences such as `username` versus `userName`, and category values represented as IDs, strings, or objects.

## 8. State, UI, and platform behavior

- Component/service state is primarily RxJS `Subject`/`BehaviorSubject`; join state is held by an `@ngrx/signals` store.
- A global loader interceptor and a message store support loading/error feedback, while many component errors are handled locally.
- The visual layer uses standalone Angular components with SCSS, Tailwind, DaisyUI, Flowbite, and Angular Material/CDK components already present in the project.
- SSR checks protect browser-only work such as geolocation, Socket.IO, Firebase, `localStorage`, camera, and service workers.
- The app is configured as a PWA and includes locale extraction/source XLF files for internationalisation.
- Capacitor configuration supports native iOS and Android builds.

## 9. Known frontend limitations

- Account deletion is not connected in the profile editor despite the confirmation UI.
- Some route-level screens that depend on user data (`/profile`, `/profile/update`, `/my-events`) are not guarded, so their UX depends on API/session handling.
- The domain model is mostly `any`; field-name and payload-shape inconsistencies are handled ad hoc.
- Some legacy/direct HTTP paths coexist with domain services, so API integration is not completely centralised.
- Notification and chat sockets share a single connection but push notifications are an independent FCM workflow; either channel can be unavailable without disabling the other.
- Event discovery’s nearby feature requires browser geolocation permission and gracefully resets the filter if permission or lookup fails.

## 10. Verification commands

Run from `viblooop.web/web`:

```bash
npm test
npm run build
```

For local development, use `npm start`; use `npm run serve:ssr:vibloop` after a production build to run the SSR output.
