import React from "react";
import { useCurrentFrame } from "remotion";
import { CaptionOverlay } from "@engine/audio/CaptionOverlay";
import type { PartProps } from "@engine/episode/episode.types";
import { remapFrame } from "@engine/theme";
import { SafeRoomFrame } from "../SafeRoomFrame";

export const Part05LoopPath: React.FC<PartProps> = ({ part, showCaptions = true, captionPlacement }) => {
  const frame = remapFrame(useCurrentFrame(), part.durationInFrames, 1080, 1350);
  return (
    <>
      <SafeRoomFrame frame={frame} />
      {showCaptions && (
        <CaptionOverlay
          name="S5 caption"
          frame={frame}
          from={1110}
          to={1310}
          placement={captionPlacement}
          text="Semua orang butuh 'Safe Room'-nya sendiri."
        />
      )}
    </>
  );
};

export default Part05LoopPath;
