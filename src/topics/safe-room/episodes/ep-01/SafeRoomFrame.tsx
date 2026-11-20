import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { C } from "@engine/theme";
import { CeilingBeams } from "@topics/safe-room/components/CeilingBeams";
import { ColdPathShot } from "./shots/ColdPathShot";
import { ReliefShot } from "./shots/ReliefShot";
import { SignalsShot } from "./shots/SignalsShot";
import { MeaningShot } from "./shots/MeaningShot";
import { LoopPathShot } from "./shots/LoopPathShot";

// Each incoming shot dissolves over the previous one on the design timeline.
// Part sequences independently own their narration and never overlap.
const shots = [
  { Shot: ColdPathShot, from: 0, fullyVisible: 0 },
  { Shot: ReliefShot, from: 185, fullyVisible: 215 },
  { Shot: SignalsShot, from: 458, fullyVisible: 486 },
  { Shot: MeaningShot, from: 755, fullyVisible: 785 },
  { Shot: LoopPathShot, from: 1058, fullyVisible: 1086 },
];

export const SafeRoomFrame: React.FC<{ frame: number; reserveCaptionBand?: boolean }> = ({ frame, reserveCaptionBand = false }) => (
  <AbsoluteFill style={{ backgroundColor: C.nightDeep }}>
    {shots.map(({ Shot, from, fullyVisible }, index) => {
      const next = shots[index + 1];
      if (frame < from || (next && frame >= next.fullyVisible)) return null;

      const opacity = frame >= fullyVisible
        ? 1
        : interpolate(frame, [from, fullyVisible], [0, 1]);
      return (
        <AbsoluteFill key={from} style={{ opacity, isolation: "isolate" }}>
          <Shot f={frame} reserveCaptionBand={reserveCaptionBand} />
        </AbsoluteFill>
      );
    })}
    <CeilingBeams f={frame} />
  </AbsoluteFill>
);
