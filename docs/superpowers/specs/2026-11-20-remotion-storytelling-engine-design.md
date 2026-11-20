# Design Spec: Modular Remotion HD-2D & Stickman Storytelling Engine + Codex Skill

**Date:** 2026-11-20  
**Workspace:** `D:\Dev\Remotion\REMOTION-StoryTelling`  
**Status:** Approved & Finalized (Post-Builder Check)

---

## 1. Intent & The Why

Previously, generating a 15.8-second vertical video (`kenapa-ai/`) with the global `directing-stickman-videos` (`autopilot.mjs`) skill consumed excessive tokens due to bloated multi-style rules, monolithic SVG/timestamp authoring (`adegan.cjs`), mandatory caption requirements, and multi-pass MP4 evidence/review gates. Meanwhile, the user placed `remotion-claude/safe-room-hd2d-project/` in the workspace containing a 9:16 (`1080×1920`, `30fps`) HD-2D Remotion 4.0.545 project with 5 modular scenes and 5 sliced external audio tracks (`audio-1.mp3`–`audio-5.mp3`).

This design unifies `REMOTION-StoryTelling` into a **single Remotion 4.0.545 root workspace** that:
1. **Absorbs the HD-2D / 2.5D visual engine** from `remotion-claude/safe-room-hd2d-project/` (`world.tsx` 3D ground plane/billboards/shadow-box room, `HD2DStage.tsx` tilt-shift/vignette/grade, `DynamicLight.tsx`, `ParticleField.tsx`, `Px.tsx` pixel-grid SVG renderer, loop-safe math/color utilities, and local `Plus Jakarta Sans` + `Silkscreen` fonts) into `src/engine/`, alongside a reusable parametric **Stickman B1** toolkit and a **9:16 Social SafeZone** layout container (`<SafeStage>`).
2. **Migrates `SafeRoomHD2D` into the first modular topic/episode** (`src/topics/safe-room/episodes/ep-01/` and `public/topics/safe-room/ep-01/parts/01-cold-path.mp3`..`05-loop-path.mp3`), synchronizing each scene dynamically to its actual sliced external audio track (`10.998s`, `11.389s`, `12.121s`, `11.468s`, `8.516s` -> `1637` frames total).
3. **Cleans up legacy directories:** Deletes `kenapa-ai/` (without absorbing its content) and deletes `remotion-claude/` once its HD-2D engine, scenes, fonts, and audio are absorbed into the root workspace.
4. **Embeds a token-optimized Codex skill** (`.agents/skills/remotion-storytelling/` + root `AGENTS.md`) modeled on the clean skill architecture (`SKILL.md`, `references/`, `scripts/`), plus a comprehensive root `README.md`.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
1. **Single Root Remotion Project (`4.0.545`):** One `package.json`, `tsconfig.json` (with `@engine/*` and `@topics/*` path aliases), `remotion.config.ts` (Rspack enabled), `public/`, and `src/` at workspace root.
2. **Topic-Isolated Modular Folder Structure (`src/topics/<topic>/`):**
   - Each topic lives in its own `src/topics/<topic>/` and `public/topics/<topic>/` folder.
   - Each topic supports multiple episodes (`episodes/<ep-xx>/`) and splits every episode into independent part components (`parts/Part01...tsx`).
   - Topics can import shared primitives from `@engine/*` AND reuse components from other topics via `@topics/<other-topic>/...`.
3. **Hybrid HD-2D + Stickman B1 Engine (`src/engine/`):**
   - **HD-2D / 2.5D Kit:** `GroundPlane`, `GroundItem`, `Billboard`, `Room`, `FullLayer`, `CAM`, `project`, `project3`, `HD2DOverlay` (tilt-shift + vignette + grade), `DynamicLight`, `Rain`, `Embers`, `Dust`, `Px` (`r`, `box`), `Card25D`, `KineticText`, and deterministic math/color helpers (`mulberry32`, `lsin`, `lcos`, `smooth`, `lerp`, `clamp`, `mix`, `shade`, `remapFrame`).
   - **Stickman B1 Kit:** Parametric SVG `<Stickman>` (poses, expressions, facing, arm/head animation) + `<HandDrawnProps>` + warm paper grid background preset.
