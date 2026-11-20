# End-to-End Storytelling Production Workflow

## 1. Preparing External Audio & Script

All audio and script assets are prepared externally and placed under `public/topics/<topic>/<episode>/`:

```text
public/topics/<topic>/<episode>/
├── script.md               # Optional script / storyboard notes for Codex
├── bgm.mp3                 # Optional background music (bgm.mp3 or bgm.wav)
└── parts/
    ├── 01-hook.mp3         # Required: numbered audio slice per part (.mp3, .wav, .m4a, .ogg)
    ├── 01-hook.srt         # Optional: matching .srt or .json captions for Part 1
    ├── 02-concept.mp3      # Required: Part 2 audio (works without .srt/.json!)
    └── 03-payoff.mp3       # Required: Part 3 audio
```

- **Numbered Prefixes:** Every audio file in `parts/` must begin with a positive integer prefix (`01-hook.mp3`, `02-body.wav`, ..., `10-outro.mp3`).
- **With or Without Captions:**
  - If `<stem>.srt` or `<stem>.json` is present alongside `<stem>.mp3`, `npm run sync` parses the cues into `episode.data.json` (`hasCaptions: true`) and `EpisodePlayer` renders `<PartCaptionTrack>` automatically.
  - If no caption file exists for a part (`hasCaptions: false`), `EpisodePlayer` plays the audio cleanly and passes `showCaptions={true}` to the `PartXX` component so optional inline `<CaptionOverlay>` cues can render (or nothing if omitted).

---

## 2. Scaffolding a New Topic or Episode

1. **Create a new topic and episode (or add a new episode to an existing topic):**
   ```bash
   npm run scaffold -- <topic>/<episode> --parts 3 --style hybrid
   ```
   Supported `--style` presets:
   - `hybrid` (default): `light-25d` background + `<Stickman>` starter
   - `hd2d`: `hd2d-night` background starter
   - `b1-stickman`: `b1-paper` background + `<Stickman>` starter

2. **Add one more part to an existing episode:**
   ```bash
   npm run scaffold -- <topic>/<episode> --add-part --style hybrid
   ```

3. **Refresh generated registries after manual file renames (`Part01.tsx` -> `Part01Intro.tsx`):**
   ```bash
   npm run scaffold -- --registry
   ```

---

## 3. Syncing Audio Durations & Captions

Whenever external audio files or `.srt`/`.json` captions in `public/topics/<topic>/<episode>/parts/` are added or updated, run:

```bash
npm run sync -- <topic>/<episode>
```

What `sync-episode.mjs` does:
- Probes exact `.mp3` and `.wav` durations in pure Node.js (`audio-duration.mjs`, no global `ffprobe` required on Windows `PATH`).
- Computes `durationInFrames = Math.max(1, Math.ceil(durationInSeconds * 30))` and cumulative `startFrame` for each part.
- Parses optional `<stem>.srt` or `<stem>.json` into normalized `{ text, startMs, endMs }[]` cues.
- Atomically writes `src/topics/<topic>/episodes/<episode>/episode.data.json`.

---

## 4. Authoring Parts & Sharing Components Across Topics

- Edit only `src/topics/<topic>/episodes/<episode>/parts/PartXX*.tsx`.
- Extract reusable topic widgets/sprites into `src/topics/<topic>/components/`.
- Any topic can import components from another topic using the `@topics/*` alias:
  ```tsx
  import { TravelerSprite } from "@topics/safe-room/components/TravelerSprite";
  import { Stickman, Card25D, remapFrame } from "@engine";
  ```

---

## 5. Previewing & Rendering

1. **Style Audit, Typecheck, Lint & Unit Tests (Fast Verification):**
   ```bash
   npm run audit-style
   npm run lint
   npm test
   ```
2. **Interactive Live Preview in Remotion Studio:**
   ```bash
   npm run dev
   ```
   - In the sidebar, open `<topic>` -> `<topic>-<episode>` for the full episode, or `<topic>` -> `<episode>` -> `parts` -> `<topic>-<episode>-part-01` to preview a single part in isolation.
   - Use the right-hand controls panel to toggle `showSafeZones`, `showCaptions`, `captionPlacement` (`"top-safe"` | `"bottom-safe"`), `hd2dOverlay`, and `bgmVolume`.
3. **Render Final MP4 (Only When Ready):**
   ```bash
   # Render full episode
   npx remotion render <topic>-<episode> out/<topic>-<episode>.mp4

   # Render a single part for quick verification
   npx remotion render <topic>-<episode>-part-01 out/part-01.mp4
   ```
