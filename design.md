```markdown

# Design System: High-Energy Kinetic Depth

 

This document outlines the visual language and structural logic for the digital experience. This design system is engineered to move away from the static "template" look of modern apps, favoring a high-end, editorial approach that captures the electricity of sports, the soul of travel, and the pulse of nightlife.

 

---

 

## 1. Overview & Creative North Star: "The Neon Pulse"

 

The Creative North Star for this system is **The Neon Pulse**. We are not building a static interface; we are building a living environment. The design leverages "Deep Dark" space—utilizing the `surface` (#070d1f) not as a flat background, but as a vast, nocturnal canvas. 

 

By breaking the grid with intentional asymmetry, overlapping glass containers, and high-energy radial gradients, we create a sense of motion. We avoid "standard" boxed layouts in favor of **Kinetic Layering**, where content feels like it is floating in a rich, multi-dimensional atmosphere.

 

---

 

## 2. Colors & Atmospheric Depth

 

This system rejects the "flat" web. We use color to simulate light sources within a dark space.

 

### The Palette

- **Primary (`#bd9dff`):** The "Ultraviolet" lead. Use for high-energy actions and focal points.

- **Secondary (`#34b5fa`):** The "Electric Azure." Complements the primary to create depth in gradients.

- **Tertiary (`#ff86c3`):** The "Hot Magenta." Reserved for alerts, highlights, and "Live" indicators.

 

### The "No-Line" Rule

**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Structural boundaries must be defined solely through background color shifts. For instance, a `surface-container-low` section should sit on a `surface` background to create a soft, natural break. Let the tonal shift do the work, not a stroke.

 

### The "Glass & Gradient" Rule

To achieve a premium feel, use **Glassmorphism** for all floating elements (modals, navigation bars, and featured cards). 

- **Recipe:** `surface` at 10% opacity + `backdrop-blur-md` + a `Ghost Border`.

- **Signature Textures:** Apply a radial gradient (transitioning from `primary` to `primary-dim`) behind glass layers to simulate "soul" and light bleeding through the frosted surface.

 

---

 

## 3. Typography: The Inter Hierarchy

 

We use **Inter** for its neutral, architectural precision, allowing the vibrant colors and glass effects to take center stage.

 

- **Display (L/M/S):** Large, bold statements for event titles and hero headers. Use `display-lg` (3.5rem) to dominate the viewport and create an editorial "magazine" feel.

- **Headlines:** Used for section titles. These should feel authoritative and grounded.

- **Titles & Body:** `body-lg` is your workhorse. Ensure ample line-height (1.5x) to maintain readability against the deep dark background.

- **Label-sm:** Use for metadata (dates, locations). Always uppercase with slight letter-spacing (0.05em) to differentiate from body text.

 

---

 

## 4. Elevation & Depth: Tonal Layering

 

Traditional drop shadows are too heavy for this aesthetic. We achieve hierarchy through the **Layering Principle**.

 

### Surface Hierarchy

Stack your containers to guide the eye:

1.  **Base:** `surface` (#070d1f)

2.  **Sectioning:** `surface-container-low` (#0c1326)

3.  **Cards:** `surface-container-highest` (#1c253e)

 

### Ambient Shadows & Ghost Borders

- **Ambient Shadows:** When an element must "float" (e.g., a primary CTA), use an extra-diffused shadow. Color: `on-surface` at 6% opacity. Blur: 30px-50px.

- **The Ghost Border:** If a boundary is strictly required for accessibility, use the `outline-variant` token at **15% opacity**. This creates a "shimmer" edge rather than a hard line, mimicking the edge of a glass pane.

 

---

 

## 5. Components

 

### Buttons

- **Primary:** A vibrant gradient of `primary` to `primary-dim`. No border. High-energy.

- **Secondary (Glass):** `surface-white/10` with `backdrop-blur`. This allows the background colors to peek through.

- **Tertiary:** Purely typographic using the `primary` color token.

 

### Interactive Chips

- Use `xl` (1.5rem) or `full` (9999px) roundedness. 

- **Inactive:** `surface-container-high`.

- **Active:** `secondary` background with `on-secondary` text.

 

### Cards & Lists

- **The Divider Ban:** Never use lines to separate list items. Use vertical white space (`spacing-md`) or a 2% shift in the background color of alternating items.

- **Event Cards:** Should use the "Glassmorphism" recipe. Overlap the event image with the glass container slightly to break the "boxed" feel.

 

### Input Fields

- Avoid boxes. Use a `surface-container-lowest` background with a `Ghost Border` only on the bottom edge to create a sophisticated, minimal input feel.

 

---

 

## 6. Do’s and Don’ts

 

### Do:

- **Do** use `primary` radial gradients in the corners of the screen to give the "Deep Dark" theme a sense of light.

- **Do** lean into asymmetry. A card that is slightly offset or a header that hangs over a container adds a custom, high-end feel.

- **Do** prioritize the `surface-container` hierarchy to define the app’s skeleton.

 

### Don’t:

- **Don't** use pure white (#FFFFFF) for text. Use `on-background` (#dfe4fe) to reduce eye strain and maintain the atmospheric mood.

- **Don't** use 100% opaque borders. It kills the "Glassmorphism" effect and makes the UI look dated and "heavy."

- **Don't** clutter. In a high-energy system, white space (or "dark space") is your most valuable asset. If a screen feels busy, increase the spacing between tiers.

 

---

 

## 7. Signature Element: The "Vibloooop" Glow

Whenever a user interacts with a high-energy action (e.g., "Join Party" or "Book Trip"), implement a momentary glow using the `tertiary` (#ff86c3) color. This creates a "tactile" feedback loop that feels as electric as the events the app facilitates.```