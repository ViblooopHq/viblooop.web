# DESIGN_SYSTEM.md

Design tokens extracted from the **create-event flow** — designated the reference/source-of-truth per instructions. Two implementations exist in the tree; this document treats the **active one, `create-event2`** (the 4-step creation wizard), as the target system, and calls out where the legacy `create-event` flow and the rest of the app deviate from it. This is documentation only — **no site-wide styling changes have been applied.**

## Source Files

- **Active reference**: `web/src/app/components/events/create-event2/create-event/create-event.component.scss` (~4,000 lines, hand-rolled SCSS, hardcoded values, no CSS custom properties)
- **Legacy (superseded, token-based)**: `web/src/app/components/events/create-event/create-event.component.scss` — Tailwind utilities + CSS variables from `web/src/styles/themes/_light-theme.scss` / `_dark-theme.scss`

## Color

The active flow uses **100 distinct hex values** with no shared variables — the table below lists the ones that recur often enough to read as intentional brand/semantic colors (frequency counted via grep across the file). Everything not listed is a one-off.

| Token (proposed name) | Value | Occurrences | Role |
|---|---|---|---|
| `--color-bg-base` | `#14121c` | 6 | Page/section background |
| `--color-bg-surface` | `#0f0d17` | 8 | Card/panel background (darker layer) |
| `--color-bg-elevated` | `#1c1a25` | 5 | Secondary elevated surface |
| `--color-bg-input` | `#2b2834` | 9 | Input/disabled-button fill |
| `--color-border-muted` | `#484456` | 7 | Subtle borders/dividers |
| `--color-text-primary` | `#e6e0ef` | 24 | Primary text on dark surfaces |
| `--color-text-secondary` | `#cac3d9` | 7 | Secondary text |
| `--color-text-muted` | `#938ea2` | 21 | Muted/placeholder text |
| `--color-text-faint` | `#aaa3b8` | 5 | Faintest tertiary text |
| `--color-brand-primary` | `#7d52ff` | 25 | Most-used brand purple (buttons, accents, active states) |
| `--color-brand-primary-alt` | `#6c3bff` | 22 | Near-duplicate brand purple, used almost interchangeably with the one above |
| `--color-brand-accent` | `#8b5cf6` | 9 | Third purple variant (focus rings, some CTAs) |
| `--color-brand-accent-2` | `#a855f7` | 5 | Fourth purple variant (gradients, badges) |
| `--color-brand-tint` | `#cbbeff` | 19 | Light purple tint (icons, secondary text on purple) |
| `--color-brand-tint-soft` | `#f4efff` | 12 | Lightest purple tint (badge backgrounds) |
| `--color-error-pink` | `#ff4d8d` | 7 | Error/audience-badge pink |

**Gap**: four near-identical purples (`#7d52ff`, `#6c3bff`, `#8b5cf6`, `#a855f7`) are used without a clear rule for which applies where — they should consolidate to one `--color-brand-primary` plus maybe one `--color-brand-accent` for gradients. Common gradients seen: `linear-gradient(135deg, #a855f7, #6d28d9)` and `linear-gradient(135deg, #6c3bff, #8e66ff)` — two different gradient definitions for what reads as the same "primary CTA" gradient.

Legacy `create-event` (light/dark theme variables, for comparison):
| Token | Light | Dark |
|---|---|---|
| `--bg-surface` | `#ffffff` | `#1e293b` |
| `--btn-primary-bg` | `#2563eb` (blue) | `#3b82f6` |
| `--text-heading` | `#111827` | `#f8fafc` |
| `--border-default` | `#e5e7eb` | `#334155` |

The legacy flow's brand color is **blue** (`#2563eb`/`#3b82f6`); the active flow's is **purple**. These are two entirely different brand palettes coexisting in the same app.

## Typography

- **Headings/labels**: `'Spline Sans', sans-serif` — used for step titles, card titles, section headers
- **Body/inputs**: `'Plus Jakarta Sans', sans-serif` — the component root font
- Legacy `create-event` sets no explicit `font-family` (inherits the global stylesheet) — another point of drift, since it's unclear if the global default is Spline Sans/Plus Jakarta Sans or something else.

**Size scale observed** (px and rem mixed, not normalized): `10px, 11px, 12px, 13px, 14px, 16px, 18px, 22px, 24px, 26px, 36px, 44px` and `0.78rem, 0.88rem, 0.9rem, 1rem, 1.2rem, 1.35rem`. No single documented scale — reads roughly like a 2px-step system below 20px and ad hoc above it.

**Weight scale**: `400` (body/input text), `500` (labels), `600` (subtitles/card titles), `700` (emphasized labels), `800` (card titles, small badges), `900` (step titles, header labels) — this part is fairly consistent and could become a formal `font-weight` scale as-is.

**Line-height**: set as fixed px values throughout rather than unitless ratios — not extracted as a scale here since values weren't consistently tied to a given font-size.

## Spacing

