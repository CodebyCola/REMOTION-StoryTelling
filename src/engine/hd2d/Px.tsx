import React from "react";

export type R = { x: number; y: number; w: number; h: number; c: string };
export const r = (x: number, y: number, w: number, h: number, c: string): R => ({ x, y, w, h, c });
/** 1px-outlined block on the pixel grid. */
export const box = (x: number, y: number, w: number, h: number, fill: string, line = "#0a0d18"): R[] => [
  r(x - 1, y - 1, w + 2, h + 2, line),
  r(x, y, w, h, fill),
];

type PxProps = {
  rects: R[];
  gw: number; // grid width
  gh: number; // grid height
  unit: number; // px per grid cell
  style?: React.CSSProperties;
};

/** Crisp pixel-grid SVG sprite. */
export const Px: React.FC<PxProps> = ({ rects, gw, gh, unit, style }) => (
  <svg
    width={gw * unit}
    height={gh * unit}
    viewBox={`0 0 ${gw} ${gh}`}
    shapeRendering="crispEdges"
    style={{ display: "block", overflow: "visible", imageRendering: "pixelated", ...style }}
  >
    {rects.map((q, i) => (
      <rect key={i} x={q.x} y={q.y} width={q.w} height={q.h} fill={q.c} />
    ))}
  </svg>
);
