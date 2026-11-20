# Remotion HD-2D & Stickman Storytelling Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify `REMOTION-StoryTelling` into a single Remotion 4.0.545 workspace that absorbs the HD-2D engine and `SafeRoomHD2D` episode from `remotion-claude/`, adds a 9:16 Social SafeZone + Stickman B1 hybrid toolkit, automates external per-part audio + optional caption syncing, installs a token-optimized local Codex skill (`.agents/skills/remotion-storytelling/`), removes legacy `kenapa-ai/` and `remotion-claude/` folders, and documents the workflow in `README.md`.

**Architecture:** A single root Remotion monorepo separates reusable rendering primitives (`src/engine/` for HD-2D 3D planes/billboards/lighting/particles/overlays, Stickman B1 parametric SVG, 2.5D cards/kinetic text, 9:16 `<SafeStage>`, and `<EpisodePlayer>`) from isolated topic folders (`src/topics/<topic>/episodes/<episode>/parts/PartXX.tsx` and `public/topics/<topic>/<episode>/parts/`). Lightweight Node CLI scripts inside `.agents/skills/remotion-storytelling/scripts/` probe sliced external audio durations in pure JS (`audio-duration.mjs`), parse optional `.srt`/`.json` captions into `episode.data.json` (`sync-episode.mjs`), and scaffold new topics/episodes (`scaffold.mjs`).

**Tech Stack:** Remotion `4.0.545` (`remotion`, `@remotion/cli`, `@remotion/fonts`, `@remotion/media`, `@remotion/transitions`), React `19.3.1`, TypeScript `5.9.3`, Node.js `>=20` built-in test runner (`node --test`).

**Spec:** `docs/superpowers/specs/2026-11-20-remotion-storytelling-engine-design.md`

## Global Constraints

- Canvas dimensions: `1080 × 1920` (9:16 vertical) at `30` fps (`W = 1080`, `H = 1920`, `FPS = 30`).
- SafeZone bounds (`1080×1920`): top unsafe `0..180`, left margin `0..64`, right unsafe `940..1080` (`y: 820..1540`), bottom unsafe `1540..1920`; primary safe content box `left: 64, top: 180, width: 876, height: 1200` (`1360` without bottom caption band); bottom caption band `top: 1380..1540`.
- TypeScript path aliases: `@engine/*` -> `./src/engine/*`, `@topics/*` -> `./src/topics/*`.
- No global `ffprobe` binary dependency required for `.mp3` or `.wav` files: `audio-duration.mjs` must parse `.mp3` and `.wav` durations in pure Node.js (`ffprobe` used only as optional fallback for other formats).
- Captions are always optional: missing `.srt`/`.json` files for any part must produce `hasCaptions: false, captions: []` without errors.
- Legacy cleanup: `kenapa-ai/` must be deleted without absorbing its files; `remotion-claude/` must be deleted after its HD-2D engine, fonts, scenes, and audio (`audio-1.mp3`..`audio-5.mp3`) are absorbed and verified.

## Review Focus

1. **MP3 files with ID3v2 headers/ID3v1 trailers and WAV files with extra RIFF chunks (`JUNK`, `LIST`) when `ffprobe` is absent from Windows `PATH`:** `getAudioDurationInSeconds()` skips non-audio chunks/tags and returns exact positive seconds in pure JS.
2. **External part audio without caption files, with empty `.srt`, or with CRLF (`\r\n`) and dot-millisecond (`00:00:01.250`) timestamps:** `syncEpisode()` succeeds with `hasCaptions: false, captions: []` when uncaptioned, and parses both comma and dot millisecond separators with CRLF.
3. **Natural alphanumeric ordering for 10+ parts (`01-*`, `02-*`, ..., `10-*`):** `syncEpisode()` orders `02-*` before `10-*` using numeric collation.
4. **Proportional frame remapping (`remapFrame`) on edge-case 1-frame parts or out-of-range frames:** `remapFrame()` clamps safely to `[designStart, designEnd]` without `NaN` or division by zero.
5. **Scaffolding collisions and invalid topic/episode slugs (`../evil`, `My Topic`, existing episode dir):** `scaffold()` validates lowercase kebab-case slugs (`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`) and refuses to overwrite existing files unless `force: true`.

---

