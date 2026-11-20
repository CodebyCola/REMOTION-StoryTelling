import React from "react";
import { Easing, Interactive, interpolate } from "remotion";
import { Billboard, FAR_PX, FullLayer, GroundItem, GroundPlane, PLANE_W, project } from "@engine/hd2d/world";
import { Px } from "@engine/hd2d/Px";
import { TravelerSprite } from "@topics/safe-room/components/TravelerSprite";
import { DynamicLight } from "@engine/hd2d/DynamicLight";
import { Dust } from "@engine/hd2d/ParticleField";
import { cabin, fortress, grassTile, pine, plankTile } from "@topics/safe-room/components/sprites";
import { C, lsin, mulberry32 } from "@engine/theme";

const GRASS = grassTile();
const PLANK = plankTile();
const STARS = (() => {
  const rnd = mulberry32(2024);
  return Array.from({ length: 70 }, () => ({ x: rnd() * 1080, y: 40 + rnd() * 520, s: 2 + Math.floor(rnd() * 3), ph: rnd(), p: [54, 90, 135][Math.floor(rnd() * 3)] }));
})();

const TRAIL: [number, number][] = [[-120, 300], [-60, -500], [140, -1400], [-170, -2500], [120, -3700], [170, -5600]];
const trailPath = (pts: [number, number][]) =>
  pts.map(([u, d], i) => `${i === 0 ? "M" : "L"}${PLANE_W / 2 + u},${FAR_PX + d}`).join(" ");

const Hills: React.FC<{ f: number }> = ({ f }) => (
  <svg width={1080} height={300} viewBox="0 0 1080 300" style={{ position: "absolute", left: 0, top: 480 }}>
    <path d="M0 150 C120 90 220 140 330 110 C450 70 520 150 640 120 C760 90 900 140 1080 100 L1080 300 L0 300Z" fill="#0d1a30" opacity={0.9} />
    <path d="M0 200 C140 150 260 210 400 170 C540 130 640 210 780 180 C900 155 1000 190 1080 170 L1080 300 L0 300Z" fill="#102240" />
    <path d="M0 250 C180 215 320 255 480 232 C640 208 800 262 1080 226 L1080 300 L0 300Z" fill="#14294a" />
    <ellipse cx={300 + lsin(f, 270) * 40} cy={230} rx={420} ry={26} fill="rgba(30,58,95,0.5)" style={{ filter: "blur(16px)" }} />
    <ellipse cx={800 - lsin(f, 270) * 50} cy={262} rx={460} ry={30} fill="rgba(30,58,95,0.55)" style={{ filter: "blur(18px)" }} />
  </svg>
);

