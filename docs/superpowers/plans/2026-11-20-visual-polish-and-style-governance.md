# Visual Polish, Layout Governance & Art-Direction Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the Remotion storytelling engine and local Codex skill with locked typography/style presets (`STYLE_PRESETS`, `TYPE_SCALE`), caption-aware SafeZone layout slots (`<SafeLayout>`, `<StageSlot>`), 4-beat motion choreography (`SPRINGS`, `computePartBeats`, `<CameraRig25D>`, `<Connector25D>`, `<PaperStageOverlay>`), 4 composable high-craft scene archetypes (`TitleHookScene`, `ComparisonCardsScene`, `ProcessFlowScene`, `SpotlightCalloutScene`), an automated style/SafeZone auditor CLI (`npm run audit-style`), and an Art Direction Playbook in `.agents/skills/remotion-storytelling/`.

**Architecture:** Extends `src/engine/` with pure, testable layout math (`computeSafeBounds`), choreography math (`computePartBeats`, `SPRINGS`), finishing/camera layers (`PaperStageOverlay`, `CameraRig25D`, `Connector25D`), and 4 composable scene archetype components (`src/engine/archetypes/*`). Adds a zero-dependency Node static style auditor (`.agents/skills/remotion-storytelling/scripts/audit-style.mjs`) and updates `scaffold.mjs` and the Codex skill references so newly scaffolded parts use the polished layout and choreography primitives by default.

**Tech Stack:** Remotion `4.0.545`, React `19.3.1`, TypeScript `5.9.3`, Node.js `>=20` built-in test runner (`node --test`).

**Spec:** `docs/superpowers/specs/2026-11-20-visual-polish-and-style-governance-design.md`

## Global Constraints

- Canvas & SafeZone: `1080 × 1920` at `30` fps; `SAFE_ZONE` (`top: 180, bottom: 380, left: 64, right: 140, width: 876, height: 1360, primaryHeight: 1200, captionBandTop: 1380, captionBandBottom: 1540`).
- Minimum phone font size: `28` px (`TYPE_SCALE = { hero: 84, title: 68, subtitle: 48, body: 40, caption: 32 }`).
- Backward compatibility: Existing `src/topics/safe-room/episodes/ep-01/` and all 14 existing tests in `tests/*.test.mjs` must continue to pass without regression.
- Deterministic motion only: No `Math.random()`, `Date.now()`, `setTimeout()`, or CSS `transition`/`animation` properties.

## Review Focus

1. **Caption-aware `<SafeLayout>` bounds under all 3 caption states (`"top-safe"`, `"bottom-safe"`, and `showCaptions: false`):** `computeSafeBounds()` shifts the top edge down to `396` for `"top-safe"`, shifts the bottom limit to `1364` for `"bottom-safe"`, and uses full `180..1540` (`height: 1360`) when `showCaptions` is `false`.
2. **4-beat choreography (`computePartBeats`) on short (`15` frames), standard (`300` frames), and degenerate (`0` or `1` frame) audio durations:** Returns finite, clamped `0..1` values for `enter`, `act`, `payoff`, and `settle` without `NaN` or division by zero.
3. **Static style auditor (`auditSourceText`) detecting `Math.random()`, CSS `transition`, small `fontSize < 28`, and out-of-SafeZone `top`/`left` while honoring `// safezone-exempt` comments:** Flags exact violation categories and line numbers, and passes clean files and exempted parallax layers.
4. **Scaffolder (`scaffoldEpisode`) generating polished archetype/choreography starter code per style (`"hybrid"`, `"hd2d"`, `"b1-stickman"`) that passes `audit-style` and `tsc --noEmit`:** Newly scaffolded parts use `SafeLayout`, `CameraRig25D`, and `TYPE_SCALE` without triggering any style audit warnings.
5. **Optional `stylePreset` in `TopicDefinition` and `EpisodePlayer`:** When `stylePreset: "b1-editorial" | "neo-25d-light"` is used, `EpisodePlayer` can render `<PaperStageOverlay />` while preserving `<HD2DOverlay />` as the default for `"hd2d-cinematic"` / existing episodes.

