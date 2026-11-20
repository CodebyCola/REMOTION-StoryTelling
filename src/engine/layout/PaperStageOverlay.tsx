import type React from "react";

/** Warm editorial finishing layer for B1 Stickman and light 2.5D compositions. */
export const PaperStageOverlay: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse 88% 78% at 50% 48%, rgba(255,253,248,0) 62%, rgba(38,46,49,0.09) 100%)",
        pointerEvents: "none",
        zIndex: 41,
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 28,
        border: "2px solid rgba(38,46,49,0.08)",
        borderRadius: 18,
        pointerEvents: "none",
        zIndex: 42,
      }}
    />
  </>
);
