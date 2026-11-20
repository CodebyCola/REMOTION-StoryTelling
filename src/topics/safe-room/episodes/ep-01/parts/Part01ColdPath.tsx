import React from "react";
import { useCurrentFrame } from "remotion";
import { CaptionOverlay } from "@engine/audio/CaptionOverlay";
import type { PartProps } from "@engine/episode/episode.types";
import { remapFrame } from "@engine/theme";
import { SafeRoomFrame } from "../SafeRoomFrame";

export const Part01ColdPath: React.FC<PartProps> = ({ part, showCaptions = true, captionPlacement }) => {
  const frame = remapFrame(useCurrentFrame(), part.durationInFrames, 0, 210);
  return (
    <>
      <SafeRoomFrame frame={frame} />
      {showCaptions && (
        <CaptionOverlay
          name="S1 caption A"
          frame={frame}
          from={25}
          to={105}
          placement={captionPlacement}
          text="Saat darah tinggal sekarat..."
        />
      )}
      {showCaptions && (
        <CaptionOverlay
          name="S1 caption B"
          frame={frame}
          from={115}
          to={190}
          placement={captionPlacement}
          text="...lalu kamu melihat satu pintu ini."
        />
      )}
    </>
  );
};

export default Part01ColdPath;
