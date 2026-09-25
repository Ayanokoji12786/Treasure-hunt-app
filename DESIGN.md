---
version: alpha
name: Luma — Waypoint System
description: Design system for Luma, a location-based treasure-hunt app. Guides an interface that reads as an expedition instrument — Google Maps × Indiana Jones × a premium travel app — for solo explorers moving through real cities at night and in daylight.

colors:
  primary: "#6BB8FF"
  primary-strong: "#4A97DB"
  secondary: "#54B889"
  tertiary: "#C99A45"
  tertiary-soft: "#E7C879"
  neutral: "#8D949E"
  canvas: "#07090C"
  surface: "#0D1117"
  raised: "#131922"
  on-surface: "#F5F5F3"
  border: "#242932"
  error: "#E2604A"

typography:
  display-serif:
    fontFamily: "Instrument Serif"
    fontSize: 72px
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: -0.01em
  display-caps:
    fontFamily: "Geist Sans"
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: "Geist Sans"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.015em
  headline-md:
    fontFamily: "Geist Sans"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em
  title-sm:
    fontFamily: "Geist Sans"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0em
  body-md:
    fontFamily: "Geist Sans"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0em
  body-sm:
    fontFamily: "Geist Sans"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0em
  label-caps:
    fontFamily: "Geist Sans"
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0.12em
  coordinate-mono:
    fontFamily: "IBM Plex Mono"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.02em
  stat-numeral:
    fontFamily: "IBM Plex Mono"
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: -0.01em

rounded:
  none: 0px
  sm: 10px
  md: 18px
  lg: 28px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
  2xl: 96px

components:
  page:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
  hero-panel:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.on-surface}"
    padding: "{spacing.2xl}"
  navbar:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-caps}"
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.canvas}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.full}"
    padding: "{spacing.md}"
  button-primary-hover:
    backgroundColor: "{colors.primary-strong}"
    textColor: "{colors.canvas}"
  button-treasure:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.canvas}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.full}"
    padding: "{spacing.md}"
  button-treasure-hover:
    backgroundColor: "{colors.tertiary-soft}"
    textColor: "{colors.canvas}"
  button-secondary:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.full}"
    padding: "{spacing.md}"
  button-ghost-link:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-caps}"
  input:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
  input-error:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.error}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
  hunt-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.title-sm}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  badge-difficulty:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs}"
  hud-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.coordinate-mono}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  hud-distance-critical:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.tertiary}"
    typography: "{typography.stat-numeral}"
  podium-first:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.tertiary}"
    typography: "{typography.headline-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  leaderboard-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
  toast-verified:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    typography: "{typography.headline-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  modal-sheet:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  hint-pill:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.neutral}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm}"
---

# Luma — Waypoint System

## Overview

Luma sends someone into a real city, alone, at night or in daylight, following a clue toward a place they've never stood. The interface's only job is to disappear into that experience — it should feel like a well-made field instrument (a compass, a rangefinder, a park-service trail marker), not like a dashboard that happens to have a map in it.

The reference points, deliberately: **Linear's** restraint and depth-through-layers-not-decoration; **Porsche's** conviction that one strong image beats seven competing panels; **Airbnb Experiences'** insistence that the place itself is the hero, not the chrome around it; **Apple's** habit of letting a single element own the entire viewport. None of these are "gamified" — none use confetti, badges-everywhere, or rainbow feedback. The register is quiet confidence, not excitement.

**What this system gives up:** density. Luma will never fit as much on a screen as a typical dashboard, because the whole point is that a photograph or a map is doing more work than five stat widgets ever could. It also gives up decorative color — most of every screen is near-black and off-white. That's the trade: fewer, larger, stronger elements instead of many small ones. If a future screen wants to add a sixth simultaneous focal point, that screen is fighting the system, not extending it.

**The one rule everything else serves:** gold means treasure. Not "brand accent," not "the color we use for buttons" — specifically the sensation of having found something. `tertiary` (Treasure Gold) is budgeted at under 5% of any screen's surface and appears only at moments of reward: an unlocked clue, a confirmed find, a podium finish, XP counting upward. Everywhere else — every ordinary button, every ordinary link, every ordinary "yes, continue" — uses `primary` (Discovery Blue) instead. The day gold appears on a "Cancel" button is the day it stops meaning anything.

