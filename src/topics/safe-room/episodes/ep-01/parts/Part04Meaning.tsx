import React from "react";
import { useCurrentFrame } from "remotion";
import { CaptionOverlay } from "@engine/audio/CaptionOverlay";
import type { PartProps } from "@engine/episode/episode.types";
import { remapFrame } from "@engine/theme";
import { SafeRoomFrame } from "../SafeRoomFrame";

export const Part04Meaning: React.FC<PartProps> = ({ part, showCaptions = true, captionPlacement }) => {
  const frame = remapFrame(useCurrentFrame(), part.durationInFrames, 780, 1080);
  return (
    <>
      <SafeRoomFrame frame={frame} />
      {showCaptions && (
        <CaptionOverlay
          name="S4 caption A"
          frame={frame}
          from={810}
          to={915}
          placement={captionPlacement}
          text="Safe Room bukan tempat untuk berhenti."
        />
      )}
      {showCaptions && (
        <CaptionOverlay
          name="S4 caption B"
          frame={frame}
          from={930}
          to={1055}
          placement={captionPlacement}
          text="Tapi tempat mengambil napas sebelum melangkah lagi."
        />
      )}
    </>
  );
};

export default Part04Meaning;
