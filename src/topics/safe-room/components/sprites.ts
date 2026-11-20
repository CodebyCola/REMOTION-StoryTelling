import { R, r, box } from "@engine/hd2d/Px";
import { lcos, lsin, mix, mulberry32, shade } from "@engine/theme";

export type Sprite = { rects: R[]; gw: number; gh: number };

const OL = "#0a0d18";

/* ------------------------------------------------------------------ traveler */
const T = {
  cloak: "#2f3b5e",
  cloakD: "#232d4a",
  cloakL: "#44567f",
  hood: "#3a4a73",
  hoodL: "#5a6e9d",
  scarf: "#b4443a",
  skin: "#e3b48a",
  boots: "#3a281d",
  metal: "#7a6240",
};

/** Traveler seen from behind (walk / idle). `lantern` 0..1 is flame brightness. */
export const travelerBack = (frame: number, walking: boolean, lantern: number, lanternOn = true): Sprite => {
  const R_: R[] = [];
  const ph = (frame % 30) / 30;
  const stepA = ph < 0.5;
  // legs / boots
  const l1 = walking ? (stepA ? 23 : 21) : 22;
  const l2 = walking ? (stepA ? 21 : 23) : 22;
  R_.push(...box(4, l1, 3, 3, T.boots), ...box(9, l2, 3, 3, T.boots));
  // hood
  R_.push(...box(4, 1, 8, 7, T.hood));
  R_.push(r(5, 2, 2, 1, T.hoodL), r(5, 3, 1, 2, T.hoodL), r(8, 3, 1, 4, "#2a3656"));
  // body
  R_.push(...box(2, 9, 12, 9, T.cloak));
  R_.push(r(3, 10, 1, 7, T.cloakL), r(6, 10, 1, 8, T.cloakD), r(9, 11, 1, 7, T.cloakD), r(12, 10, 1, 7, T.cloakD));
  // fluttering hem (3 rows, increasing sway)
  for (let i = 0; i < 3; i++) {
    const sw = Math.round(lsin(frame, 45, i * 0.11) * (0.6 + i * 0.7) + (walking ? lsin(frame, 30) * 0.5 : 0));
    R_.push(r(2 + sw - 1, 18 + i, 1, 1, OL), r(14 + sw, 18 + i, 1, 1, OL));
    R_.push(r(2 + sw, 18 + i, 12, 1, i === 2 ? T.cloakD : T.cloak));
  }
  R_.push(r(2 + Math.round(lsin(frame, 45, 0.22) * 2), 21, 12, 1, OL));
  // scarf + tail
  const tail = Math.round(lsin(frame, 27) * 1);
  R_.push(r(4, 8, 8, 1, T.scarf), r(9 + tail, 9, 2, 3, T.scarf), r(9 + tail, 12, 2, 1, "#8a2f28"));
  // lantern arm (viewer's right)
  const swing = walking ? Math.round(lsin(frame, 30) * 1) : 0;
  R_.push(...box(13, 10, 2, 5, T.cloak), r(14, 15, 1, 1, T.skin));
  if (lanternOn) {
    const ly = 17 + (walking ? (stepA ? 0 : 1) : 0);
    R_.push(r(14 + swing, 16, 1, 1, T.metal));
    R_.push(...box(13 + swing, ly, 3, 4, T.metal));
    const flame = mix("#a8672b", "#fff0b0", lantern);
    R_.push(r(14 + swing, ly + 1, 1, 2, flame));
  }
  return { rects: R_, gw: 18, gh: 26 };
};

/** Traveler seated, side view, facing right (toward the fire). */
export const travelerSit = (frame: number): Sprite => {
  const R_: R[] = [];
  const breathe = Math.round(lsin(frame, 90) * 0.5 + 0.5);
  R_.push(...box(2, 9, 10, 8, T.cloakD));
  R_.push(...box(5, 4 + breathe, 7, 8, T.cloak));
  R_.push(r(6, 5 + breathe, 1, 6, T.cloakL), r(9, 6 + breathe, 1, 5, T.cloakD));
  R_.push(...box(7, 0 + breathe, 7, 6, T.hood));
  R_.push(r(8, 1 + breathe, 2, 1, T.hoodL));
  R_.push(r(12, 2 + breathe, 2, 3, T.skin), r(13, 3 + breathe, 1, 1, "#241b1b"));
  R_.push(r(8, 6 + breathe, 5, 1, T.scarf));
  R_.push(...box(11, 10, 6, 3, T.cloak));
  R_.push(...box(15, 12, 4, 3, T.boots));
  R_.push(r(11, 7 + breathe, 4, 2, T.cloak), r(14, 8 + breathe, 1, 1, T.skin));
  return { rects: R_, gw: 21, gh: 18 };
};

