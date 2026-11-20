import React from "react";
import { H, W, lsin, mulberry32 } from "@engine/theme";

// Cycle lengths that all divide 1350, so loops stay seamless.
const CYCLES = [27, 30, 45, 50, 54, 75, 90, 135, 150];

type Streak = { x: number; y0: number; cyc: number; len: number; a: number; w: number };
const makeStreaks = (seed: number, n: number, lenMin: number, lenMax: number): Streak[] => {
  const rnd = mulberry32(seed);
  return Array.from({ length: n }, () => ({
    x: rnd() * (W + 400) - 200,
    y0: rnd(),
    cyc: [18, 27, 30, 45][Math.floor(rnd() * 4)],
    len: lenMin + rnd() * (lenMax - lenMin),
    a: 0.35 + rnd() * 0.65,
    w: 0.6 + rnd() * 0.8,
  }));
};
const BACK_RAIN = makeStreaks(11, 150, 40, 90);
const FRONT_RAIN = makeStreaks(23, 46, 110, 220);

/** Slanted rain. Fully periodic in 1350 frames. */
export const Rain: React.FC<{ frame: number; opacity: number; front?: boolean; slant?: number }> = ({
  frame,
  opacity,
  front = false,
  slant = 0.28,
}) => {
  if (opacity <= 0.001) return null;
  const list = front ? FRONT_RAIN : BACK_RAIN;
  return (
    <svg
      width={W}
      height={H}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        opacity,
        filter: front ? "blur(1.6px)" : undefined,
        pointerEvents: "none",
      }}
    >
      {list.map((s, i) => {
        const ph = (frame / s.cyc + s.y0) % 1;
        const y = -s.len + ph * (H + s.len * 2);
        const x = s.x - ph * (H + s.len * 2) * slant;
        return (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={x - s.len * slant}
            y2={y + s.len}
            stroke={front ? "rgba(190,215,255,0.5)" : "rgba(160,195,245,0.38)"}
            strokeOpacity={s.a}
            strokeWidth={front ? s.w * 3.2 : s.w * 1.6}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};

type Mote = { x: number; y0: number; cyc: number; drift: number; size: number; a: number; ph: number };
const makeMotes = (seed: number, n: number, driftMax: number): Mote[] => {
  const rnd = mulberry32(seed);
  return Array.from({ length: n }, () => ({
    x: rnd() * W,
    y0: rnd(),
    cyc: CYCLES[3 + Math.floor(rnd() * (CYCLES.length - 3))],
    drift: (rnd() - 0.5) * driftMax,
    size: 3 + rnd() * 6,
    a: 0.4 + rnd() * 0.6,
    ph: rnd(),
  }));
};
const EMBERS = makeMotes(5, 46, 120);
const DUST = makeMotes(9, 60, 220).map((m, i) => ({ ...m, cyc: [135, 150, 225, 270, 450, 675][i % 6] }));

/** Rising ember motes around a source point. */
export const Embers: React.FC<{
  frame: number;
  x: number;
  y: number;
  spread?: number;
  rise?: number;
  opacity?: number;
  count?: number;
}> = ({ frame, x, y, spread = 140, rise = 520, opacity = 1, count = 46 }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, opacity, pointerEvents: "none" }}>
    {EMBERS.slice(0, count).map((m, i) => {
      const ph = (frame / (m.cyc * 1.6) + m.y0) % 1;
      const px = x + (m.x / W - 0.5) * spread + m.drift * ph + lsin(frame, 45, m.ph) * 10;
      const py = y - ph * rise;
      const fade = Math.sin(Math.PI * ph);
      const col = ph < 0.5 ? "#FFF3C4" : "#FF9F43";
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: px,
            top: py,
            width: m.size,
            height: m.size,
            background: col,
            opacity: fade * m.a,
            boxShadow: `0 0 ${m.size * 3}px ${m.size}px rgba(255,159,67,0.55)`,
            mixBlendMode: "screen",
          }}
        />
      );
    })}
  </div>
);

/** Slow drifting golden dust / glow motes. */
export const Dust: React.FC<{ frame: number; opacity?: number; count?: number; color?: string }> = ({
  frame,
  opacity = 1,
  count = 60,
  color = "#FFD98A",
}) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, opacity, pointerEvents: "none" }}>
    {DUST.slice(0, count).map((m, i) => {
      const ph = (frame / m.cyc + m.y0) % 1;
      const px = m.x + m.drift * ph + lsin(frame, 135, m.ph) * 22;
      const py = H * 0.2 + ((m.y0 * 1.7 + ph) % 1) * H * 0.6;
      const tw = 0.5 + 0.5 * lsin(frame, 54, m.ph);
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: px,
            top: py,
            width: m.size * 0.7,
            height: m.size * 0.7,
            background: color,
            opacity: m.a * (0.25 + 0.55 * tw),
            boxShadow: `0 0 ${m.size * 2.5}px ${m.size * 0.5}px ${color}66`,
            mixBlendMode: "screen",
          }}
        />
      );
    })}
  </div>
);
