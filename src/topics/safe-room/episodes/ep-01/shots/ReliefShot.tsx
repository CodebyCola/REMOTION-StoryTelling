import React from "react";
import { Interactive, interpolate } from "remotion";
import { CabinInterior, interiorCam } from "@topics/safe-room/components/CabinInterior";
import { FullLayer } from "@engine/hd2d/world";
import { Px } from "@engine/hd2d/Px";
import { mug, table } from "@topics/safe-room/components/sprites";
import { C, lsin, mulberry32 } from "@engine/theme";

const STEAM = (() => {
  const rnd = mulberry32(88);
  return Array.from({ length: 7 }, () => ({ x: rnd() * 30 - 15, cyc: [75, 90, 135][Math.floor(rnd() * 3)], ph: rnd(), s: 26 + rnd() * 24 }));
})();

export const ReliefShot: React.FC<{ f: number }> = ({ f }) => {
  const cam = interiorCam(f);
  const flash = interpolate(f, [185, 205, 252], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mugSp = mug();
  const tb = table();
  const fgOpacity = interpolate(f, [430, 470], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <FullLayer>
      <Interactive.Div
        name="Interior camera"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          transformOrigin: "540px 1180px",
          scale: String(cam.scale),
          translate: `${cam.tx}px ${cam.ty}px`,
        }}
      >
        <CabinInterior f={f} />
      </Interactive.Div>

      {/* foreground: blurred table corner + steaming mug (parallax, fades before the pull-back) */}
      <FullLayer style={{ opacity: fgOpacity, zIndex: 30 }}>
        <div style={{ position: "absolute", left: 640, top: 1370, filter: "blur(7px) brightness(0.75)" }}>
          <Px rects={tb.rects} gw={tb.gw} gh={tb.gh} unit={26} />
        </div>
        <div style={{ position: "absolute", left: 830, top: 1290, filter: "blur(4px)" }}>
          <Px rects={mugSp.rects} gw={mugSp.gw} gh={mugSp.gh} unit={22} />
        </div>
        {STEAM.map((s, i) => {
          const ph = (f / s.cyc + s.ph) % 1;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 846 + s.x + lsin(f, 90, s.ph) * 10,
                top: 1280 - ph * 150,
                width: s.s,
                height: s.s,
                borderRadius: "50%",
                background: "rgba(235,235,245,0.5)",
                filter: "blur(9px)",
                opacity: Math.sin(Math.PI * ph) * 0.5,
              }}
            />
          );
        })}
      </FullLayer>

      {/* warm light-bloom afterglow settling in */}
      <FullLayer style={{ background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${C.warmCore} 0%, ${C.warmMid} 70%, ${C.warmAmbient} 100%)`, opacity: flash, zIndex: 80 }} />
    </FullLayer>
  );
};
