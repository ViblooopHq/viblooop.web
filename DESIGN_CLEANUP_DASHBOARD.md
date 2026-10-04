# Viblooop Web Design Cleanup Dashboard

**Design direction:** Neon Pulse — deep-dark surfaces, ultraviolet actions, electric azure support, and magenta accents.

**Last updated:** 2026-08-03  
**Current phase:** Phase 6 — Guardrails and visual QA · **in progress**

## Delivery flow

```text
Phase 0  Align the design direction        [complete]
    ↓
Phase 1  Centralize global design tokens   [complete]
    ↓
Phase 2  Build shared UI primitives        [complete]
    ↓
Phase 3  Migrate the app shell             [complete]
    ↓
Phase 4  Migrate product journeys          [complete — scoped]
    ↓
Phase 5  Reduce stylesheet/framework debt  [in progress]
    ↓
Phase 6  Add enforcement and visual QA     [in progress]
```

## Phase status

| Phase | Status | Outcome | Validation |
| --- | --- | --- | --- |
| 0. Design direction | Complete | Neon Pulse direction selected; purple/azure/magenta semantic roles established. | Design plan approved. |
| 1. Global tokens | Complete | Centralized color, surface, type, spacing, radius, motion, focus, and status tokens; Tailwind bridge aligned. | `npm run lint:styles`, `npm run build` |
| 2. UI primitives | Complete | Added reusable button, surface, field, chip, and status recipes with shared interaction states. | `npm run lint:styles`, `npm run build` |
| 3. App shell | Complete | Header, footer, loader, drawer/modal, page canvas, and scroll-to-top migrated to shared semantic styles. | Build and style checks pass; visual QA continues in Phase 6. |
| 4. Product journeys | Complete — scoped | Authentication, Discovery (excluding deferred Home work), Event Engagement, Notifications, Profile, and Create Event have been migrated. | Targeted style checks and production build pass; visual QA continues in Phase 6. |
| 5. Style debt | Complete — scoped | Added shared action-row, stack, selectable-card, Material-field, field, and button foundations; migrated Create Event, Edit Profile, Notifications, Selfie Verification, Event Comments, Chat, Gallery, and Event Card repeated control recipes; aligned Angular Material system tokens; tokenized in-scope legacy palettes; removed broad transitions. | All non-deferred component stylesheets are raw-color free. Remaining raw-color stylesheets belong only to deferred Home and My Events work. |
| 6. Guardrails | In progress | Extend linting, add visual-review coverage, and document contribution rules. | Local targeted checks and production build pass; CI workflow is configured, while its first remote run and live visual review remain pending. |

## Completed work

### Phase 1 — Global tokens

- Added semantic action, accent, text, surface, ghost-border, status, spacing, radius, type, motion, and focus tokens.
- Made Tailwind consume the same semantic values.
- Set Inter as the application UI font and removed the global Poppins override.
- Kept legacy variables as compatibility aliases while screens are migrated.
- Added a shared keyboard-focus ring.
- Replaced the remaining direct brand-purple values caught by Stylelint in the event-detail feature.

**Primary files**

- `web/src/styles.scss`
- `web/src/app/components/events/event-details/_tokens.scss`
- `web/src/app/components/events/event-details/components/event-gallery-section/event-gallery-section.component.scss`

### Phase 2 — UI primitives

- Added global CSS classes and Sass mixins for consistent UI building blocks.
- Preserved the existing `.vl-btn` helper’s visual behavior to avoid unplanned screen changes.

| Primitive | Use |
| --- | --- |
| `.vl-button` | Primary, secondary, tertiary, destructive, and full-width actions. |
| `.vl-icon-button` | Circular icon-only actions. |
| `.vl-surface` | Standard, section, glass, and selectable surfaces. |
| `.vl-field` / `.vl-field-label` | Form controls and labels. |
| `.vl-chip` | Selectable chips and tags. |
| `.vl-status` | Success, warning, and error indicators. |

**Primary files**

- `web/src/styles/components/_primitives.scss`
- `web/src/styles/_index.scss`

## Next work: Phase 3 — App shell

