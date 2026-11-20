import React from "react";
import { Easing, Interactive, interpolate } from "remotion";
import { COLD0, ColdPathWorld } from "@topics/safe-room/components/ColdPathWorld";
import { ColdForeground } from "@topics/safe-room/components/ColdForeground";
import { FullLayer } from "@engine/hd2d/world";

const ez = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) } as const;

/** Scene 5 ends on exactly the same parameters as Scene 1 begins on (frame 1350 === frame 0). */
export const LoopPathShot: React.FC<{ f: number }> = ({ f }) => {
  const rain = interpolate(f, [1220, 1350], [0, COLD0.rain], ez);
  const fog = interpolate(f, [1058, 1090, 1190], [0.85, 0.85, COLD0.fog], ez);
  const lantern = interpolate(f, [1080, 1200, 1350], [1, 1, COLD0.lantern], ez);
  const hp = interpolate(f, [1200, 1350], [0, COLD0.hp], ez);
  const backGlow = interpolate(f, [1080, 1250], [1, COLD0.backGlow], ez);
  const scale = interpolate(f, [1080, 1350], [1.14, 1], ez);
  const ty = interpolate(f, [1080, 1350], [18, 0], ez);
  const ruin = interpolate(f, [1220, 1350], [0, 1], ez);

  return (
    <FullLayer>
      <Interactive.Div
        name="Loop tracking camera"
        style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "540px 760px", scale: String(scale), translate: `0px ${ty}px` }}
      >
        <ColdPathWorld
          f={f}
          lightning={0}
          doorOpen={COLD0.doorOpen}
          doorLight={COLD0.doorLight}
          bloom={0}
          rain={rain}
          lantern={lantern}
          hp={hp}
          hpFrac={0.12}
          fog={fog}
          backGlow={backGlow}
        />
      </Interactive.Div>
      <ColdForeground f={f} scale={interpolate(f, [1080, 1350], [1.2, 1], ez)} rain={rain} ruin={ruin} />
    </FullLayer>
  );
};
