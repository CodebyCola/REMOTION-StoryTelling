import React from "react";
import { Easing, Interactive, interpolate } from "remotion";
import { INT, FIRE, TABLE, interiorCam } from "./CabinInterior";
import { project, project3 } from "@engine/hd2d/world";
import { C, FONT_UI, lsin } from "@engine/theme";

const LINE = C.uiLine;
const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) } as const;

const Label: React.FC<{ f: number; at: number; x: number; y: number; w: number; n: string; text: string; align?: "left" | "right"; name: string }> = ({ f, at, x, y, w, n, text, align = "left", name }) => (
  <Interactive.Div
    name={name}
    style={{
      position: "absolute",
      left: align === "left" ? x : x - w,
      top: y,
      width: w,
      boxSizing: "border-box",
      opacity: interpolate(f, [at, at + 20], [0, 1], clampOpts),
      translate: `0px ${interpolate(f, [at, at + 22], [10, 0], clampOpts)}px`,
      display: "flex",
      alignItems: "center",
      gap: 18,
      padding: "10px 22px",
      background: "rgba(9,14,26,0.78)",
      border: "1.5px solid rgba(248,250,252,0.85)",
      boxShadow: "0 0 22px rgba(255,159,67,0.28), 0 6px 0 rgba(0,0,0,0.35)",
      fontFamily: FONT_UI,
      fontWeight: 600,
      fontSize: 40,
      lineHeight: 1.12,
      color: C.uiLine,
    }}
  >
    <span style={{ color: C.warmMid, fontFamily: "'Silkscreen', monospace", fontSize: 40 }}>{n}</span>
    <span>{text}</span>
  </Interactive.Div>
);

const Dot: React.FC<{ x: number; y: number; o: number; f: number }> = ({ x, y, o, f }) => (
  <>
    <circle cx={x} cy={y} r={16 + 3 * lsin(f, 45)} fill="rgba(255,243,196,0.22)" opacity={o} />
    <circle cx={x} cy={y} r={7} fill={C.warmCore} stroke={LINE} strokeWidth={1.5} opacity={o} />
  </>
);

