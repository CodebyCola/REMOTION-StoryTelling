# Engine API Reference (`@engine/*`)

All engine modules can be imported from `@engine` (barrel `src/engine/index.ts`) or their subpaths.

---

## 1. Theme, Constants & Deterministic Math (`@engine/theme`)

- **Canvas & Timing:** `W = 1080`, `H = 1920`, `FPS = 30`.
- **Typography Scale (`TYPE_SCALE`):**
  `{ hero: 84, title: 68, subtitle: 48, body: 40, caption: 32 }` (minimum `28px` on mobile).
- **Style Presets (`STYLE_PRESETS`, `StylePresetName`):**
  `"hd2d-cinematic" | "b1-editorial" | "neo-25d-dark" | "neo-25d-light"` — returns `{ background, finishing, textPrimary, textMuted, accent, secondary, surface, border }`.
- **SafeZone Constants (`SAFE_ZONE`):**
  ```ts
  SAFE_ZONE = {
    top: 180,
    bottom: 380,
    left: 64,
    right: 140,
    width: 876,          // 1080 - 64 - 140
    height: 1360,        // 1920 - 180 - 380
    primaryHeight: 1200, // 1380 - 180 (above bottom caption band)
    captionBandTop: 1380,
    captionBandBottom: 1540,
  }
  ```
- **Palette (`C`):**
  - HD-2D Night/Warm: `nightDeep` (`#090E1A`), `nightMid` (`#162238`), `nightFog` (`#1E3A5F`), `warmCore` (`#FFF3C4`), `warmMid` (`#FF9F43`), `warmAmbient` (`#D97706`), `hpLow` (`#EF4444`), `hpFull` (`#22C55E`), `uiLine` (`#F8FAFC`).
  - Stickman B1: `b1Paper` (`#FDFDFC`), `b1Ink` (`#262E31`), `b1Blue` (`#356774`), `b1Yellow` (`#F2C759`).
- **Fonts:** `FONT_UI` (`'Plus Jakarta Sans', 'Inter', system-ui, sans-serif`), `FONT_PX` (`'Silkscreen', 'JetBrains Mono', monospace`).
- **Math & Color Helpers:**
  - `remapFrame(localFrame, localDurationInFrames, designStart, designEnd): number` — Maps a part's local frame (`0 .. durationInFrames - 1`) proportionally onto an authored design frame window (`[designStart, designEnd]`).
  - `mulberry32(seed: number): () => number` — Deterministic PRNG for particles/stars/trees.
  - `lsin(f, period, phase = 0)` / `lcos(f, period, phase = 0)` — Periodic sine/cosine oscillators.
  - `smooth(f, a, b)` — Clamped cubic in-out `0..1` interpolation across `[a, b]`.
  - `lerp(a, b, t)`, `clamp(v, lo = 0, hi = 1)`, `mix(hexA, hexB, t)`, `shade(hex, amount)`.

---

## 2. Layout, SafeZone & Motion Choreography (`@engine/layout/*`, `@engine/motion/*`)

- **`<SafeStage showSafeZones?: boolean>`** (`@engine/layout/SafeStage`):
  Root `1080×1920` container mounted automatically by `EpisodePlayer`. When `showSafeZones` is toggled `true` in Remotion Studio controls, renders dashed guide boxes for `Top UI`, `Right actions`, `Bottom description`, `Primary safe area`, and `Caption band`.
- **`<SafeLayout showCaptions? captionPlacement? gap? style?>` & `<StageSlot slot="header"|"stage"|"split-top"|"split-bottom"|"footer">`** (`@engine/layout/SafeLayout`):
  Caption-aware flexbox layout container inside `SAFE_ZONE` (`computeSafeBounds()`). Automatically shifts clear of `"top-safe"` (`396..1540`) or `"bottom-safe"` (`180..1364`).
- **`<BackgroundLayer preset?: "hd2d-night" | "b1-paper" | "dark-25d" | "light-25d" />`** (`@engine/layout/BackgroundLayer`):
  Full-frame background layer for any scene style.
- **`<PaperStageOverlay />`** (`@engine/layout/PaperStageOverlay`):
  Editorial finishing layer (warm radial vignette + subtle inset hairline frame) for `b1-editorial` and `neo-25d-light`.
- **`choreography.ts` (`@engine/motion/choreography`):**
  - `SPRINGS`: `{ snappy, bouncy, smooth, heavy }` spring configs.
  - `computePartBeats(localFrame, durationInFrames)`: returns `{ enter, act, payoff, settle, progress, breath }` (`0..1`).
  - `staggerFrame(localFrame, index, stepFrames = 6, startFrame = 0)`: staggered local frame offset.
- **`<CameraRig25D preset?="slow-push"|"gentle-drift"|"focus-top"|"focus-bottom"|"static" intensity?=1>`** (`@engine/motion/CameraRig25D`):
  Smooth eased camera motion wrapper across a part's duration.
- **`<Connector25D from to progress color? strokeWidth? curved? arrowHead? />`** (`@engine/motion/Connector25D`):
  Animated progressive SVG Bezier/straight arrow connector.