/* ---------------------------------------------------------------------- fire */
export const campfire = (frame: number, scale = 1): Sprite => {
  const R_: R[] = [];
  const gw = 20;
  // stone ring (soft-edged, no heavy black outline)
  const rnd = mulberry32(31);
  for (let i = 0; i < 10; i++) {
    const c = mix("#6b7285", "#a3abc0", rnd());
    R_.push(r(i * 2, 17, 2, 2, shade(c, -0.35)), r(i * 2, 17, 2, 1, c));
  }
  // logs
  R_.push(r(3, 15, 14, 2, "#2a170c"), r(4, 15, 12, 1, "#5e3c25"), r(5, 13, 10, 2, "#3b2415"), r(6, 13, 8, 1, "#6e4629"));
  R_.push(r(6, 15, 1, 1, "#d97706"), r(13, 15, 1, 1, "#d97706"));
  // flame columns
  const prof = [2, 4, 7, 9, 11, 12, 12, 11, 9, 7, 4, 2];
  for (let i = 0; i < prof.length; i++) {
    const x = 4 + i;
    const v = lsin(frame, 18 + i * 3, i * 0.13) * 1.5 + lcos(frame, 27, i * 0.2) * 1.0;
    const h = Math.max(2, Math.round((prof[i] + v) * 0.95 * scale));
    R_.push(r(x, 13 - h, 1, h, "#D97706"));
    const h2 = Math.round(h * 0.78);
    if (i > 0 && i < prof.length - 1) R_.push(r(x, 13 - h2, 1, h2, "#FF9F43"));
    const h3 = Math.round(h * 0.55);
    if (i > 1 && i < prof.length - 2) R_.push(r(x, 13 - h3, 1, h3, "#FFC15E"));
    const h4 = Math.round(h * 0.32);
    if (i > 3 && i < prof.length - 4) R_.push(r(x, 13 - h4, 1, h4, "#FFF3C4"));
  }
  return { rects: R_, gw, gh: 19 };
};

/* ---------------------------------------------------------------------- trees */
export const pine = (tiers: number, seed: number, dark = false): Sprite => {
  const rnd = mulberry32(seed);
  const gw = 10 + tiers * 4 + 2;
  const cx = gw / 2;
  const R_: R[] = [];
  const base = dark ? "#0f2a2c" : "#1d4a46";
  const light = dark ? "#16403f" : "#2c6a5a";
  const shd = dark ? "#08181a" : "#102f30";
  let y = 0;
  for (let t = 0; t < tiers; t++) {
    const startW = 2 + t * 4;
    for (let k = 0; k < 5; k++) {
      const wid = startW + k * 2 + (rnd() < 0.3 ? 2 : 0);
      const x0 = cx - wid / 2;
      R_.push(r(x0 - 1, y + k, 1, 1, OL), r(x0 + wid, y + k, 1, 1, OL));
      R_.push(r(x0, y + k, wid / 2, 1, k % 2 ? light : base));
      R_.push(r(cx, y + k, wid / 2, 1, k === 4 ? shd : mix(base, shd, 0.55)));
    }
    y += 4;
  }
  R_.push(...box(cx - 1, y + 1, 2, 4, "#2a1d17"));
  return { rects: R_, gw, gh: y + 6 };
};