- [x] Apply the shared surface and action primitives to the header.
- [x] Align footer typography, spacing, surfaces, and links.
- [x] Standardize global loader, drawer, modal, and overlay surfaces.
- [x] Establish app-wide page-canvas rules.
- [x] Update scroll-to-top styling and focus behavior.
- [ ] Verify logged-out/logged-in states at mobile and desktop widths in light and dark themes.

## Phase 4 — Product journey migration

**Progress:** `6 / 6 implementation tracks complete` · Home and My Events explicitly deferred

| Journey | Status | Included screens | What changed | Validation |
| --- | --- | --- | --- | --- |
| Authentication | **Complete** | Login, OTP verification | Shared surfaces, fields, buttons, icon buttons, and semantic tokens applied. | Stylelint and production build pass. |
| Discovery | **Complete — scoped** | Home, explore, event lists, event cards | Explore controls, event-list controls, shared event-card interactions, landing hero, category explorer, and CTA migrated. Home and My Events changes remain intentionally deferred by product direction. | Stylelint and production build pass. |
| Event engagement | **Complete** | Event detail, comments, gallery, chat, attendees | Event hero, about, facts, map, host, gallery, people drawer, comments/reviews, event chat, and chat inbox use semantic tokens; review typography and repeated menu actions use shared styles. | Targeted Stylelint and production build pass. |
| Profile | **Complete** | Profile, reviews, wishlist, setup, edit profile | Profile display, setup, verification, and Edit Profile are migrated. Edit Profile’s unused camera styles were removed, reducing it from 1,593 to 1,068 lines. | Targeted Stylelint and production build pass. |
| Event management | **Complete — scoped** | My events, create/edit event, event-created confirmation | Create Event header, shared recipes, Essentials, Vibe, Review, capacity, audience, chat access, pricing, expectations, safety, time picker, cover upload, and confirmation overlay are migrated. My Events remains intentionally deferred. | Targeted Stylelint and production build pass. |
| Notifications | **Complete** | Notification panel, toasts, unread/read states | Notification panel, action states, empty state, and shared toast use semantic tokens and centralized type classes. | Targeted Stylelint and production build pass. |

### Completed in Phase 4

- [x] Authentication
- [~] Event engagement — token migration complete for the event-details and chat surfaces; visual/state review remains.
- [~] Notifications — notification panel and shared toast migrated; visual/state review remains.
- [~] Profile — display, setup, standalone verification, and Edit Profile’s main form are migrated; duplicate camera styling removed, with final raw-color cleanup and visual review remaining.
- [~] Event management — Create Event shared shell and header migrated; My Events intentionally deferred.

### Deferred screens

- [ ] Home — intentionally deferred by product direction
- [ ] My Events — intentionally deferred by product direction

## Phase 5 — Style debt reduction

**Progress:** `consolidation milestone complete` · legacy compatibility cleanup remains intentionally staged

- [x] Add shared button, field, action-row, stack, selectable-card, and Material-field foundations.
- [x] Move Create Event shared fields/actions and selector cards onto the shared foundations.
- [x] Move repeated Edit Profile control foundations onto shared button/field/action layouts.
- [x] Remove broad `transition: all` declarations from Create Event.
- [x] Remove raw color values from the shared primitive layer.
- [x] Consolidate Create Event Material input foundations used by Essentials and Time Picker.
- [x] Replace the 49 legacy Create Event compatibility-token references with semantic action, text, and inverse-text tokens.
- [x] Reconcile Angular Material’s Azure prebuilt theme through global semantic system-token mappings for palette, surfaces, outlines, radii, and typography.
- [x] Record the stylesheet-size baseline and prioritize the next consolidation targets: Edit Profile (1,076 lines), Notifications (732), Explore Events (742), and Selfie Verification (610).
- [x] Replace Explore Events' raw hex/RGB/RGBA palette with shared semantic tokens and `color-mix()`.
- [x] Migrate Selfie Verification's repeated buttons and heading/body styles to shared primitives.
- [x] Migrate Event Comments' review headings, action controls, and menu controls to shared primitives.
- [x] Migrate Chat's icon actions, send action, and message field to shared primitives.
- [x] Migrate Gallery's dialog controls and headings to shared primitives.
- [x] Replace Event Card's profile-row hard-coded palette with shared semantic tokens and centralized its title class.
- [x] Replace Login's remaining raw overlay, divider, and action colors with shared semantic tokens; migrate its headings and supporting copy to shared typography classes.
- [x] Consolidate the selected high-volume stylesheets and record the final audit: 14,040 application SCSS lines remain; the 9 remaining raw-color stylesheets belong only to intentionally deferred Home and My Events; the only broad transition remaining is also in deferred My Events.
- [x] Replace Events List's legacy glass, glow, tag, and icon-control palette with semantic tokens.
- [x] Replace Past Event Card's raw overlay, success-badge, border, shadow, and inverse-text palette with semantic tokens.
- [x] Replace Footer and Form Drawer raw glow, hover, scrollbar, and handle colors with semantic tokens.
- [ ] Migrate the deferred Home and My Events stylesheets when product direction resumes work on those screens.

