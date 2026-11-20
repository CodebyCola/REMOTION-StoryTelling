import React from "react";
import { Billboard, FullLayer, GroundItem, GroundPlane, project } from "@engine/hd2d/world";
import { Px } from "@engine/hd2d/Px";
import { TravelerSprite } from "./TravelerSprite";
import { HpBar } from "./HpBar";
import { DynamicLight } from "@engine/hd2d/DynamicLight";
import { Rain, Dust } from "@engine/hd2d/ParticleField";
import { cabin, cobbleTile, fence, grassTile, lampPost, pillar, ruinTower } from "./sprites";
import { C, lcos, lsin } from "@engine/theme";

export type ColdParams = {
  f: number;
  lightning: number;
  doorOpen: number;
  doorLight: number;
  bloom: number;
  rain: number;
  lantern: number;
  hp: number;
  hpFrac: number;
  fog: number;
  backGlow: number;
  /** extra shader for the traveler's walk (false = idle) */
  walking?: boolean;
};

/** Resting state at frame 0 / frame 1350 — Scene 1 starts here, Scene 5 ends here. */
export const COLD0 = { doorOpen: 0.3, doorLight: 0.35, rain: 1, lantern: 0.4, hp: 1, fog: 0, backGlow: 0 };

const COBBLE = cobbleTile();
const GRASS = grassTile();
export const DOOR_POS = (() => {
  const p = project(0, -1800);
  return { x: p.x, y: p.y - 11 * 24 * p.s };
})();