### Task 1: Root Remotion Config, Local Fonts & Pure-JS Audio Duration Parser

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `remotion.config.ts`
- Create: `eslint.config.mjs`
- Create: `.prettierrc`
- Create: `.gitignore`
- Create: `public/fonts/plus-jakarta-sans-latin-600-normal.woff2` (copied from `remotion-claude/safe-room-hd2d-project/public/fonts/`)
- Create: `public/fonts/plus-jakarta-sans-latin-700-normal.woff2` (copied from `remotion-claude/safe-room-hd2d-project/public/fonts/`)
- Create: `public/fonts/silkscreen-latin-400-normal.woff2` (copied from `remotion-claude/safe-room-hd2d-project/public/fonts/`)
- Create: `public/fonts/silkscreen-latin-700-normal.woff2` (copied from `remotion-claude/safe-room-hd2d-project/public/fonts/`)
- Create: `.agents/skills/remotion-storytelling/scripts/audio-duration.mjs`
- Test: `tests/audio-duration.test.mjs`

**Interfaces:**
- Consumes: `remotion-claude/safe-room-hd2d-project/public/fonts/*.woff2` and `remotion-claude/safe-room-hd2d-project/public/audio/audio-1.mp3`..`audio-5.mp3`
- Produces:
  - `.agents/skills/remotion-storytelling/scripts/audio-duration.mjs`:
    - `export function parseWavDurationFromBuffer(buf: Buffer): number`
    - `export function parseMp3DurationFromBuffer(buf: Buffer): number`
    - `export function getAudioDurationInSeconds(filePath: string): number`

- [ ] **Step 1: Create root `package.json`, `tsconfig.json`, `remotion.config.ts`, `eslint.config.mjs`, `.prettierrc`, `.gitignore`, and copy `public/fonts/*.woff2`**

In `package.json`, set `"name": "remotion-storytelling"`, `"type": "module"`, scripts:
```json
{
  "scripts": {
    "dev": "remotion studio",
    "build": "remotion bundle",
    "render": "remotion render",
    "sync": "node .agents/skills/remotion-storytelling/scripts/sync-episode.mjs",
    "scaffold": "node .agents/skills/remotion-storytelling/scripts/scaffold.mjs",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src && tsc --noEmit",
    "test": "node --test tests/*.test.mjs"
  }
}
```
Include dependencies from `remotion-claude/safe-room-hd2d-project/package.json` (`remotion`, `@remotion/cli`, `@remotion/fonts`, `@remotion/google-fonts`, `@remotion/media`, `@remotion/transitions`, `react`, `react-dom`, devDependencies `@remotion/eslint-config-flat`, `@types/react`, `@types/web`, `eslint`, `prettier`, `typescript`).
In `tsconfig.json`, add `"baseUrl": "."` and `"paths": { "@engine/*": ["./src/engine/*"], "@topics/*": ["./src/topics/*"] }` and `"exclude": ["remotion.config.ts", "remotion-claude", "kenapa-ai", "node_modules"]`.
Copy the 4 `.woff2` files from `remotion-claude/safe-room-hd2d-project/public/fonts/` into `public/fonts/`.

- [ ] **Step 2: Write the failing test `tests/audio-duration.test.mjs`**

```js
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import {
  parseWavDurationFromBuffer,
  parseMp3DurationFromBuffer,
  getAudioDurationInSeconds,
} from "../.agents/skills/remotion-storytelling/scripts/audio-duration.mjs";

test("parseWavDurationFromBuffer skips JUNK/LIST chunks and computes exact duration", () => {
  // RIFF header (12) + JUNK chunk (16) + fmt chunk (24) + data chunk header (8) + 44100 bytes (0.5s at 44100Hz mono 16-bit)
  const sampleRate = 44100;
  const byteRate = sampleRate * 2;
  const dataSize = 44100; // 0.5 seconds
  const buf = Buffer.alloc(12 + 16 + 24 + 8 + dataSize);
  buf.write("RIFF", 0, "ascii");
  buf.writeUInt32LE(buf.length - 8, 4);
  buf.write("WAVE", 8, "ascii");
  buf.write("JUNK", 12, "ascii");
  buf.writeUInt32LE(8, 16);
  buf.write("fmt ", 28, "ascii");
  buf.writeUInt32LE(16, 32);
  buf.writeUInt16LE(1, 36); // PCM
  buf.writeUInt16LE(1, 38); // mono
  buf.writeUInt32LE(sampleRate, 40);
  buf.writeUInt32LE(byteRate, 44);
  buf.writeUInt16LE(2, 48);
  buf.writeUInt16LE(16, 50);
  buf.write("data", 52, "ascii");
  buf.writeUInt32LE(dataSize, 56);
  assert.equal(parseWavDurationFromBuffer(buf), 0.5);
});

test("getAudioDurationInSeconds parses real safe-room MP3 files with ID3 tags", () => {
  const f1 = path.resolve("remotion-claude/safe-room-hd2d-project/public/audio/audio-1.mp3");
  const f5 = path.resolve("remotion-claude/safe-room-hd2d-project/public/audio/audio-5.mp3");
  const d1 = getAudioDurationInSeconds(f1);
  const d5 = getAudioDurationInSeconds(f5);
  assert.ok(Math.abs(d1 - 10.998) < 0.05, `Expected ~10.998s, got ${d1}`);
  assert.ok(Math.abs(d5 - 8.516) < 0.05, `Expected ~8.516s, got ${d5}`);
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test tests/audio-duration.test.mjs`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `audio-duration.mjs`.