/* ---------------------------------------------------------------------- tower */
export const ruinTower = (): Sprite => {
  const R_: R[] = [];
  const body = "#0f1a2e";
  const hl = "#1b2a47";
  // main shaft x6..17, y8..59 ; broken crown
  R_.push(r(6, 10, 12, 50, body), r(6, 10, 1, 50, hl), r(7, 10, 1, 50, "#14213a"));
  R_.push(r(5, 6, 14, 4, body), r(5, 6, 14, 1, hl));
  R_.push(r(5, 2, 3, 4, body), r(10, 0, 3, 6, body), r(16, 3, 3, 3, body));
  R_.push(r(10, 0, 1, 6, hl));
  // side wing (broken wall)
  R_.push(r(0, 38, 7, 22, body), r(0, 34, 3, 4, body), r(4, 36, 3, 2, body));
  R_.push(r(17, 30, 6, 30, body), r(19, 26, 4, 4, body));
  // windows (very dim)
  for (const [x, y] of [[9, 16], [13, 16], [11, 28], [9, 40], [13, 40]]) R_.push(r(x, y, 2, 4, "#070c18"));
  R_.push(r(11, 28, 2, 4, "#2a2f45"));
  return { rects: R_, gw: 23, gh: 60 };
};

/* --------------------------------------------------------------- cabin exterior */
export const cabin = (opts: {
  doorOpen: number; // 0..1 crack of warm light
  winGlow: number; // 0..1
  tint: number; // 0 = fully lit colours, 1 = cold-night tint
  porch?: boolean;
  lantern?: number; // porch lantern brightness 0..1 (-1 = absent)
}): Sprite => {
  const { doorOpen, winGlow, tint, porch = false, lantern = -1 } = opts;
  const t = (c: string) => mix(c, "#14243d", tint * 0.72);
  const R_: R[] = [];
  const rnd = mulberry32(77);
  const gw = 38;
  // roof gable (rows y=3..13)
  for (let y = 3; y <= 13; y++) {
    const wid = 4 + (y - 3) * 3;
    const x0 = Math.floor(19 - wid / 2);
    R_.push(r(x0 - 1, y, 1, 1, OL), r(x0 + wid, y, 1, 1, OL));
    for (let x = 0; x < wid; x += 3) {
      R_.push(r(x0 + x, y, Math.min(3, wid - x), 1, t((y + Math.floor(x / 3)) % 2 ? "#6b3b32" : "#80473a")));
    }
    R_.push(r(x0, y, wid, 1, "rgba(0,0,0,0)"));
  }
  R_.push(r(4, 14, 30, 1, OL), r(5, 14, 28, 1, t("#4d2a24")));
  // chimney
  for (let y = 0; y < 8; y++) for (let x = 0; x < 4; x++) R_.push(r(26 + x, y, 1, 1, t(rnd() < 0.5 ? "#6b7285" : "#58607a")));
  R_.push(r(25, 0, 6, 1, OL));
  // walls (y15..26)
  R_.push(r(5, 15, 28, 12, OL), r(6, 15, 26, 12, t("#6b4a30")));
  for (let y = 16; y < 27; y += 2) R_.push(r(6, y, 26, 1, t("#553a25")));
  for (let y = 15; y < 27; y += 2) for (let x = 6; x < 32; x += 1) if (rnd() < 0.06) R_.push(r(x, y, 1, 1, t("#7d5a3b")));
  R_.push(r(5, 15, 1, 12, t("#3b281a")), r(32, 15, 1, 12, t("#3b281a")));
  // window left
  R_.push(...box(9, 17, 5, 5, t("#3b281a")), r(10, 18, 3, 3, mix("#1E3A5F", "#FFB347", winGlow)));
  R_.push(r(11, 18, 1, 3, t("#3b281a")), r(10, 19, 3, 1, t("#3b281a")));
  // window right
  R_.push(...box(24, 17, 5, 5, t("#3b281a")), r(25, 18, 3, 3, mix("#1E3A5F", "#FFB347", winGlow)));
  R_.push(r(26, 18, 1, 3, t("#3b281a")), r(25, 19, 3, 1, t("#3b281a")));
  // door (x16..21, y17..26)
  R_.push(...box(16, 17, 6, 10, t("#4a2f1d")));
  for (let x = 17; x < 21; x += 2) R_.push(r(x, 17, 1, 10, t("#3a2417")));
  R_.push(r(16, 19, 6, 1, t("#2a2a33")), r(16, 24, 6, 1, t("#2a2a33")), r(20, 22, 1, 1, "#c9a86a"));
  const crack = Math.round(doorOpen * 4);
  if (crack > 0) {
    R_.push(r(16, 17, crack, 10, mix("#FF9F43", "#FFF3C4", doorOpen * 0.6)));
    R_.push(r(16 + crack, 17, 1, 10, "#2a1a10"));
  }
  // foundation stones (y27..31)
  for (let y = 27; y < 32; y++) {
    let x = 3 + (y % 2);
    while (x < 35) {
      const w = 2 + Math.floor(rnd() * 3);
      R_.push(r(x, y, w, 1, OL));
      R_.push(r(x, y, w - 1, 1, t(mix("#566077", "#8a93a8", rnd()))));
      x += w;
    }
  }
  if (porch) {
    R_.push(r(2, 27, 34, 2, OL), r(3, 27, 32, 1, t("#8a6240")), r(3, 28, 32, 1, t("#5a3d28")));
    R_.push(r(14, 29, 10, 1, t("#7a5638")), r(12, 30, 14, 1, t("#6a4a30")), r(10, 31, 18, 1, t("#5a3d28")));
    R_.push(...box(4, 22, 1, 5, t("#3b281a")), ...box(33, 22, 1, 5, t("#3b281a")));
  }
  if (lantern >= 0) {
    R_.push(r(23, 22, 1, 1, "#7a6240"), ...box(22, 23, 3, 3, "#7a6240"), r(23, 24, 1, 1, mix("#c77a2a", "#fff0b0", lantern)));
  }
  return { rects: R_, gw, gh: 33 };
};

