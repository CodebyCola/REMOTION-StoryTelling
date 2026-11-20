# 9:16 Social SafeZone & Motion Guidelines

## 1. 9:16 Social App SafeZone Layout (`1080 × 1920`, `30 fps`)

Every video targets vertical mobile platforms (TikTok, Instagram Reels, YouTube Shorts). Full-bleed backgrounds, weather particles, and 3D floor planes should fill the entire `1080×1920` frame, while **all readable text, key character acting, diagrams, and callout badges** must stay inside the SafeZone:

| Region | X Range (`1080w`) | Y Range (`1920h`) | Rule |
| --- | --- | --- | --- |
| **Top Unsafe UI** | `0 .. 1080` | `0 .. 180` | Reserved for status bar, *For You* tabs, search/live icons. No text or key faces. |
| **Left Margin** | `0 .. 64` | `0 .. 1920` | Bezel breathing room. Keep text/cards at `x >= 64`. |
| **Right Action Stack** | `940 .. 1080` | `820 .. 1540` | Reserved for Like, Comment, Bookmark, Share, and Avatar buttons. Keep right edge of cards/labels at `x <= 940` (`width <= 876`). |
| **Bottom Unsafe UI** | `0 .. 1080` | `1540 .. 1920` | Reserved for @handle, video description, music ticker, and navigation bar. |
| **Primary Visual Safe Area** | `64 .. 940` (`876px`) | `180 .. 1380` (`1200px`) | Primary stage for Stickman, 2.5D cards, callouts, and diorama focal points. |
| **Bottom Caption Band** | `64 .. 940` (`876px`) | `1380 .. 1540` (`160px`) | Used when `captionPlacement="bottom-safe"`. When `captionPlacement="top-safe"` (at `y ≈ 268`) or captions are off, scenes may use up to `y = 1520`. |

### Checking SafeZones in Studio
In Remotion Studio (`npm run dev`), toggle **`showSafeZones`** in the right-hand props panel to overlay the translucent guide boxes before finalizing layout positions. Always leave `showSafeZones: false` in `defaultProps`.

---

## 2. Audio-Driven Timing & `remapFrame()`

Each part (`Part01*.tsx`, `Part02*.tsx`, ...) is mounted inside its own `<TransitionSeries.Sequence durationInFrames={part.durationInFrames}>`.
- Inside a part component, `useCurrentFrame()` always starts at `0` and ends at `part.durationInFrames - 1`.
- **Two clean ways to time animations inside a part:**
  1. **Direct Local Frames / Seconds:**
     ```tsx
     const frame = useCurrentFrame();
     const { fps } = useVideoConfig();
     // Entrance over first 0.6s:
     const opacity = interpolate(frame, [0, 0.6 * fps], [0, 1], {
       extrapolateLeft: "clamp",
       extrapolateRight: "clamp",
     });
     ```
  2. **Proportional Design-Window Remapping (`remapFrame`):**
     When a scene is authored against a fixed design timeline (e.g. frames `210..480` in a multi-shot continuous world like `SafeRoomHD2D`) and should stretch or compress automatically if the external audio file changes duration:
     ```tsx
     const localFrame = useCurrentFrame();
     const frame = remapFrame(localFrame, part.durationInFrames, 210, 480);
     ```

---

## 3. Motion & Performance Best Practices

1. **No Linear Robotic Motion:**
   - Use `spring({ frame, fps, config: { damping: 16, stiffness: 120 } })` for card entrances, badges, and character pops.
   - Use `Easing.inOut(Easing.cubic)` or `Easing.out(Easing.cubic)` with `interpolate(..., { extrapolateLeft: "clamp", extrapolateRight: "clamp" })` for camera moves and fades.
2. **HD-2D Camera & Depth Discipline:**
   - Place ground props with `<GroundItem u={...} d={...}>` and upright characters/trees with `<Billboard u={...} d={...} shadow={{ w: 150 }}>`.
   - Use negative `d` for deeper background elements and positive `d` for foreground elements; `<Billboard>` computes perspective scale `p.s` and `zIndex = Math.round(p.y)` automatically.
   - Layer subtle foreground silhouettes with `filter: "blur(6px)"` and parallax `translate` to create 2.5D depth separation.
3. **Keep Frame Subscriptions Narrow:**
   - Do not use `Math.random()` inside render functions; always seed `mulberry32(seed)` at module scope so multi-thread frame rendering stays deterministic.