- [ ] **Step 4: Implement `.agents/skills/remotion-storytelling/scripts/audio-duration.mjs`**

Implement `parseWavDurationFromBuffer(buf)` (walks RIFF chunks starting at offset 12, reads `byteRate` from `fmt ` chunk and byte length from `data` chunk, advancing by `8 + chunkSize + (chunkSize % 2)`), `parseMp3DurationFromBuffer(buf)` (skips leading `ID3` v2 synchsafe header, walks MPEG Layer III frames summing `samplesPerFrame / sampleRate`), and `getAudioDurationInSeconds(filePath)` (dispatches by `.wav` / `.mp3` extension, falling back to `ffprobe` via `spawnSync` for `.m4a`/`.ogg`).

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tests/audio-duration.test.mjs`
Expected: PASS (2 tests passing).

---

### Task 2: External Audio & Optional Caption Episode Sync CLI (`sync-episode.mjs`)

**Files:**
- Create: `.agents/skills/remotion-storytelling/scripts/sync-episode.mjs`
- Test: `tests/sync-episode.test.mjs`

**Interfaces:**
- Consumes: `getAudioDurationInSeconds(filePath: string): number` from `./audio-duration.mjs`
- Produces:
  - `.agents/skills/remotion-storytelling/scripts/sync-episode.mjs`:
    - `export function parseSrtContent(srtText: string): Array<{ text: string; startMs: number; endMs: number }>`
    - `export function syncEpisode(options: { rootDir?: string; target: string; fps?: number }): { outputFile: string; data: object }`

- [ ] **Step 1: Write the failing test `tests/sync-episode.test.mjs`**

```js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  parseSrtContent,
  syncEpisode,
} from "../.agents/skills/remotion-storytelling/scripts/sync-episode.mjs";

function makeTinyWav(durationSec = 1.0, sampleRate = 8000) {
  const dataSize = Math.round(durationSec * sampleRate * 2);
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0, "ascii");
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8, "ascii");
  buf.write("fmt ", 12, "ascii");
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36, "ascii");
  buf.writeUInt32LE(dataSize, 40);
  return buf;
}

test("parseSrtContent handles CRLF, comma and dot milliseconds, and empty input", () => {
  assert.deepEqual(parseSrtContent("   \r\n "), []);
  const srt = "1\r\n00:00:00,250 --> 00:00:02.500\r\nSaat darah tinggal sekarat...\r\n\r\n2\n00:00:02,800 --> 00:00:04,100\nBaris kedua\n";
  assert.deepEqual(parseSrtContent(srt), [
    { text: "Saat darah tinggal sekarat...", startMs: 250, endMs: 2500 },
    { text: "Baris kedua", startMs: 2800, endMs: 4100 },
  ]);
});