---

### Task 1: Typography Scale, Style Presets, 4-Beat Choreography & Caption-Aware Safe Bounds

**Files:**
- Modify: `src/engine/theme.ts`
- Create: `src/engine/motion/choreography.ts`
- Create: `src/engine/layout/SafeLayout.tsx`
- Test: `tests/engine-utils.test.mjs`

**Interfaces:**
- Consumes: `SAFE_ZONE`, `C`, `clamp`, `lerp`, `lsin` from `src/engine/theme.ts`; `CaptionPlacement` from `src/engine/episode/episode.types.ts`
- Produces:
  - `src/engine/theme.ts`:
    - `export const TYPE_SCALE = { hero: 84, title: 68, subtitle: 48, body: 40, caption: 32 } as const;`
    - `export type StylePresetName = "hd2d-cinematic" | "b1-editorial" | "neo-25d-dark" | "neo-25d-light";`
    - `export const STYLE_PRESETS: Record<StylePresetName, { background: "hd2d-night" | "b1-paper" | "dark-25d" | "light-25d"; finishing: "hd2d" | "paper" | "none"; textPrimary: string; textMuted: string; accent: string; secondary: string; surface: string; border: string }>`
  - `src/engine/motion/choreography.ts`:
    - `export const SPRINGS = { snappy: { damping: 18, stiffness: 180, mass: 0.8 }, bouncy: { damping: 13, stiffness: 140, mass: 0.9 }, smooth: { damping: 22, stiffness: 110, mass: 1.0 }, heavy: { damping: 26, stiffness: 80, mass: 1.3 } } as const;`
    - `export type PartBeats = { enter: number; act: number; payoff: number; settle: number; progress: number; breath: number };`
    - `export function computePartBeats(localFrame: number, durationInFrames: number): PartBeats`
    - `export function staggerFrame(localFrame: number, index: number, stepFrames?: number, startFrame?: number): number`
  - `src/engine/layout/SafeLayout.tsx`:
    - `export type SafeSlotName = "header" | "stage" | "split-top" | "split-bottom" | "footer";`
    - `export function computeSafeBounds(options?: { showCaptions?: boolean; captionPlacement?: CaptionPlacement }): { left: number; top: number; width: number; height: number; bottom: number }`
    - `export function SafeLayout(props: { children?: React.ReactNode; showCaptions?: boolean; captionPlacement?: CaptionPlacement; gap?: number; style?: React.CSSProperties }): React.JSX.Element`
    - `export function StageSlot(props: { slot?: SafeSlotName; children?: React.ReactNode; style?: React.CSSProperties }): React.JSX.Element`

- [ ] **Step 1: Add failing tests for `TYPE_SCALE`, `STYLE_PRESETS`, `computePartBeats`, and `computeSafeBounds` in `tests/engine-utils.test.mjs`**

Append tests asserting:
- `TYPE_SCALE.caption >= 28` and all 4 `STYLE_PRESETS` exist.
- `computePartBeats(0, 300)` starts with `enter === 0, progress === 0`, reaches `enter === 1` by 18% of duration, reaches `payoff === 1` by 85% of duration, and handles `durationInFrames <= 1` without `NaN`.
- `computeSafeBounds({ showCaptions: true, captionPlacement: "top-safe" })` returns `{ left: 64, top: 396, width: 876, height: 1144, bottom: 1540 }`, `"bottom-safe"` returns `{ left: 64, top: 180, width: 876, height: 1184, bottom: 1364 }`, and `{ showCaptions: false }` returns `{ left: 64, top: 180, width: 876, height: 1360, bottom: 1540 }`.

- [ ] **Step 2: Run `node --test tests/engine-utils.test.mjs` to verify it fails**

