import React from "react";
import { Px } from "@engine/hd2d/Px";
import { travelerBack, travelerSit } from "./sprites";
import { lsin } from "@engine/theme";

export const TravelerSprite: React.FC<{
  frame: number;
  pose: "walk" | "idle" | "sit";
  lantern?: number;
  unit?: number;
  lanternOn?: boolean;
  flip?: boolean;
}> = ({ frame, pose, lantern = 0.4, unit = 10, lanternOn = true, flip = false }) => {
  const s = pose === "sit" ? travelerSit(frame) : travelerBack(frame, pose === "walk", lantern, lanternOn);
  const bob = pose === "walk" ? Math.abs(lsin(frame, 30)) * unit * 0.9 : 0;
  return (
    <div style={{ translate: `0px ${-bob}px`, scale: flip ? "-1 1" : undefined }}>
      <Px rects={s.rects} gw={s.gw} gh={s.gh} unit={unit} />
    </div>
  );
};