export const MeaningShot: React.FC<{ f: number }> = ({ f }) => {
  const ez = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) } as const;

  // emerging from the ceiling tilt, then a slow panoramic drift, then a behind-the-shoulder track
  const emerge = interpolate(f, [755, 815], [-520, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const walked = interpolate(f, [1008, 1090], [0, 430], ez);
  const camU = interpolate(f, [780, 1000], [-130, 20], ez) + walked * 0.18;
  const camD = walked * 0.93;
  const lanternGlow = interpolate(f, [1000, 1022], [0.0, 1], ez);
  const trav = { u: -120 + walked * 0.3, d: -400 - walked };
  const W_ = (u: number, d: number) => project(u - camU, d + camD);
  const tp = W_(trav.u, trav.d);

  const cab = cabin({ doorOpen: 0, winGlow: 1, tint: 0.12, porch: true, lantern: 0.7 + 0.15 * lsin(f, 45) });
  const cabP = W_(-480, -470);
  const sway = lsin(f, 90) * 14;

  const tree = (seed: number, tiers: number) => pine(tiers, seed, true);
  const treeL = tree(3, 6);
  const treeR = tree(8, 5);

  return (
    <FullLayer style={{ translate: `0px ${-emerge}px` }}>
      <FullLayer style={{ background: `linear-gradient(180deg, ${C.nightDeep} 0%, #0c1830 45%, ${C.nightFog} 78%, #284a73 100%)`, height: 800 }}>
        {STARS.map((s, i) => (
          <div key={i} style={{ position: "absolute", left: s.x, top: s.y, width: s.s, height: s.s, background: "#dbe7ff", opacity: 0.35 + 0.5 * (0.5 + 0.5 * lsin(f, s.p, s.ph)) }} />
        ))}
      </FullLayer>
      {/* far valley + fortress (parallax with camera) */}
      <div style={{ position: "absolute", left: -camU * 0.08, top: 0, width: 1080, height: 1920 }}>
        <div style={{ position: "absolute", left: 560, top: 270, filter: "blur(1.2px) brightness(1.5)" }}>
          <Px rects={fortress().rects} gw={60} gh={70} unit={8} />
        </div>
        <Hills f={f} />
      </div>

      <GroundPlane background={`#0c2230 ${GRASS.uri} ${-camU}px ${camD}px / ${GRASS.w}px ${GRASS.h}px`} style={{ filter: "brightness(0.7) saturate(0.95)" }}>
        <div style={{ position: "absolute", left: -camU, top: camD, width: PLANE_W, height: FAR_PX + 700 }}>
          <svg width={PLANE_W} height={FAR_PX + 700} style={{ position: "absolute", left: 0, top: 0 }}>
            <path d={trailPath(TRAIL)} fill="none" stroke="#12192c" strokeWidth={300} strokeLinejoin="round" strokeLinecap="round" />
            <path d={trailPath(TRAIL)} fill="none" stroke="#46527a" strokeWidth={250} strokeLinejoin="round" strokeLinecap="round" />
            <path d={trailPath(TRAIL)} fill="none" stroke="#6a77a3" strokeWidth={200} strokeDasharray="40 28" strokeLinejoin="round" opacity={0.55} />
          </svg>
          {/* porch deck + steps */}
          <GroundItem u={-300} d={-410} width={420} depth={170} style={{ background: `#5a3d28 ${PLANK.uri} 0 0 / 300px 150px`, boxShadow: "0 0 0 4px #2a1a10" }} />
          {[0, 1, 2].map((i) => (
            <GroundItem key={i} u={-120 + i * 16} d={-300 + i * 44} width={150 - i * 10} depth={40} style={{ background: i % 2 ? "#6e4a2f" : "#7d5636", boxShadow: "0 0 0 3px #2a1a10" }} />
          ))}
          {/* warm light pools: porch + windows */}
          <GroundItem u={-350} d={-380} width={900} depth={520} style={{ background: `radial-gradient(ellipse, rgba(255,159,67,0.55), rgba(255,159,67,0) 68%)`, mixBlendMode: "screen" }} />
        </div>
      </GroundPlane>

      <Billboard u={-480 - camU} d={-470 + camD} blur={0.3} shadow={{ w: 700, opacity: 0.45 }}>
        <Px rects={cab.rects} gw={cab.gw} gh={cab.gh} unit={16} />
      </Billboard>
      {[[-860, -250], [560, -900], [-760, -1500], [700, -2300]].map(([u, d], i) => (
        <Billboard key={i} u={u - camU} d={d + camD} blur={i > 1 ? 1.2 : 0.4} shadow={{ w: 150, opacity: 0.4 }}>
          <Px rects={tree(i + 2, 5).rects} gw={tree(i + 2, 5).gw} gh={tree(i + 2, 5).gh} unit={i > 1 ? 9 : 13} />
        </Billboard>
      ))}
      <Billboard u={trav.u - camU} d={trav.d + camD} shadow={{ w: 150, opacity: 0.6 }} style={{ zIndex: 2000 }}>
        <TravelerSprite frame={f} pose={f >= 1008 ? "walk" : "idle"} lantern={lanternGlow} unit={10} />
      </Billboard>

      {/* lights */}
      <DynamicLight frame={f} x={cabP.x} y={cabP.y - 120 * cabP.s} radius={560 * cabP.s} intensity={0.9} flicker={1} seed={0.3} />
      <DynamicLight frame={f} x={cabP.x + 160 * cabP.s} y={cabP.y - 160 * cabP.s} radius={180 * cabP.s} intensity={0.55 + 0.2 * lsin(f, 45)} seed={0.7} />
      <DynamicLight frame={f} x={tp.x + 78 * tp.s} y={tp.y - 52 * tp.s} radius={200 * tp.s} intensity={0.15 + 0.85 * lanternGlow} seed={0.9} />

      <Dust frame={f} opacity={0.55} count={34} color="#FFD98A" />
      {/* mist rolling in the valley */}
      <div style={{ position: "absolute", left: 0, top: 640, width: 1080, height: 240, background: "linear-gradient(180deg, rgba(30,58,95,0), rgba(30,58,95,0.55) 55%, rgba(30,58,95,0))" }} />

      {/* foreground pine branches framing both edges (blurred, horizontal parallax) */}
      <Interactive.Div
        name="Foreground pines"
        style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, zIndex: 60, translate: `${-camU * 1.4}px 0px` }}
      >
        <div style={{ position: "absolute", left: -330 + sway * 0.4, top: 1020, filter: "blur(6px) brightness(0.6)" }}>
          <Px rects={treeL.rects} gw={treeL.gw} gh={treeL.gh} unit={17} />
        </div>
        <div style={{ position: "absolute", left: 860 - sway * 0.4, top: 1180, filter: "blur(8px) brightness(0.55)" }}>
          <Px rects={treeR.rects} gw={treeR.gw} gh={treeR.gh} unit={15} />
        </div>
      </Interactive.Div>
    </FullLayer>
  );
};
