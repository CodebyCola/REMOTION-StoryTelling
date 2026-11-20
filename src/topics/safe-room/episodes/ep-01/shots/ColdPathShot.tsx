import React from "react";
import { Interactive, interpolate } from "remotion";
import { ColdPathWorld } from "@topics/safe-room/components/ColdPathWorld";
import { ColdForeground } from "@topics/safe-room/components/ColdForeground";
import { FullLayer } from "@engine/hd2d/world";
import { smooth } from "@engine/theme";

export const ColdPathShot: React.FC<{ f: number }> = ({ f }) => {
  const lightning = interpolate(f, [72, 75, 78, 80, 82, 92], [0, 1, 0.25, 0.75, 0, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bloom = smooth(f, 185, 215);
  const push = smooth(f, 0, 210);
  const fgScale = 1 + 0.32 * push;

  return (
    <FullLayer>
      <Interactive.Div
        name="Camera push-in"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          transformOrigin: "540px 760px",
          scale: String(1 + 0.18 * push),
          translate: `${-16 * push}px ${22 * push}px`,
        }}
      >
        <ColdPathWorld
          f={f}
          lightning={lightning}
          doorOpen={interpolate(f, [0, 100, 190], [0.3, 0.6, 1], { extrapolateRight: "clamp" })}
          doorLight={interpolate(f, [0, 100, 190], [0.35, 0.6, 1], { extrapolateRight: "clamp" })}
          bloom={bloom}
          rain={1}
          lantern={0.4}
          hp={1}
          hpFrac={0.12}
          fog={0}
          backGlow={0}
        />
      </Interactive.Div>
      <ColdForeground f={f} scale={fgScale} rain={1} ruin={1} />
    </FullLayer>
  );
};
