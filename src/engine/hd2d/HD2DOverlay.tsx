import React from "react";
import { H, W } from "@engine/theme";

/** Permanent HD-2D finishing layer: tilt-shift blur bands, vignette, gentle grade. */
export const HD2DOverlay: React.FC = () => (
  <>
    {/* tilt-shift: top 14% */}
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: W,
        height: H * 0.14,
        backdropFilter: "blur(4px)",
        WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 35%, transparent 100%)",
        maskImage: "linear-gradient(to bottom, #000 0%, #000 35%, transparent 100%)",
        zIndex: 40,
      }}
    />
    {/* tilt-shift: bottom 16% */}
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        width: W,
        height: H * 0.16,
        backdropFilter: "blur(4px)",
        WebkitMaskImage: "linear-gradient(to top, #000 0%, #000 35%, transparent 100%)",
        maskImage: "linear-gradient(to top, #000 0%, #000 35%, transparent 100%)",
        zIndex: 40,
      }}
    />
    {/* soft corner vignette */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse 85% 70% at 50% 46%, rgba(0,0,0,0) 52%, rgba(3,5,12,0.42) 100%)",
        zIndex: 41,
        pointerEvents: "none",
      }}
    />
    {/* cinematic grade: lifted teal shadows */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, rgba(20,40,80,0.10), rgba(255,140,60,0.04))",
        mixBlendMode: "soft-light",
        zIndex: 42,
        pointerEvents: "none",
      }}
    />
  </>
);