test("syncEpisode sorts 10+ parts naturally and supports parts with and without captions", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "remotion-sync-"));
  const partsDir = path.join(tmp, "public", "topics", "demo", "ep-01", "parts");
  fs.mkdirSync(partsDir, { recursive: true });
  fs.writeFileSync(path.join(partsDir, "02-middle.wav"), makeTinyWav(2.0));
  fs.writeFileSync(path.join(partsDir, "10-ending.wav"), makeTinyWav(1.5));
  fs.writeFileSync(path.join(partsDir, "01-opening.wav"), makeTinyWav(1.0));
  fs.writeFileSync(
    path.join(partsDir, "01-opening.srt"),
    "1\n00:00:00,100 --> 00:00:00,900\nHalo dunia\n",
    "utf8",
  );

  const { outputFile, data } = syncEpisode({ rootDir: tmp, target: "demo/ep-01", fps: 30 });
  assert.ok(fs.existsSync(outputFile));
  assert.equal(data.totalDurationInFrames, 30 + 60 + 45);
  assert.deepEqual(
    data.parts.map((p) => p.id),
    ["01-opening", "02-middle", "10-ending"],
  );
  assert.equal(data.parts[0].hasCaptions, true);
  assert.equal(data.parts[0].captions.length, 1);
  assert.equal(data.parts[1].hasCaptions, false);
  assert.deepEqual(data.parts[1].captions, []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/sync-episode.test.mjs`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `sync-episode.mjs`.

- [ ] **Step 3: Implement `.agents/skills/remotion-storytelling/scripts/sync-episode.mjs`**

Implement `parseSrtContent(srtText)` and `syncEpisode({ rootDir = process.cwd(), target, fps = 30 })`:
- Splits `target` (`<topic>/<episode>` or `--topic` / `--episode`).
- Scans `public/topics/<topic>/<episode>/parts/` for `.mp3`, `.wav`, `.m4a`, `.ogg`.
- Sorts filenames with `new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }).compare`.
- For each audio file (`index` starting at 1), computes `durationInSeconds`, `durationInFrames = Math.max(1, Math.ceil(durationInSeconds * fps))`, `startFrame` (cumulative sum of preceding parts), `audioSrc: "topics/<topic>/<episode>/parts/<filename>"`, and checks `<stem>.srt` or `<stem>.json`.
- Detects optional `public/topics/<topic>/<episode>/bgm.mp3` (or `.wav`).
- Writes `src/topics/<topic>/episodes/<episode>/episode.data.json` and returns `{ outputFile, data }`.
- When executed directly via CLI (`node sync-episode.mjs <topic>/<episode>`), prints a compact JSON summary.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/sync-episode.test.mjs`
Expected: PASS (2 tests passing).

---

### Task 3: Core Engine — Theme, 9:16 SafeStage, Fonts, Audio/Caption & EpisodePlayer

**Files:**
- Create: `src/engine/theme.ts`
- Create: `src/engine/fonts.ts`
- Create: `src/engine/layout/SafeStage.tsx`
- Create: `src/engine/layout/BackgroundLayer.tsx`
- Create: `src/engine/audio/PartAudio.tsx`
- Create: `src/engine/audio/CaptionOverlay.tsx`
- Create: `src/engine/episode/episode.types.ts`
- Create: `src/engine/episode/EpisodePlayer.tsx`
- Test: `tests/engine-utils.test.mjs`

**Interfaces:**
- Consumes: `public/fonts/*.woff2`, Remotion `4.0.545` (`AbsoluteFill`, `Sequence`, `useCurrentFrame`, `useVideoConfig`, `interpolate`, `Easing`, `Interactive`, `staticFile`), `@remotion/media` (`Audio`), `@remotion/transitions` (`TransitionSeries`)
- Produces:
  - `src/engine/theme.ts`:
    - `export const W = 1080; export const H = 1920; export const FPS = 30;`
    - `export const SAFE_ZONE = { top: 180, bottom: 380, left: 64, right: 140, width: 876, height: 1360, primaryHeight: 1200, captionBandTop: 1380, captionBandBottom: 1540 } as const;`
    - `export const C = { nightDeep: "#090E1A", nightMid: "#162238", nightFog: "#1E3A5F", warmCore: "#FFF3C4", warmMid: "#FF9F43", warmAmbient: "#D97706", hpLow: "#EF4444", hpFull: "#22C55E", uiLine: "#F8FAFC", b1Paper: "#FDFDFC", b1Ink: "#262E31", b1Blue: "#356774", b1Yellow: "#F2C759" } as const;`
    - `export const FONT_UI: string; export const FONT_PX: string;`
    - `export function mulberry32(seed: number): () => number`
    - `export function lsin(f: number, period: number, phase?: number): number`
    - `export function lcos(f: number, period: number, phase?: number): number`
    - `export function smooth(f: number, a: number, b: number): number`
    - `export function lerp(a: number, b: number, t: number): number`
    - `export function clamp(v: number, lo?: number, hi?: number): number`
    - `export function mix(a: string, b: string, t: number): string`
    - `export function shade(h: string, amt: number): string`
    - `export function remapFrame(localFrame: number, localDurationInFrames: number, designStart: number, designEnd: number): number`
  - `src/engine/episode/episode.types.ts`:
    - `export type CaptionCue = { text: string; startMs: number; endMs: number };`
    - `export type PartMeta = { id: string; index: number; audioSrc: string; durationInSeconds: number; durationInFrames: number; startFrame: number; hasCaptions: boolean; captions: CaptionCue[] };`
    - `export type EpisodeData = { topic: string; episode: string; fps: number; width: number; height: number; totalDurationInFrames: number; bgm: { src: string; volume: number } | null; parts: PartMeta[] };`
    - `export type EpisodeProps = { showSafeZones?: boolean; showCaptions?: boolean; captionPlacement?: "top-safe" | "bottom-safe"; hd2dOverlay?: boolean; bgmVolume?: number };`