## Colors

The palette is built around night navigation: a phone screen held up in a dark alley or an unlit courtyard, where the eye needs almost no light to read the interface but a very little color to mean a great deal.

- **Canvas (`#07090C`):** the color of a city at 2am with the streetlights just out of frame — the base the whole app rests on. Not pure black; there's the faintest warmth in it, the way asphalt never reads as true black even at night.
- **Surface (`#0D1117`):** one step up — panels, hunt cards, the leaderboard. Distinguishable from Canvas by tone alone, no border needed to read the separation.
- **Raised (`#131922`):** the surface something sits *on top of* — the navbar, inputs, modal sheets, podium block. This is as light as a "flat" surface ever gets; anything lighter than this is either text or the treasure accent.
- **On-surface (`#F5F5F3`):** body and headline text. Not `#FFFFFF` — full white on near-black halates and fatigues on a phone screen used for twenty minutes of walking navigation. This is warm-white, like a page lit by a single warm bulb.
- **Border (`#242932`):** Raised lifted roughly 7% toward white — a hairline, never a rectangle you'd call "a border." It should register as a seam, not a shape.
- **Discovery Blue, `primary` (`#6BB8FF`):** the color of a GPS dot, a plotted route, a cartographer's ink line on a night chart. This is the interactive workhorse — every ordinary button, link, and active state that isn't specifically a reward. `primary-strong` (`#4A97DB`) is its pressed/hover step, one notch toward dusk.
- **Success, `secondary` (`#54B889`):** jungle-canopy green, used exactly once per moment — the instant a camera match is confirmed, a hunt is completed, a sign-up succeeds. It is *not* a general "positive" color for every checkmark in the app; it's reserved for verification, which is Luma's actual differentiator.
- **Treasure Gold, `tertiary` (`#C99A45`):** aged brass, an old coin pulled out of the dirt — not a bright CTA yellow. Used only for reward moments, per the Overview. `tertiary-soft` (`#E7C879`) is its brighter twin, used exclusively for the animated unlock-ring and the hover state of a treasure-adjacent button — it should feel like the gold catching light, not like a second accent color.
- **Neutral (`#8D949E`):** muted slate for secondary text, captions, disabled states, placeholder copy — cool enough to recede against the warm on-surface text.
- **Error, `#E2604A`:** a signal-flare red-orange, pulled toward the same warm family as the gold rather than a stock alert red, so it reads as "this system's error," not an imported component.

## Typography

Two working faces, plus one deliberately narrow third.

**Geist Sans** carries every functional and headline role — interface chrome, card titles, buttons, body copy. It has the restrained, slightly technical character Linear-style products use well, and it stays legible at small sizes on a phone in direct sunlight, which is a real condition this app is used in.

**Instrument Serif**, italic, appears in exactly one place per screen at most: the single cinematic line — the landing page's "hiding something," a campaign's poster title, a mission's headline moment. It is never used for anything a user has to *act on* (never a button, never a label) — only for the sentence a user is meant to feel. Pairing an editorial italic serif against an uppercase geometric sans is the specific device that keeps the hero from reading as generic "big bold text."

**IBM Plex Mono**, used narrowly, for the app's recurring data motif: distances (`184 m`), waypoint numbers (`01`, `02`), coordinates, scores, and countdown-style stats. This is a third face and it is only permitted this narrow, functional job — it must never be used for prose. The justification is that Luma's whole visual identity is expedition instrumentation (compass bearings, coordinate readouts), and a monospace numeral is what makes those numbers read as *measured* rather than merely *labeled*. Fall back to `ui-monospace, "SF Mono", monospace` and `Geist, system-ui, sans-serif` respectively if either face fails to load.

Tracking: negative (`-0.01` to `-0.02em`) at display sizes so large type doesn't feel loose; positive (`0.12em`) on uppercase labels so caps don't collide. Line height moves the other way — tight at 72px, loose (1.6) at body size.

## Layout

Base unit is 8px, with a wider `2xl` (96px) step reserved for the hero and mission-briefing screens — Porsche-style breathing room doesn't happen at the 32px step most UI uses; it needs the extra one.