4. **9:16 Social App SafeZone System (`1080×1920`):** `<SafeStage>` enforcing TikTok/Reels/Shorts safe bounds and providing a toggleable Studio debug guide overlay (`showSafeZones`).
5. **External Per-Part Audio + Optional Captions Workflow:**
   - External audio files placed per part in `public/topics/<topic>/<episode>/parts/` (`01-*.mp3|wav`, `02-*.mp3|wav`, ...).
   - Pure-JS Node audio duration parser (`scripts/audio-duration.mjs` supporting MP3 CBR/VBR/ID3v2 and WAV RIFF headers without requiring global `ffprobe` on Windows `PATH`, plus optional `ffprobe` fallback) used by `scripts/sync-episode.mjs` to generate `episode.data.json`.
   - Captions are optional per part (`.srt` parsed via `@remotion/captions` `parseSrt()`, `.json` caption arrays, or no caption file at all) and globally toggleable (`showCaptions`).
6. **Local Codex Skill & Documentation:** `.agents/skills/remotion-storytelling/` (`SKILL.md`, `references/`, `scripts/scaffold.mjs`, `scripts/sync-episode.mjs`), `AGENTS.md`, restored `.gitignore`, and root `README.md`.

### Non-Goals
- No built-in TTS synthesis or automatic Whisper speech-to-text inside the workspace.
- No legacy `autopilot.mjs` JSON review-template / SHA-256 approval gates.
- No absorption of `kenapa-ai/` story assets or scripts (`kenapa-ai/` is deleted).

### Anti-Goals
- Do not duplicate `node_modules` or `package.json` inside topic folders.
- Do not depend on global `ffprobe` being installed in Windows `PATH` for `.mp3` or `.wav` sync.
- Do not block validation or rendering when captions are omitted.

---

## 3. Builder Check Decisions & Architectural Calls

1. **Code-First Data-Driven Timeline Wiring (Builder Check Q1 — Resolved):**
   - We use the **Code-First + `.map()` data-driven playback model**: `EpisodePlayer.tsx` maps over the ordered parts in `episode.data.json` using `<TransitionSeries>` (`<TransitionSeries.Sequence>` per part), and `Root.tsx` maps registered topics/episodes into `<Folder>` and `<Composition>` nodes (including per-part preview compositions).
   - Global preview switches (`showSafeZones`, `showCaptions`, `bgmVolume`, `hd2dOverlay`) are exposed via `<Composition defaultProps={{...}}>` for instant toggling in Remotion Studio, while permanent edits are made in code/files and synced via `npm run sync`.
2. **Absorb `remotion-claude/` & Remove Legacy Folders (Builder Check Q2 — Resolved):**
   - Absorb all HD-2D engine components, fonts, configs, and the 5-part `SafeRoomHD2D` video + audio (`audio-1.mp3`..`audio-5.mp3`) from `remotion-claude/safe-room-hd2d-project/` into root `src/engine/`, `src/topics/safe-room/`, and `public/`.
   - Delete `remotion-claude/` after absorption and verification.
   - Delete `kenapa-ai/` immediately without absorbing its files.
   - Author a new root `README.md` and restore `.gitignore`.
3. **Pure-JS Audio Duration Probing (Environment Discovery Call):**
   - Inspection showed `ffprobe` is not present on the host Windows `PATH` (`CommandNotFoundException`), while Node `v24.11.1` is available.
   - `scripts/audio-duration.mjs` implements deterministic pure-JS duration parsing for `.mp3` (ID3v2 + MPEG Layer III frame walk) and `.wav` (RIFF/WAVE `fmt ` & `data` chunk parsing), with an optional `ffprobe` fallback for other containers. Verified on `audio-1.mp3`..`audio-5.mp3` (`10.998s`, `11.389s`, `12.121s`, `11.468s`, `8.516s`).