- [ ] **Step 1: Write the failing test `tests/engine-utils.test.mjs`**

```js
import test from "node:test";
import assert from "node:assert/strict";

// Pure math/remap contract test
function clamp(v, lo = 0, hi = 1) {
  return Math.min(hi, Math.max(lo, v));
}
function remapFrameCalc(localFrame, localDurationInFrames, designStart, designEnd) {
  if (!Number.isFinite(localDurationInFrames) || localDurationInFrames <= 1) {
    return designStart;
  }
  const t = clamp(localFrame / (localDurationInFrames - 1), 0, 1);
  return designStart + (designEnd - designStart) * t;
}

test("remapFrame maps endpoints and handles 1-frame or out-of-range inputs safely", () => {
  assert.equal(remapFrameCalc(0, 330, 0, 210), 0);
  assert.equal(remapFrameCalc(329, 330, 0, 210), 210);
  assert.equal(remapFrameCalc(0, 1, 210, 480), 210);
  assert.equal(remapFrameCalc(-10, 100, 210, 480), 210);
  assert.equal(remapFrameCalc(500, 100, 210, 480), 480);
});
```

- [ ] **Step 2: Create `src/engine/theme.ts`, `src/engine/fonts.ts`, `src/engine/layout/SafeStage.tsx`, `src/engine/layout/BackgroundLayer.tsx`, `src/engine/audio/PartAudio.tsx`, `src/engine/audio/CaptionOverlay.tsx`, `src/engine/episode/episode.types.ts`, and `src/engine/episode/EpisodePlayer.tsx`**

In `src/engine/theme.ts`, export `W`, `H`, `FPS`, `SAFE_ZONE`, `C`, `FONT_UI`, `FONT_PX`, `mulberry32`, `lsin`, `lcos`, `smooth`, `lerp`, `clamp`, `mix`, `shade`, and `remapFrame` (using the safe clamp formula above so it can also be imported in Node tests without needing React context).
In `src/engine/layout/SafeStage.tsx`, render `<AbsoluteFill>` plus an optional debug overlay when `showSafeZones` is `true` marking Top UI (`0..180`), Right Action Stack (`940..1080`, `820..1540`), Bottom Description (`1540..1920`), Primary Safe Area (`64..940`, `180..1380`), and Caption Band (`64..940`, `1380..1540`).
In `src/engine/audio/CaptionOverlay.tsx`, support both:
- `CaptionOverlay` (frame-range `{ text, from, to, top?, name }` from `SafeRoomHD2D`) and
- `PartCaptionTrack` (`{ captions: CaptionCue[]; placement?: "top-safe" | "bottom-safe" }` converting `useCurrentFrame() / fps * 1000` into active cue display inside SafeZone bounds `left: 64, right: 140`, `top: 268` for `"top-safe"` or `top: 1400` for `"bottom-safe"`).
In `src/engine/episode/EpisodePlayer.tsx`, accept `{ data: EpisodeData; parts: React.ComponentType[]; overlay?: React.ReactNode } & EpisodeProps` and render each part inside `<TransitionSeries.Sequence key={part.id} name={part.id} durationInFrames={part.durationInFrames}>` with `<PartAudio src={part.audioSrc} />`, the corresponding `PartComponent`, and `<PartCaptionTrack>` when `showCaptions && part.hasCaptions`, wrapped in `<SafeStage showSafeZones={showSafeZones}>`.