The system is **asymmetric-committed**, not centered-safe. The landing hero's headline sits left-aligned in the lower third of the viewport, not centered — a Porsche/Apple hero commits to a single strong axis rather than symmetric balance. Map-first screens (Explore, Active Clue) are asymmetric by nature: content overlays a full-bleed map/photo rather than sitting in a column beside it.

Body measure caps at ~65ch for mission descriptions and clue text — anything wider than that on a hunt-detail screen undermines the "mission briefing," not "long-form article," framing.

Breakpoint behavior is content-driven, not grid-driven: the map/photo always wants ≥45% of the viewport height on mobile (per the Explore and Hunt Detail specs) regardless of what a conventional 12-column grid would allocate it.

## Elevation & Depth

Depth comes from the three-surface ladder (Canvas → Surface → Raised), not from shadow. Each step is a deliberate, small lightness increase — in dark UI, raised things get *lighter*, because shadows are invisible against near-black and only create murky halos.

Blur is not a general-purpose decoration — it is reserved for exactly five places: the floating navbar (after scroll only, never at rest), map overlay controls, the draggable bottom sheet, the modal/scan UI, and the active-clue HUD panel. Everywhere else — hunt cards, leaderboard rows, badges, inputs — is a flat, opaque surface with a hairline `{colors.border}` seam. This is the system's core correction: when blur was applied to every panel, it meant nothing; reserved for five specific overlay contexts, it reads as "this is floating above the map/photo," which is true, and premium.

Where a shadow is unavoidable (a floating action button, a raised card on hover), it should be warm and dark — `rgba(7, 9, 12, 0.4)`, never neutral black — with a soft, low-angle offset (`0 8px 24px`) implying light falling from just above the viewport, consistent across every use.

## Shapes

Radius is hierarchical and maps directly to a surface's role: `none` for full-bleed photography and the map itself (nothing interrupts the image's edge), `sm` (10px) for inputs and chips, `md` (18px) for cards, `lg` (28px) for anything that behaves like a sheet — modals, the bottom sheet, the HUD panel, the mission-briefing hero — and `full` for anything meant to read as an object rather than a container: buttons, avatars, the radar's pulse rings, waypoint dots, the mobile nav's central `+`.

Borders are single hairlines (`1px solid {colors.border}`), never a visible "card" rectangle — see the `divider` component, which is the only sanctioned way a border color is expressed, since a stroke around every panel is exactly the "glass rectangle everywhere" problem this system replaces.

## Motion

The test for any animation in Luma: **does it reinforce exploration, discovery, depth, or reward?** If not, it doesn't ship, no matter how good it looks in isolation. This system explicitly rejects decorative 3D (tilting panels for the sake of tilting, spinning icons, particle fields with no meaning) — the two approved categories are **scroll-driven storytelling** (the app revealing itself like a journey) and **physical feedback** (things that rise, settle, tighten, or glow because a real object would).

**Timing and easing.** Two families only. Interface motion (hover, press, toggle) is fast and mechanical: `150–250ms`, `ease-out`. Narrative motion (scroll sequences, clue transitions, reveal states) is slower and eased both ways: `500–900ms`, `cubic-bezier(0.22, 1, 0.36, 1)` — an "ease-out-expo" feel, quick to start and gently settling, never bouncy or elastic. Nothing in Luma springs or overshoots; a treasure hunt is confident, not cartoonish.

**The landing-page sequence is the system's signature piece and is pinned/scroll-scrubbed, not autoplaying:**
1. A real 3D compass sits above `display-caps` + `display-serif` hero text, over a dark wireframe terrain with low buildings rising off it.
2. As the user scrolls the hero text and compass fade; the gold route line (`tertiary`) draws itself across the terrain and waypoint gems surface one by one.
3. The camera descends from a high overview toward the final waypoint; it labels itself "CLUE 01" in `coordinate-mono`.
4. The terrain fades and that waypoint resolves into a real `hunt-card` (the first published hunt, with its own photograph).
5. The card settles with a `button-primary` ("Begin the hunt") — not gold; Begin is an ordinary forward action.
This is the one place a genuinely cinematic, pinned scroll-timeline is warranted — everywhere else, motion is a reaction to user input (hover, proximity, state change), not an authored timeline. Visitors with `prefers-reduced-motion` get no WebGL and no scroll choreography: a static gold compass badge, the hero, and the featured hunt card.