/* ------------------------------------------------------------------ lamp post */
export const lampPost = (glow: number): Sprite => {
  const R_: R[] = [];
  R_.push(...box(2, 28, 5, 2, "#1d2030"), ...box(3, 8, 3, 20, "#252a3d"), r(3, 10, 1, 17, "#3a4160"));
  R_.push(...box(0, 4, 9, 4, "#252a3d"), r(1, 5, 7, 2, mix("#b8782f", "#fff3c4", glow)));
  R_.push(...box(2, 1, 5, 3, "#252a3d"));
  return { rects: R_, gw: 9, gh: 31 };
};

/* ------------------------------------------------------------------- ruin bits */
export const pillar = (seed: number, h = 22): Sprite => {
  const rnd = mulberry32(seed);
  const R_: R[] = [];
  const top = Math.floor(rnd() * 4);
  R_.push(r(0, top + 2, 12, h, OL));
  for (let y = top + 3; y < h + 2; y += 3) {
    let x = 1;
    while (x < 11) {
      const w = 3 + Math.floor(rnd() * 3);
      R_.push(r(x, y, Math.min(w, 11 - x), 2, mix("#2d3650", "#4a5678", rnd())));
      x += w + 0;
    }
  }
  R_.push(r(1 + Math.floor(rnd() * 5), top + 1, 3, 1, "#2d3650"));
  return { rects: R_, gw: 12, gh: h + 3 };
};

export const fence = (n: number): Sprite => {
  const R_: R[] = [r(0, 4, n * 3, 1, "#20263a"), r(0, 8, n * 3, 1, "#20263a")];
  for (let i = 0; i < n; i++) {
    R_.push(r(i * 3 + 1, 1, 1, 10, "#2a3150"), r(i * 3, 0, 3, 1, "#3a4468"));
  }
  return { rects: R_, gw: n * 3, gh: 11 };
};

/* ------------------------------------------------------------------ interior */
export const bookshelf = (): Sprite => {
  const rnd = mulberry32(12);
  const R_: R[] = [...box(0, 0, 16, 24, "#4a2f1d")];
  const cols = ["#8a3b36", "#3b5e8a", "#c79a3b", "#4f7a52", "#7a4a8a", "#b0623a", "#d8c9a0"];
  for (let s = 0; s < 4; s++) {
    const y = 2 + s * 6;
    R_.push(r(1, y + 4, 14, 1, "#2c1b10"));
    let x = 2;
    while (x < 14) {
      const w = 1 + Math.floor(rnd() * 2);
      const h = 3 + Math.floor(rnd() * 2);
      R_.push(r(x, y + 4 - h, w, h, cols[Math.floor(rnd() * cols.length)]));
      x += w;
    }
  }
  return { rects: R_, gw: 17, gh: 25 };
};