- [ ] **Step 3: Update `tests/engine-utils.test.mjs` to import from `src/engine/theme.ts` (or verify via Node `--experimental-strip-types`) and run test**

Run: `node --test tests/engine-utils.test.mjs`
Expected: PASS.

---

### Task 4: Absorb HD-2D Engine & Build Stickman B1 + 2.5D Hybrid Primitives (`src/engine/`)

**Files:**
- Create: `src/engine/hd2d/world.tsx`
- Create: `src/engine/hd2d/HD2DOverlay.tsx`
- Create: `src/engine/hd2d/DynamicLight.tsx`
- Create: `src/engine/hd2d/ParticleField.tsx`
- Create: `src/engine/hd2d/Px.tsx`
- Create: `src/engine/stickman/Stickman.tsx`
- Create: `src/engine/stickman/HandDrawnProps.tsx`
- Create: `src/engine/motion25d/Card25D.tsx`
- Create: `src/engine/motion25d/KineticText.tsx`
- Create: `src/engine/index.ts`

**Interfaces:**
- Consumes: `src/engine/theme.ts`, `src/engine/layout/*`, `src/engine/audio/*`, `src/engine/episode/*`
- Produces:
  - `src/engine/hd2d/world.tsx`: `CAM`, `FAR_PX`, `PLANE_W`, `project`, `project3`, `GroundPlane`, `GroundItem`, `Billboard`, `FullLayer`, `Room`
  - `src/engine/hd2d/HD2DOverlay.tsx`: `HD2DOverlay`
  - `src/engine/hd2d/DynamicLight.tsx`: `DynamicLight`
  - `src/engine/hd2d/ParticleField.tsx`: `Rain`, `Embers`, `Dust`
  - `src/engine/hd2d/Px.tsx`: `R`, `r`, `box`, `Px`
  - `src/engine/stickman/Stickman.tsx`: `Stickman` (`pose: "idle" | "think" | "point" | "hold" | "celebrate" | "walk"`, `expression: "neutral" | "curious" | "happy" | "surprised"`, `facing?: "left" | "right"`, `x?: number`, `y?: number`, `scale?: number`, `accentColor?: string`)
  - `src/engine/stickman/HandDrawnProps.tsx`: `PaperCard`, `SketchArrow`, `SketchCircle`, `InkUnderline`
  - `src/engine/motion25d/Card25D.tsx`: `Card25D`
  - `src/engine/motion25d/KineticText.tsx`: `KineticText`
  - `src/engine/index.ts`: Barrel exporting all engine modules

- [ ] **Step 1: Absorb `world.tsx`, `HD2DOverlay.tsx` (from `HD2DStage.tsx`), `DynamicLight.tsx`, `ParticleField.tsx`, and `Px.tsx` into `src/engine/hd2d/`**

Update their relative imports (`../theme` -> `@engine/theme`). Keep all exact projection formulas, CSS-3D transforms, and props intact so `SafeRoomHD2D` scenes render identically.

- [ ] **Step 2: Create `src/engine/stickman/Stickman.tsx`, `src/engine/stickman/HandDrawnProps.tsx`, `src/engine/motion25d/Card25D.tsx`, `src/engine/motion25d/KineticText.tsx`, and `src/engine/index.ts`**

Ensure all animations use `useCurrentFrame()`, `useVideoConfig()`, `interpolate()`, or `spring()` without CSS transitions or `Math.random()`.

---

### Task 5: Migrate `SafeRoomHD2D` into `src/topics/safe-room/episodes/ep-01/` & Wire `src/Root.tsx`

