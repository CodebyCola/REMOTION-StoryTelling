import React from "react";
import { useCurrentFrame } from "remotion";
import { CaptionOverlay } from "@engine/audio/CaptionOverlay";
import type { PartProps } from "@engine/episode/episode.types";
import { remapFrame } from "@engine/theme";
import { SafeRoomFrame } from "../SafeRoomFrame";

export const Part02Relief: React.FC<PartProps> = ({ part, showCaptions = true, captionPlacement }) => {
  const frame = remapFrame(useCurrentFrame(), part.durationInFrames, 210, 480);
  return (
    <>
      <SafeRoomFrame frame={frame} />
      {showCaptions && (
        <CaptionOverlay
          name="S2 caption"
          frame={frame}
          from={245}
          to={420}
          placement={captionPlacement}
          text="Satu ruangan kecil. Tanpa musuh. Tanpa ancaman."
        />
      )}
    </>
  );
};

export default Part02Relief;
