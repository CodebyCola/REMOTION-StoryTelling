---
name: remotion-storytelling
description: "Author, extend, and sync modular 9:16 vertical storytelling videos in Remotion using the workspace HD-2D, Stickman B1, and 2.5D motion engine with external per-part audio and optional captions."
---

# Remotion Storytelling Workspace Skill

Use this skill for every video, topic, episode, or scene request in this repository. It keeps Codex token usage low with small modular `PartXX.tsx` components, locked typography/layout presets, automated style auditing, and live preview in Remotion Studio.

## Core Architecture & Boundaries

- **Single Root Workspace:** All topics share the root `package.json`, `src/engine/`, and `public/fonts/`. Never create nested `package.json` or `node_modules` inside a topic folder.
- **Engine Primitives (`@engine/*` -> `src/engine/`):** Reuse the shared archetypes (`TitleHookScene`, `ComparisonCardsScene`, `ProcessFlowScene`, `SpotlightCalloutScene`), layout (`SafeStage`, `SafeLayout`, `StageSlot`, `BackgroundLayer`, `PaperStageOverlay`), motion (`SPRINGS`, `computePartBeats`, `CameraRig25D`, `Connector25D`), HD-2D (`GroundPlane`, `Billboard`, `Room`, `HD2DOverlay`, `DynamicLight`, `Rain`, `Embers`, `Dust`, `Px`), Stickman B1 (`Stickman`, `PaperCard`, `SketchArrow`, `SketchCircle`, `InkUnderline`), 2.5D (`Card25D`, `KineticText`), and runtime (`EpisodePlayer`, `CaptionOverlay`, `remapFrame`) modules.
- **Topic & Episode Isolation (`@topics/*` -> `src/topics/<topic>/`):**
  - Reusable topic components live in `src/topics/<topic>/components/` and may be imported across topics via `@topics/<other-topic>/components/*`.
  - Each episode lives in `src/topics/<topic>/episodes/<episode>/` with isolated scene files in `parts/Part01*.tsx`, `Part02*.tsx`, etc.
  - External media lives in `public/topics/<topic>/<episode>/parts/` (`01-*.mp3|wav`, optional `01-*.srt|json`, optional `../bgm.mp3|wav`).

## Standard Workflow (Token-Efficient)

1. **Scaffold a topic/episode or add a part:**
   ```bash
   npm run scaffold -- <topic>/<episode> --parts <N> --style <hybrid|hd2d|b1-stickman>
   npm run scaffold -- <topic>/<episode> --add-part --style <hybrid|hd2d|b1-stickman>
   ```
2. **Sync external audio & optional captions:**
   After external audio slices (`01-*.mp3|wav`, `02-*.mp3|wav`, ...) and optional `.srt`/`.json` caption files are placed in `public/topics/<topic>/<episode>/parts/`, run:
   ```bash
   npm run sync -- <topic>/<episode>
   ```
   Never hand-edit `episode.data.json`, `parts.generated.ts`, `episodes.generated.ts`, or `src/topics/index.ts`. Run `npm run scaffold -- --registry` after manual `PartXX*.tsx` renames.
3. **Author or edit only the target `parts/PartXX*.tsx` file(s):**
   - Compose scenes with `@engine/archetypes/*` or `<SafeLayout>` + `<StageSlot>` + `TYPE_SCALE` + `STYLE_PRESETS` + `computePartBeats`.
   - Read only `episode.data.json` and `public/topics/<topic>/<episode>/script.md` (if present). Keep each part file concise (<120 lines).
4. **Verify via Style Auditor, TypeScript & Remotion Studio:**
   - Run `npm run audit-style`, `npm run lint`, and `npm test`.
   - Preview interactively with `npm run dev` (Remotion Studio) instead of running MP4 renders during iteration. Render MP4 (`npx remotion render <composition-id>`) only when explicitly requested.

## Mandatory Authoring Rules

- **Art Direction & Layout Governance:** Always forward `showCaptions` and `captionPlacement` into `<SafeLayout>` or an archetype so captions never collide with scene UI. Keep phone typography `>= 28px` (`TYPE_SCALE`).
- **Deterministic Frame Math Only:** Drive all motion from `useCurrentFrame()` and `useVideoConfig()` using `interpolate()`, `spring()`, `computePartBeats()`, `lsin()`, `mulberry32(seed)`, or `remapFrame()`. Never use CSS `transition`/`animation`, `setTimeout`, or `Math.random()`.
- **Audio & Captions:** `EpisodePlayer` mounts `<PartAudio>` and external `<PartCaptionTrack>` automatically per part. When a part has no external `.srt`/`.json` (`part.hasCaptions === false`), `EpisodePlayer` passes `showCaptions={true}` so optional inline `<CaptionOverlay>` cues can render.
- **Windows Process Hygiene:** Stop Remotion Studio gracefully (`Ctrl+C`). If a crashed render locks `.remotion`, run `Stop-Process -Name "chrome-headless-shell" -Force`.

## Reference Guides (Load Only What You Need)

- Art direction, typography scale, 4-beat pacing & color ratios: [references/art-direction-playbook.md](references/art-direction-playbook.md)
- Component props, types, and imports: [references/engine-api.md](references/engine-api.md)
- 9:16 SafeZone geometry, HD-2D camera projection, and motion rules: [references/safezone-motion.md](references/safezone-motion.md)
- End-to-end external audio, caption, scaffolding, and rendering commands: [references/workflow.md](references/workflow.md)
