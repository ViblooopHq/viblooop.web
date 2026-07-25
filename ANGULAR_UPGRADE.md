# ANGULAR_UPGRADE.md

Plan for upgrading Viblooop web from Angular 20.3 to Angular 22. **This document is a roadmap only** — no `ng update`, `npm install`, or code changes have been made yet. It's meant to be executed as a separate, explicitly-approved pass (likely across multiple sessions given the scope).

## 1. Overview

**Current state**: Angular 20.3, 100% standalone components (zero `@NgModule`), zone.js-based change detection, decorator-based `@Input()`/`@Output()` component I/O (70 occurrences across 23 files), classic Reactive Forms (37 occurrences across 15 files), Karma/Jasmine test runner (76 spec files).

**Target state**: Angular 22, zoneless change detection, signal-based component I/O (`input()`/`output()`/`model()`), Signal Forms (stable as of v22), Vitest test runner.

**Why both tracks**: Angular 22's headline change — Signal Forms going from experimental to stable — is the whole reason for this upgrade ("completely supports signal for everything"). A version bump alone doesn't get you that; the app's forms and component I/O need to actually be migrated to the signal-based APIs to benefit. So this plan covers the mechanical version bump (Hops 1 and 2) and a separate modernization track that uses the newly-stable APIs.

## 2. Non-Negotiable Sequencing

Angular's own guidance: **never skip a major version**. Migrate one hop at a time — 20 → 21 → 22 — with a full build/test/smoke-test pass between hops before moving on. Do not combine hops even though the gap is only two majors; v21 alone changes the default test runner and offers zoneless, which are easier to isolate one at a time.

## 3. Hop 1 — Angular 20 → 21 (mechanical)

- Run `ng update @angular/core@21 @angular/cli@21`, and in the same pass update the Angular-adjacent packages to their v21-compatible releases (`@angular/material`, `@angular/cdk`, `@angular/fire`, `@ngrx/signals`, `@capacitor/angular`) — check actual available versions at execution time since they'll have moved on by then.
- **Explicitly bump `@angular/google-maps`.** It's currently pinned `^19.2.19` while everything else is `^20.3.x` — already a major behind. `ng update` may not catch it automatically since it's not always covered by the core schematic; verify manually. (A `22.0.4` release already exists on npm as of this writing, so the peer-dependency chain isn't actually blocked — it just needs deliberate attention so it isn't silently skipped.)
- Run the Angular CLI's control-flow migration schematic for the 4 files still on legacy syntax: `empty-state.component.html`, `intrest.component.html`, `explore-events.component.html`, `create-event2/create-event.component.html` (15 total `*ngIf`/`*ngFor`/`*ngSwitch` occurrences vs. 241 modern `@if`/`@for`/`@switch` elsewhere — small, low-risk cleanup).
- **Karma → Vitest**: Angular 21 replaces Karma with Vitest as the default test runner, with migration tooling available. This repo has 76 `*.spec.ts` files (Jasmine-style) — run the migration tool, then spot-check a representative sample (not all 76) for API differences Jasmine→Vitest didn't auto-convert. Update `angular.json`'s test builder and the `npm test` script accordingly.
- **Do not enable zoneless at this hop.** Angular 21 only defaults zoneless for brand-new apps generated via `ng new`; existing apps keep `zone.js` until explicitly opted out. Stay on zone.js here — just confirm the app still builds, serves, and tests green after the version bump.
- Grep for any usage of APIs deprecated since Angular 19 that v21 may have removed, per the release notes — none identified yet from static analysis, but worth a final check once the update tool has run (it will typically flag these directly).

## 4. Hop 2 — Angular 21 → 22 (mechanical)

- Run `ng update @angular/core@22 @angular/cli@22` + the same dependency sweep as Hop 1 (versions will have moved again).
- **TypeScript 6 required.** Repo is currently on `~5.9.3` — bump `typescript` and re-run a full `ng build` to catch any TS6-only type errors (stricter inference in some areas is common in major TS bumps).
- **OnPush becomes the default change detection strategy in Angular 22.** Nothing in this app currently sets `changeDetection: ChangeDetectionStrategy.Default` explicitly, so most components will silently start behaving as OnPush. Audit for components that mutate component state imperatively outside of signals/observables and expect the template to just re-render — these will stop updating. Prioritize auditing the 23 files that use decorator `@Input()`/`@Output()` first, since imperative mutation patterns are most likely to hide there; components already built around `signal()`/RxJS `async` pipe are safe by construction.
- **Route param inheritance strategy defaults to `'always'`** (previously `'emptyOnly'`). Audit nested routes in `app.routes.ts` for any logic that assumed a child route wouldn't inherit a parent's route params.
- Confirm `web/src/server.ts`'s existing `@angular/ssr`/`CommonEngine` usage needs no changes — it's already on the current SSR package (not the old `@nguniversal/express-engine`), so this is a checkpoint, not expected work.
- Legacy (non-MDC) Angular Material components are fully removed in v22. This repo's `@angular/material ^20.2.14` install already post-dates the MDC migration, so this is low risk — but spot-check any custom SCSS overrides that target Material's internal DOM/class names, since those are the kind of thing that silently breaks without a build error.

