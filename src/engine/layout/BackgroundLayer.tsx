import type {CSSProperties} from "react";
import {AbsoluteFill} from "remotion";
import {C} from "../theme";

const backgrounds = {
  "hd2d-night": {background: `linear-gradient(170deg, ${C.nightDeep} 15%, ${C.nightMid} 62%, ${C.nightFog})`},
  "b1-paper": {
    backgroundColor: C.b1Paper,
    backgroundImage: "linear-gradient(#c6bdad40 1px, transparent 1px), linear-gradient(90deg, #c6bdad40 1px, transparent 1px), radial-gradient(ellipse at 30% 0%, #fffdfa, #efe8d9)",
    backgroundSize: "40px 40px, 40px 40px, cover",
  },
  "dark-25d": {background: "radial-gradient(ellipse at 28% 22%, #39445a, #121821 74%)"},
  "light-25d": {background: "radial-gradient(ellipse at 28% 22%, #fffdfa, #dae2e9 78%)"},
} satisfies Record<string, CSSProperties>;

export type BackgroundPreset = keyof typeof backgrounds;

export function BackgroundLayer({preset = "hd2d-night"}: {preset?: BackgroundPreset}) {
  return <AbsoluteFill style={backgrounds[preset]} />;
}