**Files:**
- Create: `public/topics/safe-room/ep-01/parts/01-cold-path.mp3` (copied from `remotion-claude/safe-room-hd2d-project/public/audio/audio-1.mp3`)
- Create: `public/topics/safe-room/ep-01/parts/02-relief.mp3` (copied from `audio-2.mp3`)
- Create: `public/topics/safe-room/ep-01/parts/03-signals.mp3` (copied from `audio-3.mp3`)
- Create: `public/topics/safe-room/ep-01/parts/04-meaning.mp3` (copied from `audio-4.mp3`)
- Create: `public/topics/safe-room/ep-01/parts/05-loop-path.mp3` (copied from `audio-5.mp3`)
- Create: `public/topics/safe-room/ep-01/script.md`
- Create: `src/topics/safe-room/components/sprites.ts`
- Create: `src/topics/safe-room/components/TravelerSprite.tsx`
- Create: `src/topics/safe-room/components/HpBar.tsx`
- Create: `src/topics/safe-room/components/CeilingBeams.tsx`
- Create: `src/topics/safe-room/components/CabinInterior.tsx`
- Create: `src/topics/safe-room/components/ColdPathWorld.tsx`
- Create: `src/topics/safe-room/components/ColdForeground.tsx`
- Create: `src/topics/safe-room/components/SignalCallouts.tsx`
- Create: `src/topics/safe-room/episodes/ep-01/episode.data.json` (via `sync-episode.mjs`)
- Create: `src/topics/safe-room/episodes/ep-01/parts/Part01ColdPath.tsx`
- Create: `src/topics/safe-room/episodes/ep-01/parts/Part02Relief.tsx`
- Create: `src/topics/safe-room/episodes/ep-01/parts/Part03Signals.tsx`
- Create: `src/topics/safe-room/episodes/ep-01/parts/Part04Meaning.tsx`
- Create: `src/topics/safe-room/episodes/ep-01/parts/Part05LoopPath.tsx`
- Create: `src/topics/safe-room/episodes/ep-01/Episode.tsx`
- Create: `src/topics/safe-room/topic.config.ts`
- Create: `src/topics/index.ts`
- Create: `src/Root.tsx`
- Create: `src/index.ts`

**Interfaces:**
- Consumes: `@engine/*`, `sync-episode.mjs`
- Produces:
  - `src/topics/safe-room/topic.config.ts`: `export const safeRoomTopic: TopicDefinition`
  - `src/topics/index.ts`: `export const TOPICS: TopicDefinition[]`
  - `src/Root.tsx`: `export const RemotionRoot: React.FC` registering `<Folder name="safe-room">` with `<Composition id="safe-room-ep-01" ... />` (`1637` frames) and `<Folder name="parts">` with individual part compositions (`safe-room-ep-01-part-01`..`05`).

- [ ] **Step 1: Copy `audio-1..5.mp3` into `public/topics/safe-room/ep-01/parts/01-cold-path.mp3`..`05-loop-path.mp3`, add `script.md`, and run `sync-episode.mjs`**

Run: `node .agents/skills/remotion-storytelling/scripts/sync-episode.mjs safe-room/ep-01`
Expected: Creates `src/topics/safe-room/episodes/ep-01/episode.data.json` with 5 parts (`330, 342, 364, 345, 256` frames; `totalDurationInFrames: 1637`).

- [ ] **Step 2: Migrate topic components to `src/topics/safe-room/components/` and parts to `src/topics/safe-room/episodes/ep-01/parts/Part01..05.tsx`**

In `Part01ColdPath.tsx`..`Part05LoopPath.tsx`:
- Use `const localFrame = useCurrentFrame(); const { durationInFrames } = useVideoConfig();`
- Map `f = remapFrame(localFrame, durationInFrames, designStart, designEnd)` (`[0, 210]`, `[210, 480]`, `[480, 780]`, `[780, 1080]`, `[1080, 1350]`) so every animation, camera move, callout, and caption cue scales smoothly across each external audio file's actual duration.
- Include each part's narrative `CaptionOverlay` inside its own part component (respecting `showCaptions`) so individual part previews and full-episode playback both display the synchronized narrative captions.

- [ ] **Step 3: Create `Episode.tsx`, `topic.config.ts`, `src/topics/index.ts`, `src/Root.tsx`, and `src/index.ts`**

Register each topic in `src/Root.tsx` inside `<Folder name={topic.slug}>`, exposing both the full episode `<Composition id={`${topic.slug}-${ep.slug}`} ... />` and a `<Folder name="parts">` with each individual part composition.

- [ ] **Step 4: Install dependencies (if `node_modules` is absent) and run TypeScript verification**

Run: `npx tsc --noEmit`
Expected: Exit code `0` with no type errors.

---

### Task 6: Scaffolder CLI (`scaffold.mjs`), Codex Skill Docs, Legacy Folder Cleanup & `README.md`