4. **Proportional Frame Remapping (`remapFrame`) for Audio-Driven Parts:**
   - When an authored scene with a nominal design window `[designStart, designEnd]` runs inside a part sequence whose duration comes from external audio (`durationInFrames`), `remapFrame(localFrame, durationInFrames, designStart, designEnd)` smoothly maps local frame `0..durationInFrames-1` to `designStart..designEnd`.

---

## 4. Detailed Architecture

### 4.1 Workspace Directory Layout

```text
REMOTION-StoryTelling/
├── .agents/
│   └── skills/
│       └── remotion-storytelling/
│           ├── SKILL.md                   # Compact Codex entrypoint (<120 lines)
│           ├── references/
│           │   ├── engine-api.md          # HD-2D, Stickman B1, SafeStage, Audio/Caption API reference
│           │   ├── safezone-motion.md     # 9:16 SafeZone coords, HD-2D camera math, spring/easing rules
│           │   └── workflow.md            # External audio -> scaffold -> sync -> code PartXX -> Studio
│           └── scripts/
│               ├── audio-duration.mjs     # Pure-JS WAV/MP3 duration parser (+ ffprobe fallback)
│               ├── sync-episode.mjs       # Scans public/topics/<t>/<e>/parts -> episode.data.json
│               └── scaffold.mjs           # Scaffolds a new topic, episode, or part
├── AGENTS.md                              # Root pointer for Codex -> .agents/skills/remotion-storytelling
├── README.md                              # Complete workspace & workflow documentation
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── package.json
├── tsconfig.json                          # @engine/* -> ./src/engine/*, @topics/* -> ./src/topics/*
├── remotion.config.ts
├── public/
│   ├── fonts/
│   │   ├── plus-jakarta-sans-latin-600-normal.woff2
│   │   ├── plus-jakarta-sans-latin-700-normal.woff2
│   │   ├── silkscreen-latin-400-normal.woff2
│   │   └── silkscreen-latin-700-normal.woff2
│   └── topics/
│       └── safe-room/
│           └── ep-01/
│               ├── script.md
│               └── parts/
│                   ├── 01-cold-path.mp3
│                   ├── 01-cold-path.srt   # Optional (demonstrates with-caption support)
│                   ├── 02-relief.mp3
│                   ├── 03-signals.mp3
│                   ├── 04-meaning.mp3
│                   └── 05-loop-path.mp3
├── src/
│   ├── index.ts
│   ├── Root.tsx
│   ├── engine/
│   │   ├── index.ts
│   │   ├── theme.ts                       # W=1080, H=1920, FPS=30, palettes, SAFE_ZONE, math/color utils
│   │   ├── fonts.ts                       # @remotion/fonts deterministic loader
│   │   ├── layout/
│   │   │   ├── SafeStage.tsx              # 1080x1920 wrapper + SafeZone guide overlay toggle
│   │   │   └── BackgroundLayer.tsx        # 'hd2d-night' | 'b1-paper' | 'dark-25d' | 'light-25d'
│   │   ├── hd2d/
│   │   │   ├── world.tsx                  # CAM, project, project3, GroundPlane, GroundItem, Billboard, Room, FullLayer
│   │   │   ├── HD2DOverlay.tsx            # Tilt-shift blur bands, corner vignette, soft-light grade
│   │   │   ├── DynamicLight.tsx           # Flickering radial screen-blend point light
│   │   │   ├── ParticleField.tsx          # Rain, Embers, Dust deterministic particle fields
│   │   │   └── Px.tsx                     # Crisp pixel-grid SVG renderer (Px, r, box, R)
│   │   ├── stickman/
│   │   │   ├── Stickman.tsx               # Parametric B1 SVG stick figure (pose, expression, facing, handTarget)
│   │   │   └── HandDrawnProps.tsx         # Sketchy note card, curved arrow, ring, underline
│   │   ├── motion25d/
│   │   │   ├── Card25D.tsx                # Perspective-tilted 2.5D card with spring entrance
│   │   │   └── KineticText.tsx            # Word/line staggered spring reveal
│   │   ├── audio/
│   │   │   ├── PartAudio.tsx              # Plays part audio via @remotion/media <Audio>
│   │   │   └── CaptionOverlay.tsx         # Renders timed captions (from .srt/.json or inline cues) in SafeZone
│   │   └── episode/
│   │       ├── episode.types.ts           # EpisodeData, PartMeta, EpisodeProps, TopicDefinition
│   │       └── EpisodePlayer.tsx          # Sequences parts via <TransitionSeries>, mounts PartAudio + Captions + HD2DOverlay + SafeStage
│   └── topics/
│       ├── index.ts                       # Registry of all topics
│       └── safe-room/
│           ├── topic.config.ts            # Topic metadata & episode list
│           ├── components/                # Topic-shared components (importable via @topics/safe-room/components/*)
│           │   ├── sprites.ts
│           │   ├── TravelerSprite.tsx
│           │   ├── HpBar.tsx
│           │   ├── CeilingBeams.tsx
│           │   ├── CabinInterior.tsx
│           │   ├── ColdPathWorld.tsx
│           │   ├── ColdForeground.tsx
│           │   └── SignalCallouts.tsx
│           └── episodes/
│               └── ep-01/
│                   ├── episode.data.json  # Generated by sync-episode.mjs from 01..05 mp3 + optional srt
│                   ├── Episode.tsx        # Connects Part01..Part05 to EpisodePlayer
│                   └── parts/
│                       ├── Part01ColdPath.tsx
│                       ├── Part02Relief.tsx
│                       ├── Part03Signals.tsx
│                       ├── Part04Meaning.tsx
│                       └── Part05LoopPath.tsx
└── tests/
    ├── audio-duration.test.mjs
    ├── sync-episode.test.mjs
    └── scaffold.test.mjs
```

