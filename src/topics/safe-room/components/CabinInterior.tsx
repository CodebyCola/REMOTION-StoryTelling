import React from "react";
import { Easing, interpolate } from "remotion";
import { Billboard, FullLayer, project, Room } from "@engine/hd2d/world";
import { Px } from "@engine/hd2d/Px";
import { TravelerSprite } from "./TravelerSprite";
import { HpBar } from "./HpBar";
import { DynamicLight } from "@engine/hd2d/DynamicLight";
import { Dust, Embers, Rain } from "@engine/hd2d/ParticleField";
import { Sprite, bookshelf, campfire, crystal, interiorDoor, journal, plankTile, cobbleTile, rainWindow, table, wallMap } from "./sprites";
import { lsin } from "@engine/theme";

export const INT = { cy: 1270, halfW: 420, dNear: 70, dFar: -560, wallH: 430 };
export const FIRE = { u: 0, d: -110 };
export const TABLE = { u: 300, d: -210 };

const PLANK = plankTile();
const STONE = cobbleTile(1);

const sp = (s: Sprite, w: number) => <Px rects={s.rects} gw={s.gw} gh={s.gh} unit={w / s.gw} />;

/** Interior camera keyframes (global frames) — shared by Scene 2 and Scene 3 so the pull-back is seamless. */
export const interiorCam = (f: number) => {
  const ez = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) } as const;
  const scale = interpolate(f, [185, 420, 460, 486, 780], [1.58, 1.48, 1.46, 1.05, 0.98], ez);
  const tx = interpolate(f, [185, 420, 462, 486, 780], [0, 0, -200, 0, 0], ez);
  const ty = interpolate(f, [750, 800], [0, 900], ez);
  return { scale, tx, ty };
};

const travelerState = (f: number) => {
  const t = Math.min(1, Math.max(0, (f - 215) / 45));
  const e = 1 - (1 - t) * (1 - t);
  return {
    u: -560 + (-200 + 560) * e,
    d: 150 + (-70 - 150) * e,
    pose: f < 258 ? ("walk" as const) : f < 265 ? ("idle" as const) : ("sit" as const),
  };
};

export const CabinInterior: React.FC<{ f: number; showTraveler?: boolean }> = ({ f, showTraveler = true }) => {
  const { cy, halfW, dNear, dFar, wallH } = INT;
  const tr = travelerState(f);
  const trP = project(tr.u, tr.d, cy);
  const fireP = project(FIRE.u, FIRE.d, cy);
  const hpFrac = interpolate(f, [280, 340], [0.12, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const hpOpacity = interpolate(f, [228, 248, 350, 375], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sparkle = f > 282 && f < 350 ? 1 : 0;
  const sitH = tr.pose === "sit" ? 18 * 11 : 26 * 10;
  const crystalLift = 158 + lsin(f, 90) * 7;
  const crystalP = project(TABLE.u + 35, TABLE.d, cy);
  const rain = interpolate(f, [700, 780], [0.16, 0.16]);

  return (
    <FullLayer>
      <FullLayer style={{ background: "radial-gradient(ellipse 80% 55% at 50% 52%, #101a2e 0%, #090E1A 70%)" }} />
      <Rain frame={f} opacity={rain} />
      <Room
        cy={cy}
        halfW={halfW}
        dNear={dNear}
        dFar={dFar}
        wallH={wallH}
        warm={0.85 + 0.06 * lsin(f, 45)}
        fireU={FIRE.u}
        fireD={FIRE.d}
        floorBg={`#2a1a10 ${PLANK.uri} 0 0 / ${PLANK.w}px ${PLANK.h}px`}
        backBg={`#3b281a ${PLANK.uri} 0 0 / ${PLANK.w}px ${PLANK.h}px`}
        sideBg={`#222a3c ${STONE.uri} 0 0 / ${STONE.w}px ${STONE.h}px`}
        floorChildren={
          <div
            style={{
              position: "absolute",
              left: halfW + FIRE.u - 190,
              top: FIRE.d - dFar - 90,
              width: 380,
              height: 180,
              borderRadius: "50%",
              background: "radial-gradient(ellipse, #7a2f26 0%, #5b2a22 55%, #3a1a14 70%, rgba(0,0,0,0) 72%)",
              boxShadow: "0 0 0 6px rgba(201,154,59,0.35)",
              opacity: 0.9,
            }}
          />
        }
        back={
          <>
            <div style={{ position: "absolute", left: 40, top: wallH - 180 }}>{sp(interiorDoor(), 108)}</div>
            <div style={{ position: "absolute", left: 190, top: 96 }}>{sp(wallMap(), 192)}</div>
            <div style={{ position: "absolute", left: 410, top: 128 }}>{sp(rainWindow(f), 154)}</div>
            <div style={{ position: "absolute", left: 600, top: wallH - 330 }}>{sp(bookshelf(), 221)}</div>
          </>
        }
      />

      {/* floor sprites */}
      <Billboard u={TABLE.u} d={TABLE.d} cy={cy} shadow={{ w: 240, opacity: 0.5 }}>
        <Px rects={table().rects} gw={22} gh={16} unit={10} />
      </Billboard>
      <Billboard u={TABLE.u - 40} d={TABLE.d} cy={cy} lift={152}>
        <Px rects={journal().rects} gw={12} gh={8} unit={8} />
      </Billboard>
      <Billboard u={TABLE.u + 35} d={TABLE.d} cy={cy} lift={crystalLift}>
        <Px rects={crystal(f).rects} gw={9} gh={9} unit={9} />
      </Billboard>
      <Billboard u={FIRE.u} d={FIRE.d} cy={cy} shadow={{ w: 260, opacity: 0.4 }}>
        <Px rects={campfire(f).rects} gw={20} gh={19} unit={11} />
      </Billboard>
      {showTraveler ? (
        <Billboard u={tr.u} d={tr.d} cy={cy} shadow={{ w: 150, opacity: 0.55 }}>
          <TravelerSprite frame={f} pose={tr.pose} unit={tr.pose === "sit" ? 11 : 10} lantern={0.5} />
        </Billboard>
      ) : null}

      {/* lights */}
      <DynamicLight frame={f} x={fireP.x} y={fireP.y - 70 * fireP.s} radius={470 * fireP.s} intensity={0.95} flicker={1.4} />
      <DynamicLight frame={f} x={crystalP.x} y={crystalP.y - (crystalLift + 40) * crystalP.s} radius={150 * crystalP.s} color="#FFD98A" core="#FFF3C4" intensity={0.7 + 0.2 * lsin(f, 90)} flicker={0.3} seed={0.4} />
      <DynamicLight frame={f} x={540 + 200} y={cy - 280} radius={160} color="#5f86b8" core="#9ec3ee" intensity={0.16} flicker={0} />

      <Embers frame={f} x={fireP.x} y={fireP.y - 60 * fireP.s} spread={150} rise={560} />
      <Dust frame={f} opacity={0.8} count={44} />

      {/* HP bar */}
      {showTraveler ? (
        <div style={{ position: "absolute", left: trP.x - 95, top: trP.y - sitH * trP.s - 90, zIndex: 950 }}>
          <HpBar frac={hpFrac} opacity={hpOpacity} sparkle={sparkle} frame={f} />
        </div>
      ) : null}
      
    </FullLayer>
  );
};
