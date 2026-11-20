import { Easing, interpolate } from "remotion";

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const SAFE_ZONE = {
  top: 180, bottom: 380, left: 64, right: 140,
  width: 876, height: 1360, primaryHeight: 1200,
  captionBandTop: 1380, captionBandBottom: 1540,
} as const;

export const TYPE_SCALE = {
  hero: 84,
  title: 68,
  subtitle: 48,
  body: 40,
  caption: 32,
} as const;

export type StylePresetName =
  | "hd2d-cinematic"
  | "b1-editorial"
  | "neo-25d-dark"
  | "neo-25d-light";

export const STYLE_PRESETS: Record<
  StylePresetName,
  {
    background: "hd2d-night" | "b1-paper" | "dark-25d" | "light-25d";
    finishing: "hd2d" | "paper" | "none";
    textPrimary: string;
    textMuted: string;
    accent: string;
    onAccent: string;
    secondary: string;
    onSecondary: string;
    surface: string;
    border: string;
  }
> = {
  "hd2d-cinematic": {
    background: "hd2d-night",
    finishing: "hd2d",
    textPrimary: "#F8FAFC",
    textMuted: "#CBD5E1",
    accent: "#FF9F43",
    onAccent: "#090E1A",
    secondary: "#FFF3C4",
    onSecondary: "#090E1A",
    surface: "rgba(9, 14, 26, 0.84)",
    border: "rgba(248, 250, 252, 0.28)",
  },
  "b1-editorial": {
    background: "b1-paper",
    finishing: "paper",
    textPrimary: "#262E31",
    textMuted: "#526066",
    accent: "#356774",
    onAccent: "#FDFDFC",
    secondary: "#F2C759",
    onSecondary: "#262E31",
    surface: "#FFFDF4",
    border: "#262E31",
  },
  "neo-25d-dark": {
    background: "dark-25d",
    finishing: "hd2d",
    textPrimary: "#F8FAFC",
    textMuted: "#94A3B8",
    accent: "#38BDF8",
    onAccent: "#090E1A",
    secondary: "#F59E0B",
    onSecondary: "#090E1A",
    surface: "rgba(18, 24, 38, 0.88)",
    border: "rgba(148, 163, 184, 0.32)",
  },
  "neo-25d-light": {
    background: "light-25d",
    finishing: "paper",
    textPrimary: "#0F172A",
    textMuted: "#475569",
    accent: "#2563EB",
    onAccent: "#FFFFFF",
    secondary: "#F59E0B",
    onSecondary: "#0F172A",
    surface: "#FFFFFF",
    border: "rgba(15, 23, 42, 0.14)",
  },
};

export const C = {
  nightDeep: "#090E1A",
  nightMid: "#162238",
  nightFog: "#1E3A5F",
  warmCore: "#FFF3C4",
  warmMid: "#FF9F43",
  warmAmbient: "#D97706",
  hpLow: "#EF4444",
  hpFull: "#22C55E",
  uiLine: "#F8FAFC",
  b1Paper: "#FDFDFC",
  b1Ink: "#262E31",
  b1Blue: "#356774",
  b1Yellow: "#F2C759",
};

export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Loop-safe oscillators: `period` should divide 1350 so frame 1350 === frame 0.
 * (Divisors used: 18, 27, 30, 45, 54, 75, 90, 135, 150, 270.)
 */
export const lsin = (f: number, period: number, phase = 0) =>
  Math.sin(2 * Math.PI * (f / period + phase));
export const lcos = (f: number, period: number, phase = 0) =>
  Math.cos(2 * Math.PI * (f / period + phase));

export const smooth = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

const hex = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const mix = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = hex(a);
  const [r2, g2, b2] = hex(b);
  const c = (x: number, y: number) =>
    Math.round(x + (y - x) * clamp(t))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r1, r2)}${c(g1, g2)}${c(b1, b2)}`;
};
export const shade = (h: string, amt: number) =>
  amt >= 0 ? mix(h, "#ffffff", amt) : mix(h, "#000000", -amt);

export const FONT_UI = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
export const FONT_PX = "'Silkscreen', 'JetBrains Mono', monospace";

/** Map a sequence-local audio frame onto the inclusive authored scene window. */
export function remapFrame(localFrame: number, localDurationInFrames: number, designStart: number, designEnd: number) {
  if (!Number.isFinite(localDurationInFrames) || localDurationInFrames <= 1) return designStart;
  return lerp(designStart, designEnd, clamp(localFrame / (localDurationInFrames - 1)));
}

function relativeLuminance(h: string) {
  const channels = hex(h).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function contrastRatio(hexA: string, hexB: string) {
  const la = relativeLuminance(hexA);
  const lb = relativeLuminance(hexB);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

export function pickContrastText(bgHex: string, dark = "#090E1A", light = "#FFFFFF") {
  return contrastRatio(bgHex, dark) >= contrastRatio(bgHex, light) ? dark : light;
}

export function resolveFinishingMode({
  finishing,
  stylePreset,
  hd2dOverlay = true,
}: {
  finishing?: "auto" | "hd2d" | "paper" | "none";
  stylePreset?: StylePresetName;
  hd2dOverlay?: boolean;
} = {}): "hd2d" | "paper" | "none" {
  if (!hd2dOverlay) return "none";
  if (finishing && finishing !== "auto") return finishing;
  return stylePreset ? STYLE_PRESETS[stylePreset].finishing : "hd2d";
}