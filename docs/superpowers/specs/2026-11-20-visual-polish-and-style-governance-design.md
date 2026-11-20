# Design Spec: Visual Polish, Layout Governance & Art-Direction Skill System

**Date:** 2026-11-20  
**Workspace:** `D:\Dev\Remotion\REMOTION-StoryTelling`  
**Status:** Approved by User Upfront ("langsung bikinkan aja plan dan specsnya, aku approve semua yang penting memberi hasil yang bagus")

---

## 1. Intent & The Why

With the foundational Remotion 4.0.545 workspace, HD-2D engine, and external audio sync pipeline in place, the next quality bottleneck in AI-assisted video generation is **visual consistency and motion polish**. When an AI agent authors a new `PartXX.tsx` from scratch using only low-level primitives, five failure modes commonly degrade output quality:
1. **Free-Form Coordinate Guessing:** Manual `(x, y)` placement causes uneven margins, cramped compositions, or collisions between scene cards and the active caption band (`top-safe` vs `bottom-safe`).
2. **Inconsistent Motion Physics & Pacing:** Arbitrary `spring()`/`interpolate()` numbers make some elements snap violently while others drift linearly, without a clear narrative rhythm (*Enter -> Act -> Payoff -> Settle*).
3. **Missing Visual Finishing on Non-HD2D Styles:** While `hd2d-night` has `<HD2DOverlay />` (tilt-shift blur, vignette, color grade), `b1-paper` and `2.5D` scenes lack an equivalent finishing pass (`<PaperStageOverlay />`) and subtle camera motion (`<CameraRig25D />`).
4. **Topic-Level Style Drift:** Without a locked style profile in `topic.config.ts`, font scales, accent colors, and background treatments drift from part to part.
5. **No Automated Visual/Layout Guardrails:** Static mistakes (text smaller than 28px on a `1080×1920` phone canvas, coordinates outside `SAFE_ZONE`, or forbidden CSS transitions/`Math.random()`) are not caught automatically before opening Studio.

This design introduces a **6-Pillar Visual Polish & Style Governance System** across `src/engine/` and `.agents/skills/remotion-storytelling/`.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
1. **Topic Style Profiles & Theme Context (`TopicStyleProfile` + `<TopicThemeProvider>`):**
   - Lock each topic's visual preset (`"hd2d-cinematic" | "b1-editorial" | "neo-25d-dark" | "neo-25d-light"`), typography scale (`TYPE_SCALE`), palette tokens, default `captionPlacement`, and finishing overlay in `topic.config.ts`.
2. **Caption-Aware SafeZone Slot Layout (`<SafeLayout>` & `<StageSlot>`):**
   - Provide deterministic vertical layout slots (`"header"`, `"stage"`, `"split-top"`, `"split-bottom"`, `"footer"`) that automatically shift clear of the active caption band (`top-safe` vs `bottom-safe` vs captions disabled).
3. **Standardized Motion Choreography & Camera Rig (`@engine/motion/*`):**
   - Named spring physics presets (`SPRINGS.snappy`, `SPRINGS.bouncy`, `SPRINGS.smooth`, `SPRINGS.heavy`).
   - Normalized 4-beat pacing calculator (`computePartBeats(localFrame, durationInFrames)`) dividing any audio duration into `enter`, `act`, `payoff`, and `settle` progress values (`0..1`).
   - Reusable `<CameraRig25D preset="slow-push" | "gentle-drift" | "focus-top" | "focus-bottom" | "static">` and `<PaperStageOverlay />` (warm editorial paper vignette, subtle grid border, ink frame accents).