export const wallMap = (): Sprite => {
  const R_: R[] = [...box(0, 0, 14, 10, "#cdb98a", "#3b281a")];
  R_.push(r(2, 2, 4, 1, "#8a7a55"), r(5, 3, 5, 1, "#8a7a55"), r(3, 5, 3, 1, "#6f8a6a"), r(7, 6, 4, 2, "#6f8a6a"), r(10, 4, 1, 1, "#b0392f"), r(9, 5, 3, 1, "#b0392f"));
  return { rects: R_, gw: 16, gh: 12 };
};

export const rainWindow = (frame: number): Sprite => {
  const R_: R[] = [...box(0, 0, 12, 14, "#3b281a"), r(1, 1, 10, 12, "#17304f")];
  const rnd = mulberry32(3);
  for (let i = 0; i < 9; i++) {
    const x = 1 + Math.floor(rnd() * 10);
    const y = 1 + Math.floor((rnd() * 12 + frame / 3) % 12);
    R_.push(r(x, y, 1, 2, "#5f86b8"));
  }
  R_.push(r(5, 1, 2, 12, "#3b281a"), r(1, 6, 10, 1, "#3b281a"));
  return { rects: R_, gw: 14, gh: 16 };
};

export const interiorDoor = (): Sprite => {
  const R_: R[] = [...box(0, 0, 10, 18, "#4a2f1d")];
  for (let x = 1; x < 10; x += 3) R_.push(r(x, 0, 1, 18, "#33200f"));
  R_.push(r(0, 4, 10, 1, "#2a2a33"), r(0, 13, 10, 1, "#2a2a33"), r(8, 9, 1, 2, "#c9a86a"));
  return { rects: R_, gw: 12, gh: 20 };
};

export const table = (): Sprite => {
  const R_: R[] = [...box(0, 0, 20, 3, "#8a5a36"), r(0, 0, 20, 1, "#a8723f")];
  R_.push(...box(2, 3, 2, 11, "#5a3a22"), ...box(16, 3, 2, 11, "#5a3a22"));
  return { rects: R_, gw: 22, gh: 16 };
};

export const crystal = (frame: number): Sprite => {
  const R_: R[] = [];
  const p = 0.5 + 0.5 * lsin(frame, 90);
  const a = mix("#FFD98A", "#FFF3C4", p);
  const b = mix("#E0A44A", "#FFD98A", p);
  const rows = [1, 3, 5, 7, 7, 5, 3, 1];
  rows.forEach((w, i) => {
    const x = 4 - Math.floor(w / 2);
    R_.push(r(x - 1, i, 1, 1, OL), r(x + w, i, 1, 1, OL));
    R_.push(r(x, i, Math.ceil(w / 2), 1, a), r(x + Math.ceil(w / 2), i, Math.floor(w / 2), 1, b));
  });
  R_.push(r(3, 8, 3, 1, OL));
  return { rects: R_, gw: 9, gh: 9 };
};

export const journal = (): Sprite => {
  const R_: R[] = [...box(0, 2, 10, 4, "#d9cba0", "#3b281a"), r(5, 2, 1, 4, "#a8996e")];
  for (let i = 0; i < 3; i++) R_.push(r(1, 3 + i, 3, 1, "#7a6a45"), r(6, 3 + i, 3, 1, "#7a6a45"));
  return { rects: R_, gw: 12, gh: 8 };
};

export const mug = (): Sprite => ({
  rects: [...box(0, 2, 4, 4, "#c9c2b0"), r(4, 3, 2, 2, "#c9c2b0"), r(1, 2, 2, 1, "#6b3b22")],
  gw: 7,
  gh: 8,
});

export const beam = (len: number): Sprite => ({
  rects: [...box(0, 0, len, 5, "#2a1a10"), r(0, 0, len, 1, "#40291a"), r(0, 4, len, 1, "#170e08")],
  gw: len + 2,
  gh: 7,
});

/* ----------------------------------------------------------- ground textures */
const svgUri = (w: number, h: number, body: string) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' shape-rendering='crispEdges'>${body}</svg>`,
  )}")`;