**Signature per-screen moments** (each gets exactly one; do not stack multiple signature moments on one screen):
- **Hunt cards** tilt toward the cursor at `3–6deg` max, with the image, title, and `badge-difficulty` moving at slightly different depths (image moves most, title least) — the same three-surface depth logic as Elevation & Depth, expressed as parallax instead of color.
- **Clue transitions**: a solved clue's card sinks back and fades (`opacity → 0`, `translateZ` back) while the next clue rises forward — progression as a physical, not a checklist, event.
- **Active-clue radar** (`hud-panel`): concentric rings expand outward slowly and continuously; the center marker floats gently. As distance to target closes, rings tighten, the center glow strengthens from `neutral` toward `tertiary`, and the pin rises slightly — motion and the color proximity rule (Components → HUD panel) reinforce the same signal, never separately.
- **Camera verification**: the captured photo is the backdrop, always darkened under a vignette scrim so overlay copy stays legible over a bright daytime landmark; a single luminous horizontal scan line sweeps a framed region while a three-line checklist ticks off in `secondary`. On success a `tertiary` disc with an expanding `tertiary-soft` ring confirms the find. The failure path — including a thrown network error — always lands on a retry screen; the overlay must never hang on "Analyzing". A particle burst that converges into a checkmark is specified but not yet built.
- **Portal (clue solved)**: when a clue is solved and another remains, a hairline `tertiary-soft` ring opens outward from screen center through a dark `canvas` veil (~700ms, `cubic-bezier(0.22, 1, 0.36, 1)`), so the next clue arrives by travelling through a waypoint rather than cutting. Gold is a ring, never a flood; only `transform` and `opacity` animate. It does not play on hunt completion, which already has confetti.
- **Podium**: top-three cards rise into place at slightly staggered speeds (1st slowest/heaviest, 3rd quickest) when the leaderboard opens, like physical blocks settling.
- **Hero compass**: a real 3D object — gold rim, dark metal body, glass top, engraved ticks, needle — that tilts up to ±5° / ±3° toward the cursor anywhere on the page, and whose needle swings toward whichever hero CTA is hovered ("Start exploring" left, "Enter hunt code" right), drifting idly otherwise. It exists only in the hero: it unmounts once the hero has scrolled away.

**Ambient/small motion** (cheap, used throughout, never draws attention to itself): buttons depress `~2px` on press; cards lift `6–10px` with a soft warm shadow on hover; images scale `1.05 → 1` on load, never on hover-loop; numeric stats and XP count upward instead of jumping; a `tertiary` underline grows left-to-right under an active nav item; the navbar gains its blur only after the user scrolls past the hero, never at rest; modals/sheets scale in from `0.96 → 1`; map pins bounce exactly once on entering the viewport, never repeating.

**Libraries.** The `motion` package (imported from `motion/react`, never `framer-motion`) handles the majority — hover states, staggered entrances, sheet and overlay transitions, and scroll tracking via `useScroll`. GSAP is not used: the pinned landing sequence is built on `useScroll` instead, so the app carries one animation library. React Three Fiber (with drei) is scoped to exactly three elements: the hero compass and the terrain scene are built; the treasure-confirmation particle burst is reserved but not yet built. Real 3D is expensive and hard to maintain, so it earns its place only at the highest-impact moments, not as the app's general rendering approach. The three.js payload is roughly as large as everything else combined, so both scenes are `React.lazy` code-split and load only on the landing page.

**Scroll-linked values must go through plain state, not raw MotionValues in `style`.** Feeding `useTransform` outputs straight into a `style` prop was tried first for the landing sequence and failed reproducibly: `y` (a transform) tracked scroll, while `opacity` stayed frozen at its initial value even when the range arrays were hoisted to stable references. The shipped approach mirrors `scrollYProgress` into a React state number with `useMotionValueEvent` and computes every value with a plain piecewise `mapRange` helper (`src/lib/mapRange.ts`); code that runs inside `useFrame` (the 3D camera rig) reads the same progress from a ref instead.

## Components