4. **High-Craft Composable Scene Archetypes (`@engine/archetypes/*`):**
   - `<TitleHookScene>`: Kinetic headline + eyebrow badge + focal visual/actor slot.
   - `<ComparisonCardsScene>`: 2–3 staggered `Card25D` or `PaperCard` items with automatic SafeZone spacing and highlight badges.
   - `<ProcessFlowScene>`: Sequential step cards (`1 -> 2 -> 3`) connected by animated progressive SVG connectors (`<Connector25D>`).
   - `<SpotlightCalloutScene>`: Focal subject with pulsing target rings, leader lines, and callout pills (generalized from `SafeRoomHD2D`'s `SignalCallouts`).
5. **Fast Static Style & SafeZone Auditor (`npm run audit-style`):**
   - Zero-LLM-token Node CLI script (`scripts/audit-style.mjs`) scanning `src/topics/**` for forbidden non-deterministic patterns (`Math.random()`, `setTimeout`, CSS `transition`/`animation`), unreadable phone font sizes (`fontSize < 28`), and out-of-SafeZone literal coordinates.
6. **Art Direction Playbook in Codex Skill (`references/art-direction-playbook.md`):**
   - Upgrade `.agents/skills/remotion-storytelling/SKILL.md`, `scaffold.mjs`, and `references/art-direction-playbook.md` so Codex automatically applies the typography scale, 4-beat choreography, slot layouts, and `npm run audit-style` check on every new part.

### Non-Goals
- Do not reintroduce multi-thousand-line JSON review templates or block `npm run dev` on manual approval files.
- Do not break or alter the visual output of the existing `safe-room/ep-01` HD-2D episode.

### Anti-Goals
- Do not force every scene into rigid config-only templates—archetypes are composable React components that accept arbitrary `children` and custom props.
- Do not allow magic-number font sizes below `28px` on a `1080×1920` canvas.

---

## 3. Detailed Architecture

### 3.1 New & Updated Files

```text
REMOTION-StoryTelling/
├── .agents/skills/remotion-storytelling/
│   ├── SKILL.md                                  # Updated with Art Direction & audit-style rules (<120 lines)
│   ├── references/
│   │   ├── art-direction-playbook.md             # NEW: Typography scale, 4-beat pacing, slot & color rules
│   │   ├── engine-api.md                         # Updated with SafeLayout, Motion, Archetypes API
│   │   ├── safezone-motion.md
│   │   └── workflow.md
│   └── scripts/
│       ├── audit-style.mjs                       # NEW: Fast static SafeZone, typography & determinism linter
│       ├── audio-duration.mjs
│       ├── registry.mjs
│       ├── scaffold.mjs                          # Updated to scaffold using SafeLayout + archetypes/beats
│       └── sync-episode.mjs
└── src/
    └── engine/
        ├── index.ts                              # Exports new layout, motion, and archetype modules
        ├── theme.ts                              # Adds TYPE_SCALE, STYLE_PRESETS, StylePresetName
        ├── layout/
        │   ├── SafeStage.tsx
        │   ├── SafeLayout.tsx                    # NEW: Caption-aware flex/grid stage + <StageSlot>
        │   ├── BackgroundLayer.tsx
        │   └── PaperStageOverlay.tsx             # NEW: Editorial B1/2.5D vignette, ink border & grain finish
        ├── motion/
        │   ├── choreography.ts                   # NEW: SPRINGS presets + computePartBeats() + staggerDelay()
        │   ├── CameraRig25D.tsx                  # NEW: Reusable camera push/drift/focus wrapper
        │   └── Connector25D.tsx                  # NEW: Progressive animated SVG arrow/line connector
        └── archetypes/
            ├── TitleHookScene.tsx                # NEW: Eyebrow badge + KineticText hook + hero stage slot
            ├── ComparisonCardsScene.tsx          # NEW: Staggered 2-3 card vertical comparison layout
            ├── ProcessFlowScene.tsx              # NEW: Step-by-step cards with animated Connector25D
            └── SpotlightCalloutScene.tsx         # NEW: Pulsing rings + leader lines + numbered callout pills
```

### 3.2 Typography Scale & Style Presets (`src/engine/theme.ts`)

Locked phone-first type scale on `1080×1920` (minimum readable size `28px`):

```ts
export const TYPE_SCALE = {
  hero: 84,       // Main hook headline (lineHeight: 1.08)
  title: 68,      // Scene header (lineHeight: 1.12)
  subtitle: 48,   // Card title / secondary claim (lineHeight: 1.18)
  body: 40,       // Card explanation / callout text (lineHeight: 1.24)
  caption: 32,    // Eyebrow pill / badge / step label (lineHeight: 1.2, minimum 28)
} as const;
```

Style presets (`STYLE_PRESETS`):
- `"hd2d-cinematic"`: Background `"hd2d-night"`, finishing `"hd2d"`, primary text `#F8FAFC`, accent `#FF9F43`, secondary `#FFF3C4`, surface `rgba(9,14,26,0.82)`.
- `"b1-editorial"`: Background `"b1-paper"`, finishing `"paper"`, primary text `#262E31`, accent `#356774`, secondary `#F2C759`, surface `#FFFDF4`.
- `"neo-25d-dark"`: Background `"dark-25d"`, finishing `"hd2d"`, primary text `#F8FAFC`, accent `#38BDF8`, secondary `#F59E0B`, surface `rgba(18,24,36,0.88)`.
- `"neo-25d-light"`: Background `"light-25d"`, finishing `"paper"`, primary text `#0F172A`, accent `#2563EB`, secondary `#F59E0B`, surface `#FFFFFF`.

### 3.3 Caption-Aware `<SafeLayout>` & `<StageSlot>` (`src/engine/layout/SafeLayout.tsx`)

`<SafeLayout>` calculates the active usable vertical box inside `SAFE_ZONE` (`left: 64, width: 876`):
- When `captionPlacement === "top-safe"` and `showCaptions !== false`: reserves `y: 180..380` for the top caption band, exposing `y: 396..1540` (`height: 1144`) for scene slots.
- When `captionPlacement === "bottom-safe"` and `showCaptions !== false`: reserves `y: 1380..1540` for the bottom caption band, exposing `y: 180..1364` (`height: 1184`) for scene slots.
- When `showCaptions === false`: exposes the full `y: 180..1540` (`height: 1360`).

`<StageSlot slot="header" | "stage" | "split-top" | "split-bottom" | "footer">` positions children inside that active safe box with guaranteed gap spacing (`24px`) and `overflow: "visible"` for 3D transforms while keeping layout boxes strictly inside safe bounds.

### 3.4 4-Beat Motion Choreography (`src/engine/motion/choreography.ts`)

```ts
export const SPRINGS = {
  snappy: { damping: 18, stiffness: 180, mass: 0.8 },
  bouncy: { damping: 13, stiffness: 140, mass: 0.9 },
  smooth: { damping: 22, stiffness: 110, mass: 1.0 },
  heavy:  { damping: 26, stiffness: 80,  mass: 1.3 },
} as const;
```

`computePartBeats(localFrame: number, durationInFrames: number)` returns deterministic `0..1` clamped progress values for the 4 narrative phases of any part:
- `enter`: `0% .. 18%` of part duration (capped to `12..36` frames) — headline & initial setup entrance.
- `act`: `15% .. 62%` of part duration — primary character/diagram motion.
- `payoff`: `52% .. 84%` of part duration — key answer, highlight badge, or secondary card reveal.
- `settle`: `84% .. 100%` of part duration — readable hold with subtle breathing (`breath: -1..1` sine wave).

### 3.5 Static Style & SafeZone Auditor (`scripts/audit-style.mjs`)

`node .agents/skills/remotion-storytelling/scripts/audit-style.mjs [topic]` (`npm run audit-style`):
1. Scans `.tsx` and `.ts` files under `src/topics/` (or a specific topic folder).
2. Reports errors on:
   - Non-deterministic calls: `Math.random(`, `Date.now(`, `setTimeout(`, `setInterval(`.
   - Forbidden CSS motion: `transition:`, `animation:` in inline style objects.
   - Unreadable phone typography: literal `fontSize: <N>` where `<N> < 28` (unless inside an SVG pixel sprite or hidden debug node).
   - Hardcoded out-of-SafeZone root positions: literal `left: <N>` (`< 0` or `> 940` on text/cards) or `top: <N>` (`< 160` or `> 1560` on text/cards) unless marked with `// safezone-exempt` (such as full-bleed background/foreground parallax trees).
3. Exits `0` when clean and `1` with actionable file:line diagnostics when violations exist.
