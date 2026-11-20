import React from "react";
import { H, W } from "@engine/theme";

/** Shared HD-2D camera model: a CSS-3D ground plane + analytically projected upright sprites. */
export const CAM = {
  D: 700, // perspective px (spec)
  theta: 55, // ground tilt in degrees (spec: 52-60)
  cx: W / 2,
  cy: 1100,
};
const th = (CAM.theta * Math.PI) / 180;

/** u = lateral (px, 0 = centre), d = depth (negative = far away, positive = toward camera). */
export const project = (u: number, d: number, cy: number = CAM.cy) => {
  const s = CAM.D / (CAM.D - d * Math.sin(th));
  return { x: CAM.cx + u * s, y: cy + d * Math.cos(th) * s, s };
};

/** Full 3D point (z = height above the ground plane). */
export const project3 = (u: number, d: number, z: number, cy: number = CAM.cy) => {
  const s = CAM.D / (CAM.D - d * Math.sin(th) - z * Math.cos(th));
  return { x: CAM.cx + u * s, y: cy + (d * Math.cos(th) - z * Math.sin(th)) * s, s };
};

const FAR = 9000;
const NEAR = 700;

/** The perspective ground plane. Children are laid out in plane space (u,d) via <GroundItem/>. */
export const GroundPlane: React.FC<{
  width?: number;
  cy?: number;
  preserve3d?: boolean;
  background: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ width = 3600, cy = CAM.cy, preserve3d = false, background, children, style }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      perspective: CAM.D,
      perspectiveOrigin: `${CAM.cx}px ${cy}px`,
      overflow: "hidden",
      ...style,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: CAM.cx - width / 2,
        top: cy - FAR,
        width,
        height: FAR + NEAR,
        transformOrigin: `50% ${FAR}px`,
        transform: `rotateX(${CAM.theta}deg)`,
        transformStyle: preserve3d ? "preserve-3d" : "flat",
        background,
      }}
    >
      {children}
    </div>
  </div>
);

/** Place an element in plane space. (u,d) -> local left/top inside <GroundPlane/>. */
export const GroundItem: React.FC<{
  u: number;
  d: number;
  width: number;
  depth: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  width3600?: number;
}> = ({ u, d, width, depth, children, style, width3600 = 3600 }) => (
  <div
    style={{
      position: "absolute",
      left: width3600 / 2 + u - width / 2,
      top: FAR + d - depth / 2,
      width,
      height: depth,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Upright sprite standing at ground point (u,d); `w`,`h` are world px at scale 1. */
export const Billboard: React.FC<{
  u: number;
  d: number;
  children: React.ReactNode;
  blur?: number;
  shadow?: { w: number; opacity?: number; dx?: number };
  lift?: number;
  cy?: number;
  style?: React.CSSProperties;
}> = ({ u, d, children, blur = 0, shadow, lift = 0, cy = CAM.cy, style }) => {
  const p = project(u, d, cy);
  return (
    <>
      {shadow ? (
        <div
          style={{
            position: "absolute",
            left: p.x + (shadow.dx ?? 0) * p.s,
            top: p.y,
            width: shadow.w * p.s,
            height: shadow.w * p.s * 0.34,
            translate: "-50% -50%",
            borderRadius: "50%",
            background: `radial-gradient(ellipse at center, rgba(0,0,0,${shadow.opacity ?? 0.55}) 0%, rgba(0,0,0,0) 70%)`,
            zIndex: Math.round(p.y) - 1,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: p.x,
          top: p.y - lift * p.s,
          translate: "-50% -100%",
          scale: String(p.s),
          transformOrigin: "50% 100%",
          zIndex: Math.round(p.y),
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
          ...style,
        }}
      >
        {children}
      </div>
    </>
  );
};

export const FullLayer: React.FC<{ children?: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, ...style }}>{children}</div>
);

export const FAR_PX = FAR;
export const PLANE_W = 3600;

/** A 3D shadow-box room: floor, back wall, two side walls (inside a preserve-3d ground plane). */
export const Room: React.FC<{
  cy: number;
  halfW: number;
  dNear: number;
  dFar: number;
  wallH: number;
  floorBg: string;
  backBg: string;
  sideBg: string;
  back?: React.ReactNode;
  floorChildren?: React.ReactNode;
  warm: number;
  fireU: number;
  fireD: number;
}> = ({ cy, halfW, dNear, dFar, wallH, floorBg, backBg, sideBg, back, floorChildren, warm, fireU, fireD }) => {
  const cxp = PLANE_W / 2;
  const depth = dNear - dFar;
  const fx = fireU + halfW; // fire x in back-wall coordinates
  return (
    <GroundPlane cy={cy} preserve3d background="transparent">
      {/* floor */}
      <div style={{ position: "absolute", left: cxp - halfW, top: FAR_PX + dFar, width: halfW * 2, height: depth, background: floorBg }}>
        {floorChildren}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 46% 62% at ${((fireU + halfW) / (halfW * 2)) * 100}% ${((fireD - dFar) / depth) * 100}%, rgba(255,170,80,${0.55 * warm}) 0%, rgba(255,140,50,${0.22 * warm}) 40%, rgba(5,8,16,0.55) 100%)`,
          }}
        />
      </div>
      {/* back wall */}
      <div
        style={{
          position: "absolute",
          left: cxp - halfW,
          top: FAR_PX + dFar - wallH,
          width: halfW * 2,
          height: wallH,
          transformOrigin: "50% 100%",
          transform: "rotateX(-90deg)",
          background: backBg,
          overflow: "hidden",
        }}
      >
        {back}
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 62% 105% at ${(fx / (halfW * 2)) * 100}% 100%, rgba(255,160,70,${0.5 * warm}), rgba(255,140,50,${0.14 * warm}) 55%, rgba(5,8,16,0.5) 100%)` }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(5,8,16,0.45), rgba(5,8,16,0) 45%)" }} />
      </div>
      {/* left wall */}
      <div
        style={{
          position: "absolute",
          left: cxp - halfW - wallH,
          top: FAR_PX + dFar,
          width: wallH,
          height: depth,
          transformOrigin: "100% 50%",
          transform: "rotateY(90deg)",
          background: sideBg,
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to left, rgba(255,150,60,${0.28 * warm}), rgba(5,8,16,0.62)), linear-gradient(to bottom, rgba(5,8,16,0.1), rgba(5,8,16,0.35))` }} />
      </div>
      {/* right wall */}
      <div
        style={{
          position: "absolute",
          left: cxp + halfW,
          top: FAR_PX + dFar,
          width: wallH,
          height: depth,
          transformOrigin: "0% 50%",
          transform: "rotateY(-90deg)",
          background: sideBg,
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to right, rgba(255,150,60,${0.28 * warm}), rgba(5,8,16,0.62)), linear-gradient(to bottom, rgba(5,8,16,0.1), rgba(5,8,16,0.35))` }} />
      </div>
    </GroundPlane>
  );
};
