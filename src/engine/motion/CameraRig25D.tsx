import type { ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export type CameraPreset =
  | "slow-push"
  | "gentle-drift"
  | "focus-top"
  | "focus-bottom"
  | "static";

export function CameraRig25D({
  preset = "slow-push",
  intensity = 1,
  children,
}: {
  preset?: CameraPreset;
  intensity?: number;
  children?: ReactNode;
}) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  if (preset === "static" || durationInFrames <= 1) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  const span = Math.max(1, durationInFrames - 1);
  const t = interpolate(frame, [0, span], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const k = Math.max(0, intensity);
  let scale = 1;
  let tx = 0;
  let ty = 0;
  let transformOrigin = "50% 50%";

  if (preset === "slow-push") {
    scale = 1 + 0.05 * k * t;
  } else if (preset === "gentle-drift") {
    scale = 1 + 0.03 * k;
    tx = -14 * k * t;
    ty = 10 * k * t;
  } else if (preset === "focus-top") {
    transformOrigin = "50% 28%";
    scale = 1 + 0.06 * k * t;
  } else if (preset === "focus-bottom") {
    transformOrigin = "50% 72%";
    scale = 1 + 0.06 * k * t;
  }

  return (
    <AbsoluteFill
      style={{
        transformOrigin,
        scale: String(scale),
        translate: `${tx.toFixed(2)}px ${ty.toFixed(2)}px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}