### 4.2 9:16 Social SafeZone Geometry (`1080×1920`)

`SAFE_ZONE` in `src/engine/theme.ts` and `<SafeStage>` in `src/engine/layout/SafeStage.tsx` define:
- **Canvas:** `1080 × 1920`, `30 fps`
- **Unsafe Top (`0..180px`):** Platform header, status bar, search/live icons
- **Unsafe Right (`940..1080px`, `y: 820..1540px`):** Like, comment, bookmark, share, creator avatar stack
- **Unsafe Bottom (`1540..1920px`):** Handle, caption description, music ticker, bottom navigation
- **Safe Content Box:** `left: 64`, `right: 140` (`width: 876`), `top: 180`, `bottom: 380` (`height: 1360`, or `1200` above the `1380..1540` bottom caption band)
- **Caption Placement Options:** `'top-safe'` (`top: 220..360`, matching `SafeRoomHD2D`'s top narrative placement at `top: 268`) or `'bottom-safe'` (`top: 1380..1540`, above the bottom platform description).

### 4.3 External Audio & Optional Caption Contract (`episode.data.json`)

When `node .agents/skills/remotion-storytelling/scripts/sync-episode.mjs safe-room/ep-01` (or `npm run sync -- safe-room/ep-01`) runs:
1. Scans `public/topics/<topic>/<episode>/parts/` for audio files (`*.mp3`, `*.wav`, `*.m4a`, `*.ogg`) sorted in natural alphanumeric order (`01-*`, `02-*`, ...).
2. Measures each audio file's duration in seconds via `audio-duration.mjs` and computes `durationInFrames = Math.max(1, Math.ceil(durationInSeconds * fps))`.
3. Checks for an optional matching `<stem>.srt` or `<stem>.json` caption file in the same directory:
   - If `<stem>.srt` exists: parses it into normalized `{ text, startMs, endMs }[]` cues (supporting both standard `HH:MM:SS,mmm` and `HH:MM:SS.mmm`).
   - If `<stem>.json` exists: normalizes array entries (`{ text, startMs, endMs }` or `{ text, start, end }` seconds).
   - If neither exists: `hasCaptions: false, captions: []` (never throws an error).
4. Writes `src/topics/<topic>/episodes/<episode>/episode.data.json` with total `durationInFrames` (sum of part frames) and per-part metadata.
