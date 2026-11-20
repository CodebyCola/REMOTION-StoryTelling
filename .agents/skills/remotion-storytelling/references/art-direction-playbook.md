# Art Direction & Visual Governance Playbook

Follow these rules in every new `PartXX*.tsx` so generated episodes look cohesive, readable on mobile (`1080×1920`), and visually polished without trial-and-error coordinate guessing.

---

## 1. Lock One Style Preset per Topic

Pick one `StylePresetName` from `STYLE_PRESETS` (`@engine/theme`) for the topic:

| Preset | Mood & Use Case | Background | Finishing |
| --- | --- | --- | --- |
| `"hd2d-cinematic"` | Atmospheric storytelling, pixel-art dioramas, dramatic lighting | `"hd2d-night"` | `"hd2d"` (`HD2DOverlay`) |
| `"b1-editorial"` | Stickman explainers, warm sketchbook notes, clean ink diagrams | `"b1-paper"` | `"paper"` (`PaperStageOverlay`) |
| `"neo-25d-dark"` | Tech/AI explainers, SaaS/system diagrams, bold glowing cards | `"dark-25d"` | `"hd2d"` (`HD2DOverlay`) |
| `"neo-25d-light"` | Crisp educational cards, comparisons, friendly bright explainers | `"light-25d"` | `"paper"` (`PaperStageOverlay`) |

**Color Discipline (80 / 15 / 5 Rule):**
- **80%** background canvas (`theme.background`)
- **15%** structured card/panel surface (`theme.surface`)
- **5%** high-contrast focal accent (`theme.accent` / `theme.secondary`)

---

## 2. Mobile Typography Hierarchy (`TYPE_SCALE`)

Never pick arbitrary small font sizes. Use `TYPE_SCALE` from `@engine/theme`:
- `TYPE_SCALE.hero` (`84px`) — 2–5 word hook headline
- `TYPE_SCALE.title` (`68px`) — Scene header
- `TYPE_SCALE.subtitle` (`48px`) — Card title or sub-claim
- `TYPE_SCALE.body` (`40px`) — Card explanation or callout label
- `TYPE_SCALE.caption` (`32px`) — Eyebrow pill / step badge (hard floor: **never `< 28px`**)

---

## 3. Layout Slots & Visual Density

- **Never guess raw `(top, left)` pixel coordinates** for text or cards. Wrap scenes in `<SafeLayout showCaptions={showCaptions} captionPlacement={captionPlacement}>` and place elements inside `<StageSlot slot="header" | "stage" | "split-top" | "split-bottom" | "footer">`.
- **Max 3 Visual Groups per Part:** Keep each part clean with at most 1 header + 1–2 focal cards/actors + optional footer takeaway. Leave breathing room inside the `876px` safe column.
- **No Caption Collisions:** `<SafeLayout>` automatically shifts clear of `"top-safe"` (`180..380`) or `"bottom-safe"` (`1380..1540`) caption bands. Always forward `showCaptions` and `captionPlacement` from `PartProps` into your archetype or `<SafeLayout>`.

---

## 4. 4-Beat Motion Choreography

Every part's `useCurrentFrame()` runs from `0` to `part.durationInFrames - 1`. Use `computePartBeats(frame, part.durationInFrames)` and `SPRINGS` from `@engine/motion/choreography`:

1. **`enter` (`0–18%`):** Headline and primary frame enter with `SPRINGS.snappy` (`KineticText`).
2. **`act` (`15–62%`):** Main character pose/action, camera push (`<CameraRig25D>`), or progressive connector (`<Connector25D>`).
3. **`payoff` (`52–84%`):** Secondary reveal, answer card, or highlight callout pops in (`staggerFrame`).
4. **`settle` (`84–100%`):** Hold cleanly for readability with subtle `breath` (`lsin`) motion.

---

## 5. Choosing a Scene Archetype (`@engine/archetypes/*`)

Prefer composable archetypes before building raw layouts:
- **`<TitleHookScene>`:** Opening hook, topic intro, or big rhetorical question (+ optional `<Stickman>` inside `<StageSlot>`).
- **`<ComparisonCardsScene>`:** Contrasting 2–3 examples, before/after, or myth vs. fact.
- **`<ProcessFlowScene>`:** 2–3 sequential steps connected by animated `<Connector25D>` arrows.
- **`<SpotlightCalloutScene>`:** Pointing out 1–3 specific details on a diagram, sprite, or screenshot with pulsing rings and callout pills.

---

## 6. Mandatory Style Gate

Run `npm run audit-style` after editing any `PartXX*.tsx`. Fix all `determinism`, `css-motion`, `min-font-size`, and `safe-zone` errors before finishing. (Full-bleed decorative layers that intentionally span edge-to-edge must carry `// safezone-exempt`.)