Run: `node --test tests/engine-utils.test.mjs`
Expected: FAIL because `choreography.ts` and `SafeLayout.tsx` do not exist yet.

- [ ] **Step 3: Implement `TYPE_SCALE` & `STYLE_PRESETS` in `src/engine/theme.ts`, create `src/engine/motion/choreography.ts`, and create `src/engine/layout/SafeLayout.tsx`**

Implement the exact exported functions and components.

- [ ] **Step 4: Run `node --test tests/engine-utils.test.mjs` to verify it passes**

Run: `node --test tests/engine-utils.test.mjs`
Expected: PASS.

---

### Task 2: Finishing Overlay, Camera Rig, Connector25D & 4 Composable Scene Archetypes

**Files:**
- Create: `src/engine/layout/PaperStageOverlay.tsx`
- Create: `src/engine/motion/CameraRig25D.tsx`
- Create: `src/engine/motion/Connector25D.tsx`
- Create: `src/engine/archetypes/TitleHookScene.tsx`
- Create: `src/engine/archetypes/ComparisonCardsScene.tsx`
- Create: `src/engine/archetypes/ProcessFlowScene.tsx`
- Create: `src/engine/archetypes/SpotlightCalloutScene.tsx`
- Modify: `src/engine/episode/episode.types.ts`
- Modify: `src/engine/episode/EpisodePlayer.tsx`
- Modify: `src/engine/index.ts`

**Interfaces:**
- Consumes: `TYPE_SCALE`, `STYLE_PRESETS`, `StylePresetName`, `SAFE_ZONE`, `C`, `FONT_UI`, `FONT_PX` from `src/engine/theme.ts`; `SPRINGS`, `computePartBeats`, `staggerFrame` from `src/engine/motion/choreography.ts`; `SafeLayout`, `StageSlot` from `src/engine/layout/SafeLayout.tsx`
- Produces:
  - `src/engine/layout/PaperStageOverlay.tsx`: `export function PaperStageOverlay(): React.JSX.Element`
  - `src/engine/motion/CameraRig25D.tsx`: `export type CameraPreset = "slow-push" | "gentle-drift" | "focus-top" | "focus-bottom" | "static"; export function CameraRig25D(props: { preset?: CameraPreset; intensity?: number; children?: React.ReactNode }): React.JSX.Element`
  - `src/engine/motion/Connector25D.tsx`: `export function Connector25D(props: { from: { x: number; y: number }; to: { x: number; y: number }; progress: number; color?: string; strokeWidth?: number; curved?: boolean }): React.JSX.Element`
  - `src/engine/archetypes/TitleHookScene.tsx`: `export function TitleHookScene(props: { eyebrow?: string; title: string; subtitle?: string; preset?: StylePresetName; camera?: CameraPreset; showCaptions?: boolean; captionPlacement?: CaptionPlacement; children?: React.ReactNode }): React.JSX.Element`
  - `src/engine/archetypes/ComparisonCardsScene.tsx`: `export type ComparisonItem = { badge: string; title: string; body: string; accentColor?: string }; export function ComparisonCardsScene(props: { heading: string; items: ComparisonItem[]; preset?: StylePresetName; showCaptions?: boolean; captionPlacement?: CaptionPlacement }): React.JSX.Element`
  - `src/engine/archetypes/ProcessFlowScene.tsx`: `export type ProcessStep = { step: string; title: string; detail: string }; export function ProcessFlowScene(props: { heading: string; steps: ProcessStep[]; preset?: StylePresetName; showCaptions?: boolean; captionPlacement?: CaptionPlacement }): React.JSX.Element`
  - `src/engine/archetypes/SpotlightCalloutScene.tsx`: `export type CalloutPoint = { id: string; label: string; targetX: number; targetY: number; boxX: number; boxY: number; boxWidth?: number }; export function SpotlightCalloutScene(props: { heading?: string; points: CalloutPoint[]; preset?: StylePresetName; showCaptions?: boolean; captionPlacement?: CaptionPlacement; children?: React.ReactNode }): React.JSX.Element`

