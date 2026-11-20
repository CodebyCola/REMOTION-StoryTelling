import React from "react";
import { Easing, interpolate } from "remotion";
import { Px } from "@engine/hd2d/Px";
import { beam } from "./sprites";

/** Scene 3 -> 4 transition: dark wooden ceiling beams sweep down as the camera tilts up into the night sky. */
export const CeilingBeams: React.FC<{ f: number }> = ({ f }) => {
  if (f < 748 || f > 800) return null;
  const b = beam(90);
  const op = interpolate(f, [748, 758, 786, 800], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", inset: 0, opacity: op, zIndex: 45, pointerEvents: "none" }}>
      {[0, 1, 2, 3].map((i) => {
        const y = interpolate(f, [752, 800], [-300 + i * 80, 1900 + i * 420], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) }) - i * 380;
        return (
          <div key={i} style={{ position: "absolute", left: -30, top: y, filter: `blur(${i * 1.2}px) brightness(${0.6 - i * 0.07})` }}>
            <Px rects={b.rects} gw={b.gw} gh={b.gh} unit={12 + i * 2} style={{ width: 1140, height: 80 + i * 28 }} />
          </div>
        );
      })}
    </div>
  );
};