---

## 2B. Composable Scene Archetypes (`@engine/archetypes/*`)

- **`<TitleHookScene eyebrow? title subtitle? preset? camera? showCaptions? captionPlacement?>{children}</TitleHookScene>`**
- **`<ComparisonCardsScene heading items={ComparisonItem[]} preset? showCaptions? captionPlacement? />`**
- **`<ProcessFlowScene heading steps={ProcessStep[]} preset? showCaptions? captionPlacement? />`**
- **`<SpotlightCalloutScene heading? points={CalloutPoint[]} preset? showCaptions? captionPlacement?>{children}</SpotlightCalloutScene>`**

---

## 3. HD-2D / 2.5D Diorama Engine (`@engine/hd2d/*`)

- **`world.tsx` (`@engine/hd2d/world`):**
  - `CAM = { D: 700, theta: 55, cx: 540, cy: 1100 }`, `FAR_PX = 9000`, `PLANE_W = 3600`.
  - `project(u, d, cy = CAM.cy): { x, y, s }` — Projects ground plane lateral `u` and depth `d` (`< 0` far, `> 0` near) to screen coordinates and scale `s`.
  - `project3(u, d, z, cy = CAM.cy): { x, y, s }` — Projects 3D coordinates including vertical height `z` above ground.
  - `<GroundPlane width? cy? preserve3d? background style?>` — CSS-3D perspective ground plane tilted by `55deg`.
  - `<GroundItem u d width depth style?>` — Places surface decals, paths, rugs, or light pools on `<GroundPlane>`.
  - `<Billboard u d blur? shadow?={{ w, opacity?, dx? }} lift? cy? style?>` — Stands an upright sprite at `(u, d)` with automatic depth-sorted `zIndex`, perspective scale, optional DoF blur, and ground contact shadow.
  - `<Room cy halfW dNear dFar wallH floorBg backBg sideBg back? floorChildren? warm fireU fireD />` — 3D shadow-box room interior with warm firelight falloff.
  - `<FullLayer style?>` — `1080×1920` absolute layer.
- **`<HD2DOverlay />`** (`@engine/hd2d/HD2DOverlay`):
  Top 14% and bottom 16% tilt-shift blur bands, radial corner vignette, and soft-light teal/amber cinematic grade (mounted automatically by `EpisodePlayer` when `hd2dOverlay` is `true`).
- **`<DynamicLight frame x y radius color? core? intensity? flicker? squash? seed? />`** (`@engine/hd2d/DynamicLight`):
  Screen-blended radial point light with multi-frequency organic flicker.
- **`ParticleField.tsx` (`@engine/hd2d/ParticleField`):**
  - `<Rain frame opacity front?: boolean slant?: number />`
  - `<Embers frame x y spread? rise? opacity? count? />`
  - `<Dust frame opacity? count? color? />`
- **`Px.tsx` (`@engine/hd2d/Px`):**
  - `<Px rects={R[]} gw={number} gh={number} unit={number} style? />` — Crisp pixel-grid SVG renderer.
  - `r(x, y, w, h, color): R` and `box(x, y, w, h, fill, outlineColor?): R[]`.

---

## 4. Stickman B1 & 2.5D Motion Toolkit (`@engine/stickman/*`, `@engine/motion25d/*`)

- **`<Stickman pose? expression? facing? x? y? scale? accentColor? handTarget? />`** (`@engine/stickman/Stickman`):
  - `pose`: `"idle" | "think" | "point" | "hold" | "celebrate" | "walk"`
  - `expression`: `"neutral" | "curious" | "happy" | "surprised"`
  - `facing`: `"left" | "right"`
  - `handTarget`: `{ x: number, y: number }` in local `240×320` figure space for custom prop contact.
- **`HandDrawnProps.tsx` (`@engine/stickman/HandDrawnProps`):**
  - `<PaperCard style?>`, `<SketchArrow width? height? color? style? />`, `<SketchCircle width? height? color? style? />`, `<InkUnderline width? height? color? style? />`.
- **`<Card25D delay? tilt? style?>`** (`@engine/motion25d/Card25D`):
  3D perspective-tilted card with spring entrance (`damping: 16, stiffness: 115`).
- **`<KineticText text mode?="word"|"line" delay? stagger? style? />`** (`@engine/motion25d/KineticText`):
  Staggered word-by-word or line-by-line spring typography.

---

## 5. Episode, Part & Caption Contracts (`@engine/episode/*`, `@engine/audio/*`)

- **Part Component Signature (`PartProps`):**
  ```tsx
  import type { PartProps } from "@engine/episode/episode.types";

  export default function Part01({ part, showCaptions = true, captionPlacement }: PartProps) {
    // part.durationInFrames, part.durationInSeconds, part.startFrame, part.id
    return <>{/* scene markup */}</>;
  }
  ```
- **`<CaptionOverlay text from to name top? frame? placement? />`** (`@engine/audio/CaptionOverlay`):
  In-scene frame-window caption (supports remapped `frame` prop or defaults to local `useCurrentFrame()`).