- [ ] **Step 1: Implement `PaperStageOverlay.tsx`, `CameraRig25D.tsx`, and `Connector25D.tsx`**

Use `useCurrentFrame()`, `useVideoConfig()`, `interpolate()`, and `Easing` with deterministic math only.

- [ ] **Step 2: Implement the 4 composable scene archetypes in `src/engine/archetypes/*`**

Build `TitleHookScene.tsx`, `ComparisonCardsScene.tsx`, `ProcessFlowScene.tsx`, and `SpotlightCalloutScene.tsx` using `SafeLayout`, `StageSlot`, `STYLE_PRESETS`, `TYPE_SCALE`, `SPRINGS`, `computePartBeats`, `Card25D`/`PaperCard`, `KineticText`, and `Connector25D`.

- [ ] **Step 3: Support optional `finishing?: "hd2d" | "paper" | "none"` in `EpisodePlayer.tsx` and re-export all new modules in `src/engine/index.ts`**

Keep `hd2dOverlay = true` default behavior unchanged so `safe-room/ep-01` is 100% unaffected; when `finishing === "paper"`, render `<PaperStageOverlay />`.

- [ ] **Step 4: Run `npm run lint` to verify zero ESLint or TypeScript errors**

Run: `npm run lint`
Expected: Exit code `0`.

---

### Task 3: Static Style & SafeZone Auditor CLI (`audit-style.mjs`)

**Files:**
- Create: `.agents/skills/remotion-storytelling/scripts/audit-style.mjs`
- Modify: `package.json` (add `"audit-style": "node .agents/skills/remotion-storytelling/scripts/audit-style.mjs"`)
- Test: `tests/audit-style.test.mjs`

**Interfaces:**
- Consumes: `src/topics/**`
- Produces:
  - `.agents/skills/remotion-storytelling/scripts/audit-style.mjs`:
    - `export function auditSourceText(source: string, filePath?: string): Array<{ file: string; line: number; rule: "determinism" | "css-motion" | "min-font-size" | "safe-zone"; message: string }>`
    - `export function auditWorkspaceStyle(options?: { rootDir?: string; topic?: string }): { checkedFiles: number; issues: Array<{ file: string; line: number; rule: string; message: string }> }`

- [ ] **Step 1: Write the failing test `tests/audit-style.test.mjs`**

```js
import assert from "node:assert/strict";
import test from "node:test";
import {
  auditSourceText,
  auditWorkspaceStyle,
} from "../.agents/skills/remotion-storytelling/scripts/audit-style.mjs";

test("auditSourceText flags non-determinism, CSS transitions, tiny fontSize, and out-of-SafeZone text coordinates", () => {
  const bad = [
    "export function BadPart() {",
    "  const r = Math.random();",
    '  return <div style={{ transition: "all 0.3s", fontSize: 18, top: 40, left: 20 }}>Hi {r}</div>;',
    "}",
  ].join("\n");
  const issues = auditSourceText(bad, "Part01.tsx");
  const rules = issues.map((i) => i.rule);
  assert.ok(rules.includes("determinism"));
  assert.ok(rules.includes("css-motion"));
  assert.ok(rules.includes("min-font-size"));
  assert.ok(rules.includes("safe-zone"));
});

test("auditSourceText honors safezone-exempt comments and passes clean engine components", () => {
  const clean = [
    "export function CleanPart() {",
    "  return (",
    "    <>",
    "      <div style={{ left: -200, top: 0 }} /> {/* safezone-exempt */}",
    "      <div style={{ left: 80, top: 240, fontSize: 40 }}>Valid</div>",
    "    </>",
    "  );",
    "}",
  ].join("\n");
  assert.deepEqual(auditSourceText(clean, "Part01.tsx"), []);
});

test("auditWorkspaceStyle passes on the current repository topics", () => {
  const result = auditWorkspaceStyle();
  assert.ok(result.checkedFiles > 0);
  assert.deepEqual(result.issues, []);
});
```

