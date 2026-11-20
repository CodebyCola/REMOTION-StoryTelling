import React from "react";
import { lcos, lsin } from "@engine/theme";

/** Flickering radial point light. Periods divide 1350 so loops remain seamless. */
export const DynamicLight: React.FC<{
  frame: number;
  x: number;
  y: number;
  radius: number;
  color?: string;
  core?: string;
  intensity?: number;
  flicker?: number;
  squash?: number;
  seed?: number;
}> = ({ frame, x, y, radius, color = "#FF9F43", core = "#FFF3C4", intensity = 1, flicker = 1, squash = 1, seed = 0 }) => {
  const fl = (lsin(frame, 45, seed) * 0.08 + lcos(frame, 27, seed * 0.7) * 0.04 + lsin(frame, 18, seed * 1.3) * 0.02) * flicker;
  const k = Math.max(0, intensity * (1 + fl));
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: radius * 2,
        height: radius * 2 * squash,
        translate: "-50% -50%",
        borderRadius: "50%",
        opacity: Math.min(1, k),
        mixBlendMode: "screen",
        background: `radial-gradient(ellipse at center, ${core}ee 0%, ${core}88 8%, ${color}88 28%, ${color}30 55%, rgba(0,0,0,0) 72%)`,
        pointerEvents: "none",
      }}
    />
  );
};