**Files:**
- Create: `.agents/skills/remotion-storytelling/scripts/scaffold.mjs`
- Create: `.agents/skills/remotion-storytelling/SKILL.md`
- Create: `.agents/skills/remotion-storytelling/references/engine-api.md`
- Create: `.agents/skills/remotion-storytelling/references/safezone-motion.md`
- Create: `.agents/skills/remotion-storytelling/references/workflow.md`
- Create: `AGENTS.md`
- Create: `README.md`
- Delete: `kenapa-ai/`
- Delete: `remotion-claude/`
- Delete: `PROMPT.md`
- Test: `tests/scaffold.test.mjs`

**Interfaces:**
- Consumes: `syncEpisode` from `./sync-episode.mjs`
- Produces:
  - `.agents/skills/remotion-storytelling/scripts/scaffold.mjs`:
    - `export function validateSlug(slug: string, label?: string): string`
    - `export function scaffoldEpisode(options: { rootDir?: string; topic: string; episode: string; partCount?: number; style?: "hd2d" | "b1-stickman" | "hybrid"; force?: boolean }): { topicDir: string; episodeDir: string; publicPartsDir: string }`

- [ ] **Step 1: Write the failing test `tests/scaffold.test.mjs`**

```js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  validateSlug,
  scaffoldEpisode,
} from "../.agents/skills/remotion-storytelling/scripts/scaffold.mjs";

test("validateSlug rejects uppercase, spaces, and path traversal", () => {
  assert.equal(validateSlug("safe-room"), "safe-room");
  assert.throws(() => validateSlug("../evil"), /Invalid/);
  assert.throws(() => validateSlug("Bad Slug"), /Invalid/);
});

test("scaffoldEpisode creates topic, episode, and part stubs and refuses overwrite without force", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "remotion-scaffold-"));
  const res = scaffoldEpisode({
    rootDir: tmp,
    topic: "ai-basics",
    episode: "ep-01",
    partCount: 2,
    style: "hybrid",
  });
  assert.ok(fs.existsSync(path.join(res.episodeDir, "Episode.tsx")));
  assert.ok(fs.existsSync(path.join(res.episodeDir, "parts", "Part01.tsx")));
  assert.ok(fs.existsSync(path.join(res.episodeDir, "parts", "Part02.tsx")));
  assert.throws(
    () =>
      scaffoldEpisode({
        rootDir: tmp,
        topic: "ai-basics",
        episode: "ep-01",
        partCount: 2,
      }),
    /already exists/i,
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/scaffold.test.mjs`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `scaffold.mjs`.

- [ ] **Step 3: Implement `.agents/skills/remotion-storytelling/scripts/scaffold.mjs` and run test**

Run: `node --test tests/scaffold.test.mjs`
Expected: PASS.

- [ ] **Step 4: Write `.agents/skills/remotion-storytelling/SKILL.md`, `references/engine-api.md`, `references/safezone-motion.md`, `references/workflow.md`, `AGENTS.md`, and `README.md`**

Keep `SKILL.md` under 120 lines so Codex loads minimal tokens per prompt. Document:
1. Folder structure (`src/engine/`, `src/topics/<topic>/episodes/<ep>/parts/`, `public/topics/<topic>/<ep>/parts/`).
2. External audio workflow (with or without `.srt`/`.json` captions) via `npm run scaffold` and `npm run sync -- <topic>/<ep>`.
3. 9:16 Social SafeZone rules (`<SafeStage>`), HD-2D engine components (`GroundPlane`, `Billboard`, `Room`, `HD2DOverlay`, `DynamicLight`, `Rain`, `Embers`, `Dust`, `Px`), Stickman B1 (`Stickman`, `HandDrawnProps`), and 2.5D (`Card25D`, `KineticText`).
4. Cross-topic component imports via `@topics/<other-topic>/components/*`.
5. Windows process note: stop Remotion Studio cleanly with `Ctrl+C` (or `Stop-Process -Name "chrome-headless-shell" -Force` if a render crashes).

- [ ] **Step 5: Delete legacy `kenapa-ai/`, `remotion-claude/`, and `PROMPT.md`, then run full verification**

Run: `npm test && npm run typecheck`
Expected: All unit tests in `tests/*.test.mjs` PASS and `tsc --noEmit` exits with code `0`.