## 5. Modernization Track (signals-first)

Recommended to start **after** Hop 2 is stable and verified, rather than interleaved with the version bumps — keeps "did the upgrade break something" separate from "did the refactor break something" when debugging.

- **Signal-based component I/O**: convert the 70 decorator `@Input()`/`@Output()` usages across these 23 files to `input()`/`output()`/`model()`: (list to be finalized against actual `grep` output at execution time — known from analysis: `event-details`, `message.service`, `login`, `shared.service`, `scroll-to-top`, `inbox`, `otp-verification` already partially use signals; the other ~16 files identified as decorator-only need auditing). Do this file-by-file, not as a mass codemod — `SPEC.md` documents that most props on these components are `any`-typed, so blind automated conversion risks silently widening or narrowing types incorrectly.
- **Signal Forms**: migrate the 37 Reactive-Forms usages across `login`, `otp-verification`, `create-event`, `create-event2`, `edit-profile2`, `profile-setup`, `event-comments`, `chat`. Start with the smallest/lowest-risk forms (`login`, `otp-verification`) to validate the pattern before touching `create-event2`'s form — that's the active event-creation wizard, backed by ~4000 lines of SCSS and the most complex form surface in the app, so it should be the last and most carefully tested migration, not the first.
- **Zoneless change detection**: once the OnPush audit from Hop 2 is clean, opt in via `provideZonelessChangeDetection()` in `app.config.ts` (replacing the current `provideZoneChangeDetection({ eventCoalescing: true })` at `web/src/app/app.config.ts:24`), then remove `zone.js` from `angular.json`'s build/test polyfills and from `package.json`. Explicitly retest the 7 files already using manual `signal()`/`effect()` and the 7 RxJS-Subject-based services (`auth`, `socket`, `loader`, `drawer`, `popup`, `interceptor`, `location-picker`) — both patterns are zoneless-compatible by design, but should be verified rather than assumed given how much of the app's real-time behavior (chat, notifications) runs through those services.
- **RxJS-Subject-to-signal conversion in services** — lowest priority, optional. RxJS subjects remain fully supported under zoneless; only worth converting where it measurably simplifies a specific component's consumption code, not as a blanket rule.

## 6. Risk Register

| Risk | Area | Notes |
|---|---|---|
| `@angular/google-maps` peer-dependency drift | Hop 1/2 | Already 1 major behind; must be bumped deliberately, not assumed to follow `ng update` automatically |
| OnPush-by-default breaking silent-mutation components | Hop 2 | No components currently set CD strategy explicitly; audit the 23 decorator-I/O files first |
| Karma → Vitest conversion | Hop 1 | 76 spec files; migration tooling exists but needs a real test run, not just a clean build, to confirm |
| TypeScript 6 bump | Hop 2 | Straightforward for most code, but any stricter-inference fallout only surfaces at `ng build` time |
| `create-event2` Signal Forms migration | Modernization | Largest, highest-risk single form in the app — do last, after the pattern is proven elsewhere |
| Zoneless flip masking real bugs as "it still works" | Modernization | Needs explicit smoke-testing of chat/notifications (socket-driven), not just "app loads" |

## 7. Verification Strategy Per Hop

- `ng build` (both browser and server targets) and `ng test` (or Vitest run post-Hop-1) must pass cleanly.
- Manual smoke test of: OTP + Google auth flow, per-event chat, real-time notifications, and specifically the `create-event2` wizard (largest/riskiest UI surface in the app).
- Confirm SSR still renders (`npm run serve:ssr:vibloop`).
- Confirm the Capacitor native build isn't broken by the `@capacitor/angular` version bump.
- Do not proceed to the next hop or the modernization track until the current hop is fully green.

## 8. Explicit Non-Goals of This Document

No commands have been run. `package.json` has not been touched. No component, form, or service code has been changed. This is a roadmap for a future execution pass — expect it to span multiple sessions given the two mechanical hops plus the modernization track, and expect it to be re-verified against the actual codebase state at execution time rather than assumed from this snapshot.