**Buttons.** Three tiers, and they must not be interchangeable. `button-primary` (Discovery Blue) is the default for any ordinary forward action — "Start exploring," "Begin Hunt," "Continue." `button-treasure` (gold) is reserved for the small set of actions that *are* the reward moment — primarily "Open Camera to Verify" and a claimed-treasure confirmation — because those are the two places in the product where gold's meaning is actually earned. `button-secondary` (Raised bg, hairline border implied by the surface step, no fill) is for anything the user could just as easily skip — "Enter hunt code," dismiss actions. `button-ghost-link` (no surface, `neutral` text) is for the one-off text link like "Create your own hunt →" — it must never carry a background.

**HuntCard.** Image occupies roughly 60% of the card's height and is the dominant element; difficulty (`badge-difficulty`) and distance sit as overlay chips directly on the photo, never below it. Title, location, clue-count + duration, and explorer count sit in the `surface`-colored footer. The full description never appears on the card — only on Hunt Detail, by design (see Overview: fewer, stronger elements).

**HUD panel (Active Clue).** The one screen allowed to feel most like an instrument rather than an app screen. Distance-to-target uses `stat-numeral` in `neutral` at long range, animating to `tertiary` only inside the last ~15% of the total distance — color intensity is the *only* signal of proximity; no red/green traffic-light logic, since that both clashes with the reserved-gold rule and fails color-blind users.

**Podium / Leaderboard.** `podium-first` is the only leaderboard element permitted to use `tertiary` text — 2nd and 3rd place use `on-surface`, same as the ranked list below. This is a direct extension of the gold-scarcity rule: only the literal top spot gets the treasure color.

**Camera verification.** Full-screen, `canvas`-backed, with `hud-panel` styling for the post-capture analysis checklist. The success state is the single moment `toast-verified` (green) and a `tertiary-soft` unlock-ring animation are allowed to appear together — it is the product's one designed "wow," and it should not be diluted by using the same combination anywhere else.

**Forms (Login/Register/etc.).** Intentionally left plain: `input`, `button-primary`, `page`. These screens are explicitly not part of the redesign priority — do not add hero imagery, serif display type, or gold accents here. Spending system polish on a password form steals attention from the five screens where the atmosphere actually needs to live.

## Do's and Don'ts

- Do treat `tertiary` (gold) as a budget, not a palette color — if a screen already has one gold element, the next "important" thing on that screen gets `primary`, not gold.
- Don't reach for `.glass`/blur as a default panel treatment. Blur is for the five overlay contexts named in Elevation & Depth only; a hunt card, leaderboard row, or badge is always flat.
- Do keep the map/photo as the largest single element on Landing, Explore, and Hunt Detail — if a new component would compete with it for size, shrink the component, not the image.
- Don't center-align the landing hero. The asymmetric, lower-third-left composition is a specific choice (Porsche/Apple-style single-axis commitment); centering it collapses back into "generic hero section."
- Do use `coordinate-mono` for every distance, waypoint number, and score — never render those as plain body text. This is the recurring visual signature the route/waypoint language depends on.
- Don't use `secondary` (green) as a generic "success" color for minor UI confirmations (form saved, settings updated). Reserve it for hunt-verification moments so it keeps its weight.
- Do write difficulty, distance, and duration on the HuntCard's image itself, as overlay chips. Don't put the full description on any card — that's what the detail screen is for.
- Don't add a fourth typeface. `coordinate-mono` already stretches the two-face guideline; anything more fragments the system.
- Do use `divider` (a 1px `{colors.border}` fill) for any hairline rule — never a bordered box — to separate content within a surface.
- Don't apply this system's atmosphere (imagery, serif display type, gold, blur) to Login, Register, or Forgot Password. Keep those on `page` + `input` + `button-primary` only.
- Do ask "does this reinforce exploration, discovery, depth, or reward?" before adding any animation. If the honest answer is "it looks cool," it doesn't ship.
- Don't give a screen more than one signature motion moment (per Motion). A card that tilts, glows, particles, AND bounces is a demo reel, not a product.
- Don't use React Three Fiber outside the three named elements (compass, map/terrain, treasure particles). Every additional 3D element is a performance and maintenance cost the system deliberately declined to pay.
- Do let proximity and reward states drive motion and color together, never separately — the HUD's ring-tightening and its color shift from `neutral` to `tertiary` are one signal, not two.
- Don't use spring/bounce/elastic easing anywhere. Luma's motion is confident and settling (`ease-out`/expo-out only), never playful-bouncy.
