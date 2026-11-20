import React from "react";
import { FONT_PX, mix } from "@engine/theme";

/** Floating pixel-style RPG HP bar. */
export const HpBar: React.FC<{ frac: number; opacity: number; sparkle?: number; frame?: number }> = ({
  frac,
  opacity,
  sparkle = 0,
  frame = 0,
}) => {
  const col = frac < 0.5 ? mix("#EF4444", "#F59E0B", frac / 0.5) : mix("#F59E0B", "#22C55E", (frac - 0.5) / 0.5);
  const done = frac >= 0.999 ? "#22C55E" : col;
  return (
    <div style={{ opacity, position: "relative", width: 190, filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.55))" }}>
      <div style={{ fontFamily: FONT_PX, fontSize: 16, color: "#F8FAFC", letterSpacing: 2, marginBottom: 4, textShadow: "2px 2px 0 #090E1A" }}>
        HP
      </div>
      <div style={{ background: "#090E1A", padding: 4, border: "3px solid #F8FAFC", boxShadow: "inset 0 0 0 2px #090E1A" }}>
        <div style={{ position: "relative", height: 18, background: "#2a1316", display: "flex", gap: 2 }}>
          <div style={{ width: `${frac * 100}%`, background: done, boxShadow: `inset 0 -5px 0 rgba(0,0,0,0.28), inset 0 4px 0 rgba(255,255,255,0.35)` }} />
        </div>
      </div>
      {sparkle > 0
        ? [0, 1, 2, 3, 4, 5].map((i) => {
            const ph = ((frame / 14 + i * 0.37) % 1);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 10 + ((i * 53) % 170),
                  top: 6 + (i % 3) * 8 - ph * 34,
                  width: 6,
                  height: 6,
                  background: i % 2 ? "#FFF3C4" : "#86EFAC",
                  opacity: sparkle * Math.sin(Math.PI * ph),
                  boxShadow: "0 0 8px #FFF3C4",
                }}
              />
            );
          })
        : null}
    </div>
  );
};