- [ ] **Step 2: Run `node --test tests/audit-style.test.mjs` to verify it fails**

Run: `node --test tests/audit-style.test.mjs`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `audit-style.mjs`.

- [ ] **Step 3: Implement `.agents/skills/remotion-storytelling/scripts/audit-style.mjs` and add `"audit-style"` script to `package.json`**

In `audit-style.mjs`:
- Scan `parts/*.tsx` files under `src/topics/<topic>/episodes/*/parts/` (where newly authored part layouts live), or any file passed to `auditSourceText()`.
- Check each line (ignoring lines containing `safezone-exempt`):
  - `determinism`: `\b(?:Math\.random|Date\.now|setTimeout|setInterval)\s*\(`
  - `css-motion`: `\b(?:transition|animation|WebkitTransition|WebkitAnimation)\s*:`
  - `min-font-size`: `\bfontSize\s*:\s*(\d+)\b` where `Number(m[1]) < 28`
  - `safe-zone`: `\btop\s*:\s*(-?\d+)\b` where `top < 160 || top > 1560`, or `\bleft\s*:\s*(-?\d+)\b` where `left < 0 || left > 940`.

- [ ] **Step 4: Run `node --test tests/audit-style.test.mjs` to verify it passes**

Run: `node --test tests/audit-style.test.mjs`
Expected: PASS (3/3 tests passing).

---

### Task 4: Upgrade Scaffolder, Art Direction Playbook & Codex Skill Documentation

**Files:**
- Modify: `.agents/skills/remotion-storytelling/scripts/scaffold.mjs`
- Create: `.agents/skills/remotion-storytelling/references/art-direction-playbook.md`
- Modify: `.agents/skills/remotion-storytelling/SKILL.md`
- Modify: `.agents/skills/remotion-storytelling/references/engine-api.md`
- Modify: `.agents/skills/remotion-storytelling/references/workflow.md`
- Modify: `README.md`
- Modify: `tests/scaffold.test.mjs`

**Interfaces:**
- Consumes: `TitleHookScene`, `SafeLayout`, `CameraRig25D`, `Stickman`, `BackgroundLayer`, `auditWorkspaceStyle`
- Produces:
  - Updated `partSource(style)` in `scaffold.mjs` that scaffolds polished starter parts using `SafeLayout`, `CameraRig25D`, and `TitleHookScene` / `Stickman` that pass `auditWorkspaceStyle()` out of the box.
  - `.agents/skills/remotion-storytelling/references/art-direction-playbook.md`: Complete visual hierarchy, 4-beat choreography, archetype selection guide, and color ratio rules.

- [ ] **Step 1: Update `tests/scaffold.test.mjs` to assert that `references/art-direction-playbook.md` exists and scaffolded episodes pass `auditWorkspaceStyle()`**

Add assertions in `tests/scaffold.test.mjs` checking `art-direction-playbook.md` and running `auditWorkspaceStyle({ rootDir })` on a scaffolded topic.

- [ ] **Step 2: Run `node --test tests/scaffold.test.mjs` to verify it fails**

Run: `node --test tests/scaffold.test.mjs`
Expected: FAIL because `art-direction-playbook.md` does not exist yet.

- [ ] **Step 3: Create `references/art-direction-playbook.md`, update `scaffold.mjs`, `SKILL.md` (keep <= 120 lines), `references/engine-api.md`, `references/workflow.md`, and `README.md`**

Document the 4 Scene Archetypes, `SafeLayout`/`StageSlot`, `computePartBeats`, `SPRINGS`, `TYPE_SCALE`, `STYLE_PRESETS`, and `npm run audit-style`.

- [ ] **Step 4: Run full verification (`npm test`, `npm run lint`, `npm run audit-style`)**

Run: `npm test && npm run lint && npm run audit-style`
Expected: All tests PASS, linter/typecheck exits `0`, and `audit-style` reports `0` issues.
