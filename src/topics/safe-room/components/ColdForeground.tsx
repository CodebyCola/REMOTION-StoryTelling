import React from "react";
import { Px } from "@engine/hd2d/Px";
import { pillar } from "./sprites";
import { Rain } from "@engine/hd2d/ParticleField";

/** Foreground layer shared by Scene 1 and Scene 5 (so the loop matches). */
export const ColdForeground: React.FC<{ f: number; scale: number; rain: number; ruin: number }> = ({ f, scale, rain, ruin }) => {
  const wall = pillar(5, 26);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1080,
        height: 1920,
        transformOrigin: "540px 1100px",
        scale: String(scale),
        zIndex: 60,
      }}
    >
      <div style={{ position: "absolute", left: -90, top: 1560, filter: "blur(9px) brightness(0.5)", opacity: 0.9 * ruin }}>
        <Px rects={wall.rects} gw={wall.gw} gh={wall.gh} unit={30} />
      </div>
      <div style={{ position: "absolute", left: 800, top: 1640, filter: "blur(12px) brightness(0.45)", opacity: 0.9 * ruin }}>
        <Px rects={wall.rects} gw={wall.gw} gh={wall.gh} unit={26} />
      </div>
      <Rain frame={f} opacity={0.85 * rain} front />
    </div>
  );
};