## Phase 6 — Guardrails and visual QA

**Progress:** `in progress`

### Automated guardrails

- [x] Detect raw hex and RGB/RGBA values in component styles with Stylelint warnings.
- [x] Validate changed stylesheets with targeted Stylelint and `git diff --check`.
- [x] Add `npm run verify:design` to run the full style and production-build verification locally.
- [x] Run the targeted guardrail baseline: shared primitives, Create Event shared/category styles, and Edit Profile pass Stylelint; production build passes.
- [x] Promote raw-color violations to errors for every in-scope stylesheet; warnings are restricted to intentionally deferred Home and My Events paths.
- [x] Add the style and production-build checks to CI with the `Design verification` GitHub Actions workflow.

### Visual-review checklist

- [ ] Check each migrated journey at mobile and desktop widths.
- [ ] Check light and dark themes for surfaces, text contrast, focus rings, buttons, fields, chips, dialogs, and overlays.
- [ ] Check empty, loading, error, disabled, hover, and selected states.
- [ ] Record screenshots or review evidence for Authentication, Event Engagement, Notifications, Profile, and Create Event.

### Screen-by-screen review matrix

| Journey | Route / entry point | Required states | Desktop | Mobile | Theme / evidence |
| --- | --- | --- | --- | --- | --- |
| Authentication | `/login` | default, invalid input, loading, OTP verification | Not started | Not started | Not started |
| Event engagement | `/events/:eventId` | active and ended event, attendee state, drawer/modal, review empty/populated | Not started | Not started | Not started |
| Notifications | `/notifications` (signed in) | unread/read, empty, loading, notification interaction | Not started | Not started | Not started |
| Profile | `/profile`, `/profile/edit` (signed in) | default, edit/save, validation, disabled controls, dialogs | Not started | Not started | Not started |
| Create Event | `/create-event` (signed in, completed profile) | each step, selected/unselected cards, validation, upload/loading, review/submit | Not started | Not started | Not started |

**Review protocol:** review at 1440 px and 390 px widths; capture light and dark theme evidence where both are supported. Do not mark a journey complete until its default, empty, loading, error/validation, disabled, hover, and selected states have been checked where applicable.

**Baseline recorded (2026-08-03):** targeted Stylelint, `git diff --check`, and `npm run build` pass. The build still reports the existing initial-bundle budget, unused `EventRelatedComponent`, and Socket.IO CommonJS warnings; these are tracked below and are not design-guardrail failures.

## Known technical follow-ups

- The production build exceeds the configured 500 kB initial-bundle budget.
- `EventRelatedComponent` is imported but unused by `EventDetailsComponent`.
- Socket.IO dependencies still cause CommonJS optimization warnings.
- Angular Material’s Azure prebuilt theme remains visually independent of the Neon Pulse palette and should be reconciled in Phase 5.

## Working agreement

- New component styles use semantic variables and the shared primitives; do not introduce raw brand colors.
- A new repeated radius, shadow, or visual recipe must be promoted to the shared layer before reuse.
- Each migrated journey is reviewed in light/dark themes and at mobile/desktop widths before its phase is marked complete.
- Update this dashboard whenever a phase or checklist item changes status.