export const cobbleTile = (warm = 0): { uri: string; w: number; h: number } => {
  const rnd = mulberry32(404);
  const w = 360;
  const h = 270;
  let b = `<rect width='${w}' height='${h}' fill='#0d1424'/>`;
  const rows = 6;
  const rh = h / rows;
  for (let row = 0; row < rows; row++) {
    let x = row % 2 ? -30 : 0;
    while (x < w) {
      const sw = 54 + Math.floor(rnd() * 26);
      const col = mix("#27304a", "#46506f", rnd());
      const top = shade(col, 0.18);
      b += `<rect x='${x + 3}' y='${row * rh + 3}' width='${sw - 6}' height='${rh - 6}' fill='${shade(col, warm * 0.2)}'/>`;
      b += `<rect x='${x + 3}' y='${row * rh + 3}' width='${sw - 6}' height='6' fill='${top}'/>`;
      b += `<rect x='${x + 3}' y='${row * rh + rh - 9}' width='${sw - 6}' height='6' fill='${shade(col, -0.3)}'/>`;
      x += sw;
    }
  }
  return { uri: svgUri(w, h, b), w, h };
};

export const plankTile = (): { uri: string; w: number; h: number } => {
  const rnd = mulberry32(808);
  const w = 480;
  const h = 240;
  let b = `<rect width='${w}' height='${h}' fill='#2a1a10'/>`;
  const rows = 6;
  const rh = h / rows;
  for (let row = 0; row < rows; row++) {
    let x = -rnd() * 160;
    while (x < w) {
      const pw = 140 + rnd() * 120;
      const col = mix("#6b4527", "#8f6238", rnd());
      b += `<rect x='${x + 2}' y='${row * rh + 2}' width='${pw - 4}' height='${rh - 4}' fill='${col}'/>`;
      b += `<rect x='${x + 2}' y='${row * rh + 2}' width='${pw - 4}' height='5' fill='${shade(col, 0.15)}'/>`;
      for (let g = 0; g < 3; g++) b += `<rect x='${x + 10 + rnd() * (pw - 40)}' y='${row * rh + 14 + rnd() * 30}' width='${20 + rnd() * 30}' height='3' fill='${shade(col, -0.18)}'/>`;
      x += pw;
    }
  }
  return { uri: svgUri(w, h, b), w, h };
};

export const grassTile = (): { uri: string; w: number; h: number } => {
  const rnd = mulberry32(606);
  const w = 360;
  const h = 360;
  let b = `<rect width='${w}' height='${h}' fill='#10283a'/>`;
  for (let i = 0; i < 520; i++) {
    const x = Math.floor(rnd() * w);
    const y = Math.floor(rnd() * h);
    const c = mix("#0b1f30", "#1f5a52", rnd() * rnd());
    b += `<rect x='${x}' y='${y}' width='${6 + rnd() * 8}' height='${6 + rnd() * 6}' fill='${c}'/>`;
  }
  return { uri: svgUri(w, h, b), w, h };
};

/* --------------------------------------------------------------- fortress */
export const fortress = (): Sprite => {
  const rnd = mulberry32(55);
  const R_: R[] = [];
  const body = "#0e1830";
  const hl = "#1c2d4e";
  // mountain
  for (let y = 24; y < 70; y++) {
    const hw = 5 + (y - 24) * 0.6 + (rnd() < 0.4 ? 1 : 0);
    const x0 = Math.round(30 - hw);
    const w = Math.round(hw * 2);
    R_.push(r(x0, y, w, 1, body), r(x0, y, 2, 1, hl));
  }
  // keep + towers
  R_.push(r(26, 4, 8, 22, body), r(26, 4, 1, 22, hl), r(24, 2, 12, 3, body));
  for (let x = 24; x < 36; x += 3) R_.push(r(x, 0, 2, 2, body));
  R_.push(r(18, 12, 5, 14, body), r(37, 14, 5, 12, body), r(17, 10, 7, 2, body), r(36, 12, 7, 2, body));
  R_.push(r(22, 20, 16, 6, body));
  for (const [x, y] of [[28, 8], [31, 8], [29, 14], [20, 16], [39, 18]]) R_.push(r(x, y, 1, 2, "#3a2a1c"));
  return { rects: R_, gw: 60, gh: 70 };
};
