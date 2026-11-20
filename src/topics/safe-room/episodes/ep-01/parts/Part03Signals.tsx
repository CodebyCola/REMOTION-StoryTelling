import React from "react";
import { useCurrentFrame } from "remotion";
import { CaptionOverlay } from "@engine/audio/CaptionOverlay";
import type { PartProps } from "@engine/episode/episode.types";
import { remapFrame } from "@engine/theme";
import { SafeRoomFrame } from "../SafeRoomFrame";

export const Part03Signals: React.FC<PartProps> = ({ part, showCaptions = true, captionPlacement }) => {
  const frame = remapFrame(useCurrentFrame(), part.durationInFrames, 480, 780);
  return (
    <>
      <SafeRoomFrame frame={frame} reserveCaptionBand={captionPlacement === "bottom-safe"} />
      {showCaptions && (
        <CaptionOverlay
          name="S3 header"
          frame={frame}
          from={495}
          to={755}
          placement={captionPlacement}
          text="Otakmu tidak cuma melihat ruangan—ia membaca 3 sinyal."
        />
      )}
    </>
  );
};

export default Part03Signals;