No spacing scale or variables exist. Padding/gap/margin values found are ad hoc pixel numbers, loosely clustering around a 2px step: `4, 6, 8, 10, 12, 14, 16, 18, 20, 24px` are the most common. Recommend formalizing an 4px-based scale (`4/8/12/16/20/24/32`) if/when this flow is refactored — legacy `create-event` already effectively uses Tailwind's 0.25rem (4px) scale via utility classes, so aligning the two would also close this gap.

## Border Radius

**18 distinct values** in the active flow, falling into two families:

- **Pill/circle shapes** — inconsistently expressed three different ways for what is likely the same "fully rounded" intent: `50%` (circular avatars/icons), `99px`, `999px`, and `9999px` (all used as "pill" on different buttons/badges — pick one).
- **Card/box corners** — `4px, 6px, 8px, 10px, 11px, 12px, 14px, 15px, 16px, 18px, 20px, 22px, 24px, 28px, 32px` — almost every card size has its own radius. A reasonable consolidated scale would be `--radius-sm: 8px`, `--radius-md: 12px`, `--radius-lg: 16px`, `--radius-xl: 24px`, `--radius-pill: 999px`, `--radius-full: 50%`.

Legacy `create-event` uses Tailwind's `rounded-lg`/`rounded-xl`/`rounded-full` — a much smaller, already-reasonable set.

## Shadows / Elevation

**53 `box-shadow` declarations**, virtually all bespoke — no shared elevation scale. They fall into three informal categories:
- **Brand glow** — purple-tinted, e.g. `0 0 18px rgba(124, 58, 237, .3)`, `0 0 0 1px rgba(124, 60, 255, .45), 0 14px 34px rgba(108, 59, 255, .22)` — used on selected/active cards and primary buttons
- **Drop shadow** — neutral black, e.g. `0 10px 26px rgba(0,0,0,.22)`, `0 12px 32px rgba(0,0,0,.22)`, `0 10px 40px rgba(0,0,0,.5)` — used for cards/overlays, roughly 3-4 depth tiers by blur/opacity
- **Inset highlight rim** — `inset 0 1px 0 rgba(255,255,255,.03-.04)` — a top-edge highlight repeated near-identically ~8 times, a good candidate to become one shared mixin/token

Legacy `create-event`'s theme file defines a `--card-shadow` custom property, but **declares it four times in the same selector** (`0 1px 2px`, `0 4px 6px`, `0 10px 15px`, `0 20px 25px` at increasing opacity) — only the last wins under normal CSS cascade rules, so the first three are dead code. This looks like an attempt at an elevation scale (sm/md/lg/xl) that was never split into separate variable names — worth fixing as `--shadow-sm/md/lg/xl` rather than one repeated `--card-shadow`.

## Button Variants (active flow)

| Variant | Style |
|---|---|
| **Primary** (`.btn-next`, `.btn-launch-event`) | Purple gradient background, white text, brand-glow shadow; `:disabled` → flat `#2b2834`, opacity 0.4–0.5, shadow removed |
| **Secondary** (`.btn-edit-details`, `.btn-edit`) | Dark surface background, subtle `--color-border-muted` border, muted text, no shadow |
| **Selectable cards** (not classic buttons) | `.vibe-card--selected`, `.capacity-card--selected`, `.chat-access-option--selected`, `.pricing-card-new--selected`, `.preference-card--active` — each defines its own selected-state border/background/shadow independently rather than sharing one "selected" state mixin |

Legacy `create-event` has one button style: Tailwind `bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg`.

## Gap List — Where the Rest of the App Deviates

- **Two full design systems coexist**: legacy `create-event` (blue brand, CSS-variable tokens, Tailwind utilities) vs. active `create-event2` (purple brand, hardcoded hex, hand-rolled SCSS). They are not visually or structurally reconciled.
- **`rounded-*` Tailwind classes appear 69× across 14 other files** in the app (header, profile, event-card, stepper, etc.) — meaning most of the app still runs on the Tailwind/utility approach that `create-event2` abandoned. Any radius consolidation should either bring `create-event2` back toward Tailwind classes, or formalize its px scale into SCSS variables/Tailwind theme tokens that the rest of the app also adopts — not leave two systems in parallel.
- **`shadow-*`/`box-shadow` appears 229× across 48 files repo-wide** — `create-event2` alone contributes 53 of those, each unique. There is no shared elevation scale anywhere in the codebase, not just in this flow.
- **Brand color ambiguity**: which is the "real" brand color — the legacy blue (`#2563eb`) or the active purple (`#7d52ff`/`#6c3bff`)? Given `create-event2` is the live flow and the purple palette also appears in `event-details`, `event-card`, `notification`, `event-created-overlay`, `gallery`, `explore-events`, `user-profile`, `edit-profile2`, `selfie-verification`, `reviews`, and `login`, purple looks like the intended direction — the blue tokens in `_light-theme.scss`/`_dark-theme.scss` read as stale.

## Recommended Next Step (not executed here)

If/when a rollout is approved: consolidate the purple family to 2 tokens (primary + accent), pick one pill-radius convention, split `--card-shadow` into a real `sm/md/lg/xl` elevation scale, and migrate `create-event`'s theme-variable approach forward as the single source of truth rather than starting a third system from scratch.
