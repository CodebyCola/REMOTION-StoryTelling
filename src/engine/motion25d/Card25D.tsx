import type {CSSProperties, ReactNode} from "react";
import {spring, useCurrentFrame, useVideoConfig} from "remotion";
import {clamp} from "../theme";

export function Card25D({children, delay = 0, tilt = -6, style}: {
  children?: ReactNode; delay?: number; tilt?: number; style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({frame: frame - delay, fps, config: {damping: 16, stiffness: 115}});
  return <div style={{
    background: "#fffdf9", borderRadius: 24, padding: 40, boxShadow: "12px 24px 48px #101c2b38",
    opacity: clamp(progress), transform: `perspective(1200px) translateY(${(1 - progress) * 68}px) rotateX(${(1 - progress) * 16}deg) rotateY(${tilt}deg)`,
    ...style,
  }}>{children}</div>;
}