export const SignalCallouts: React.FC<{ f: number; reserveCaptionBand: boolean }> = ({ f, reserveCaptionBand }) => {
  const { cy, halfW, dFar, dNear, wallH } = INT;
  const out = interpolate(f, [745, 765], [1, 0], clampOpts);
  const cam = interiorCam(f);

  // anchors (screen coordinates before the camera transform)
  const fire = project(FIRE.u, FIRE.d, cy);
  const fireA = { x: fire.x, y: fire.y - 90 * fire.s };
  const cry = project(TABLE.u + 35, TABLE.d, cy);
  const cryA = { x: cry.x, y: cry.y - 215 * cry.s };

  // signal 2: wall outline (back wall rectangle + side wall top edges) and the door
  const bl = project3(-halfW, dFar, 0, cy);
  const br = project3(halfW, dFar, 0, cy);
  const tl = project3(-halfW, dFar, wallH, cy);
  const tr = project3(halfW, dFar, wallH, cy);
  const fl = project3(-halfW, dNear, 0, cy);
  const fr = project3(halfW, dNear, 0, cy);
  const ftl = project3(-halfW, dNear, wallH, cy);
  const ftr = project3(halfW, dNear, wallH, cy);
  const doorX0 = -halfW + 40;
  const dL = project3(doorX0, dFar, 0, cy);
  const dR = project3(doorX0 + 108, dFar, 0, cy);
  const dTL = project3(doorX0, dFar, 180, cy);
  const dTR = project3(doorX0 + 108, dFar, 180, cy);
  const pts = [fl, bl, tl, tr, br, fr, fr, ftr, tr, tl, ftl, fl, bl, br, dL, dTL, dTR, dR];
  const poly = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const perim = 4200;
  const trace = interpolate(f, [595, 650], [perim, 0], clampOpts);

  // labels
  const l1x = 90;
  const l1y = reserveCaptionBand ? 1110 : 1345;
  const l2y = 575;
  const l3y = reserveCaptionBand ? 1220 : 1440;

  const o1 = interpolate(f, [525, 540], [0, 1], clampOpts) * out;
  const line1 = interpolate(f, [540, 575], [0, 1], clampOpts);
  const o2 = interpolate(f, [595, 610], [0, 1], clampOpts) * out;
  const line2 = interpolate(f, [640, 665], [0, 1], clampOpts);
  const o3 = interpolate(f, [665, 680], [0, 1], clampOpts) * out;
  const line3 = interpolate(f, [690, 715], [0, 1], clampOpts);

  const ring = (start: number, k: number, per: number) => {
    const ph = (((f - start) / per + k) % 1 + 1) % 1;
    return ph;
  };

  return (
    <Interactive.Div
      name="Signal callouts"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1080,
        height: 1920,
        transformOrigin: "540px 1180px",
        scale: String(cam.scale),
        translate: `${cam.tx}px ${cam.ty}px`,
        opacity: out,
        zIndex: 70,
      }}
    >
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {/* Signal 1: pulse ring + connector */}
        {f >= 525
          ? [0, 1].map((k) => {
              const ph = ring(525, k * 0.5, 54);
              return <ellipse key={k} cx={fire.x} cy={fire.y - 20 * fire.s} rx={70 + ph * 190} ry={(70 + ph * 190) * 0.42} fill="none" stroke="rgba(255,200,120,1)" strokeWidth={2} opacity={(1 - ph) * 0.9 * o1} />;
            })
          : null}
        <line x1={fireA.x} y1={fireA.y} x2={fireA.x + (l1x + 130 - fireA.x) * line1} y2={fireA.y + (l1y - fireA.y) * line1} stroke={LINE} strokeWidth={1.5} opacity={o1} />
        <Dot x={fireA.x} y={fireA.y} o={o1} f={f} />

        {/* Signal 2: outline tracing the walls + closed door */}
        <polyline points={poly} fill="none" stroke="rgba(255,243,196,0.9)" strokeWidth={3} strokeDasharray={perim} strokeDashoffset={trace} strokeLinejoin="round" opacity={o2 * 0.95} style={{ filter: "drop-shadow(0 0 8px rgba(255,159,67,0.9))" }} />
        <line x1={tl.x + (tr.x - tl.x) * 0.5} y1={tl.y} x2={tl.x + (tr.x - tl.x) * 0.5} y2={tl.y + (l2y + 130 - tl.y) * line2} stroke={LINE} strokeWidth={1.5} opacity={o2} />
        <Dot x={tl.x + (tr.x - tl.x) * 0.5} y={tl.y} o={o2} f={f} />

        {/* Signal 3: ripple rings from the crystal */}
        {f >= 665
          ? [0, 1, 2].map((k) => {
              const ph = ring(665, k / 3, 90);
              return <ellipse key={k} cx={cry.x} cy={cry.y - 170 * cry.s} rx={20 + ph * 170} ry={(20 + ph * 170) * 0.55} fill="none" stroke="rgba(255,225,150,1)" strokeWidth={2} opacity={(1 - ph) * 0.9 * o3} />;
            })
          : null}
        <line x1={cryA.x} y1={cryA.y} x2={cryA.x + (cryA.x - cryA.x) * line3} y2={cryA.y + (l3y - cryA.y) * line3} stroke={LINE} strokeWidth={1.5} opacity={o3} />
        <Dot x={cryA.x} y={cryA.y} o={o3} f={f} />
      </svg>
      <Label f={f} at={560} x={l1x} y={l1y} w={760} n="1." text="Warna hangat = sinyal aman" name="Signal 1 label" />
      <Label f={f} at={640} x={540 + 380} y={l2y} w={760} n="2." text="Batas ruang jelas = kendali penuh" align="right" name="Signal 2 label" />
      <Label f={f} at={700} x={cryA.x + 90} y={l3y} w={640} n="3." text="Ritme pelan = napas melambat" align="right" name="Signal 3 label" />
    </Interactive.Div>
  );
};
