import React from "react";
import { Interactive } from "remotion";
import { CabinInterior, interiorCam } from "@topics/safe-room/components/CabinInterior";
import { SignalCallouts } from "@topics/safe-room/components/SignalCallouts";
import { FullLayer } from "@engine/hd2d/world";

export const SignalsShot: React.FC<{ f: number; reserveCaptionBand?: boolean }> = ({ f, reserveCaptionBand = false }) => {
  const cam = interiorCam(f);
  return (
    <FullLayer>
      <Interactive.Div
        name="Diorama camera"
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
      <SignalCallouts f={f} reserveCaptionBand={reserveCaptionBand} />
    </FullLayer>
  );
};