export const ColdPathWorld: React.FC<ColdParams> = ({
  f,
  lightning,
  doorOpen,
  doorLight,
  bloom,
  rain,
  lantern,
  hp,
  hpFrac,
  fog,
  backGlow,
  walking = true,
}) => {
  const scroll = ((f / 135) % 1) * COBBLE.h;
  const tower = ruinTower();
  const cab = cabin({ doorOpen, winGlow: 0.05 + doorLight * 0.1, tint: 0.85 - doorLight * 0.15 });
  const cabBack = cabin({ doorOpen: 0.6, winGlow: 0.9, tint: 0.35 });
  const lampGlow = 0.55 + 0.12 * lsin(f, 45);
  const traveler = project(-40, 90);
  const hpPos = { x: traveler.x, y: traveler.y - 262 * traveler.s - 46 };
  const lanternPos = { x: traveler.x + 78 * traveler.s, y: traveler.y - 54 * traveler.s };
  const door = DOOR_POS;
  const lightningBoost = lightning;

  return (
    <FullLayer>
      {/* SKY */}
      <FullLayer
        style={{
          background: `linear-gradient(180deg, ${C.nightDeep} 0%, #0b1426 38%, ${C.nightMid} 66%, ${C.nightFog} 100%)`,
          height: 800,
        }}
      />
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: -200 + i * 330 + lsin(f, 270, i * 0.25) * 40,
            top: 300 + (i % 2) * 90,
            width: 700,
            height: 160,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(40,70,115,0.45) 0%, rgba(40,70,115,0) 70%)",
            filter: "blur(18px)",
          }}
        />
      ))}
      {/* lightning wash */}
      <FullLayer style={{ height: 860, background: "linear-gradient(180deg, rgba(190,215,255,0.9), rgba(120,160,230,0.25))", opacity: lightningBoost * 0.5, mixBlendMode: "screen" }} />
      {/* distant ruined tower */}
      <div style={{ position: "absolute", left: 120, top: 190, filter: `blur(1.6px) brightness(${1 + lightningBoost * 1.6})`, opacity: 0.95 }}>
        <Px rects={tower.rects} gw={tower.gw} gh={tower.gh} unit={9} />
      </div>
      <div style={{ position: "absolute", left: 0, top: 640, width: 1080, height: 220, background: "linear-gradient(180deg, rgba(30,58,95,0), rgba(30,58,95,0.75) 55%, rgba(30,58,95,0))" }} />

      {/* GROUND */}
      <GroundPlane background={`#0a1220 ${GRASS.uri} 0 0 / ${GRASS.w}px ${GRASS.h}px`} style={{ filter: "brightness(0.62) saturate(0.85)" }}>
        {/* path */}
        <GroundItem u={0} d={-4290} width={560} depth={9420}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: COBBLE.uri,
              backgroundSize: `${COBBLE.w}px ${COBBLE.h}px`,
              backgroundPosition: `0px ${scroll}px`,
              boxShadow: "inset 14px 0 0 #090e1a, inset -14px 0 0 #090e1a",
              filter: "brightness(0.85) saturate(0.85)",
            }}
          />
        </GroundItem>
        {/* wet-sheen reflections of the doorway */}
        <GroundItem u={0} d={-1050} width={260} depth={1500} style={{ background: `linear-gradient(to bottom, rgba(255,159,67,${0.55 * doorLight}), rgba(255,159,67,0) 100%)`, mixBlendMode: "screen", filter: "blur(10px)" }} />
        <GroundItem u={0} d={-1800} width={900} depth={700} style={{ background: `radial-gradient(ellipse, rgba(255,159,67,${0.5 * doorLight}), rgba(255,159,67,0) 70%)`, mixBlendMode: "screen" }} />
        {/* lantern pool */}
        <GroundItem u={40} d={110} width={760} depth={560} style={{ background: `radial-gradient(ellipse, rgba(255,190,100,${0.42 * lantern}), rgba(255,159,67,0) 68%)`, mixBlendMode: "screen" }} />
        {/* puddles */}
        {[[-120, -300, 150, 70], [150, 20, 190, 80], [-200, 260, 160, 70]].map(([u, d, w, h], i) => (
          <GroundItem key={i} u={u} d={d} width={w} depth={h} style={{ borderRadius: "50%", background: "radial-gradient(ellipse, rgba(120,160,230,0.38), rgba(60,90,150,0.18) 60%, rgba(0,0,0,0) 72%)", mixBlendMode: "screen" }} />
        ))}
      </GroundPlane>

      {/* far fog on ground */}
      <div style={{ position: "absolute", left: 0, top: 700, width: 1080, height: 140, background: "linear-gradient(180deg, rgba(30,58,95,0.0), rgba(30,58,95,0.6), rgba(30,58,95,0))" }} />

      {/* SPRITES (back to front) */}
      <Billboard u={-620} d={-1100} blur={1.4} style={{ opacity: backGlow }}>
        <Px rects={cabBack.rects} gw={cabBack.gw} gh={cabBack.gh} unit={14} />
      </Billboard>
      <Billboard u={0} d={-1800} blur={0.6} shadow={{ w: 800, opacity: 0.4 }}>
        <Px rects={cab.rects} gw={cab.gw} gh={cab.gh} unit={24} />
      </Billboard>
      {[
        [-360, -1500, 18, 4],
        [360, -1350, 22, 7],
        [-380, -900, 22, 9],
        [372, -700, 18, 12],
        [-400, -330, 24, 15],
      ].map(([u, d, h, seed]) => {
        const pl = pillar(seed, h);
        return (
          <Billboard key={`${u}${d}`} u={u} d={d} shadow={{ w: 160, opacity: 0.5 }}>
            <Px rects={pl.rects} gw={pl.gw} gh={pl.gh} unit={11} />
          </Billboard>
        );
      })}
      {[-300, 300].map((u) => {
        const fe = fence(10);
        return (
          <Billboard key={`fence${u}`} u={u > 0 ? 430 : -430} d={-600} blur={0.4}>
            <Px rects={fe.rects} gw={fe.gw} gh={fe.gh} unit={9} />
          </Billboard>
        );
      })}
      {[[-330, -1000], [335, -450], [-345, -120]].map(([u, d], i) => {
        const lp = lampPost(lampGlow);
        return (
          <React.Fragment key={i}>
            <Billboard u={u} d={d} shadow={{ w: 90, opacity: 0.5 }}>
              <Px rects={lp.rects} gw={lp.gw} gh={lp.gh} unit={11} />
            </Billboard>
          </React.Fragment>
        );
      })}
      <Billboard u={-40} d={90} shadow={{ w: 150, opacity: 0.6, dx: 12 }}>
        <TravelerSprite frame={f} pose={walking ? "walk" : "idle"} lantern={lantern} unit={10} />
      </Billboard>

      {/* LIGHTS */}
      <DynamicLight frame={f} x={door.x} y={door.y} radius={90 + 240 * doorLight} intensity={0.45 + 0.65 * doorLight} flicker={0.8} seed={0.2} />
      <div style={{ position: "absolute", left: door.x - 3, top: door.y - 24, width: 6, height: 52, background: C.warmCore, opacity: 0.35 + 0.65 * doorLight, filter: "blur(2px)", boxShadow: `0 0 ${12 + 30 * doorLight}px ${4 + 10 * doorLight}px rgba(255,159,67,0.8)`, mixBlendMode: "screen", zIndex: 900 }} />
      <DynamicLight frame={f} x={lanternPos.x} y={lanternPos.y} radius={150 * traveler.s} intensity={0.35 + 0.75 * lantern} seed={0.6} />
      {[[-330, -1000], [335, -450], [-345, -120]].map(([u, d], i) => {
        const p = project(u, d);
        return <DynamicLight key={i} frame={f} x={p.x} y={p.y - 300 * p.s} radius={130 * p.s} intensity={0.22} flicker={1.6} seed={i * 0.3} />;
      })}

      {/* HP bar floating above traveler */}
      <div style={{ position: "absolute", left: hpPos.x - 95, top: hpPos.y - 50, zIndex: 950 }}>
        <HpBar frac={hpFrac} opacity={hp * (0.62 + 0.38 * lsin(f, 45, 0.25))} frame={f} />
      </div>

      <Dust frame={f} opacity={0.35} count={26} color="#8fb4ff" />
      <Rain frame={f} opacity={rain * 0.85} />

      {/* fog bank */}
      <FullLayer style={{ background: `radial-gradient(ellipse 120% 70% at 50% 60%, rgba(30,58,95,${0.88 * fog}), rgba(9,14,26,${0.7 * fog}))`, opacity: fog, zIndex: 960 }} />

      {/* warm bloom transition from the doorway */}
      <div
        style={{
          position: "absolute",
          left: door.x,
          top: door.y,
          width: 60 + 3400 * bloom * bloom,
          height: 60 + 3400 * bloom * bloom,
          translate: "-50% -50%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.warmCore} 0%, ${C.warmCore} 25%, ${C.warmMid} 58%, rgba(255,159,67,0) 100%)`,
          opacity: Math.min(1, bloom * 1.4),
          zIndex: 980,
        }}
      />
      <FullLayer style={{ zIndex: 1000, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0 }} />
      </FullLayer>
      <div style={{ display: "none" }}>{lcos(f, 27)}</div>
    </FullLayer>
  );
};
