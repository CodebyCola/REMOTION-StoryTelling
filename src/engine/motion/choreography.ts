import { clamp, lsin } from "../theme";

export const SPRINGS = {
  snappy: { damping: 18, stiffness: 180, mass: 0.8 },
  bouncy: { damping: 13, stiffness: 140, mass: 0.9 },
  smooth: { damping: 22, stiffness: 110, mass: 1.0 },
  heavy: { damping: 26, stiffness: 80, mass: 1.3 },
} as const;

export type PartBeats = {
  enter: number;
  act: number;
  payoff: number;
  settle: number;
  progress: number;
  breath: number;
};

/**
 * Divide any part duration into 4 deterministic narrative beats (0..1):
 * enter -> act -> payoff -> settle, plus a subtle periodic breath wave.
 */
export function computePartBeats(
  localFrame: number,
  durationInFrames: number,
): PartBeats {
  if (!Number.isFinite(durationInFrames) || durationInFrames <= 1) {
    return {
      enter: 1,
      act: 1,
      payoff: 1,
      settle: 1,
      progress: 1,
      breath: 0,
    };
  }
  const span = durationInFrames - 1;
  const f = clamp(localFrame, 0, span);
  const progress = clamp(f / span);
  const enterEnd = Math.min(36, Math.max(1, span * 0.18));

  return {
    enter: clamp(f / enterEnd),
    act: clamp((progress - 0.15) / (0.62 - 0.15)),
    payoff: clamp((progress - 0.52) / (0.84 - 0.52)),
    settle: clamp((progress - 0.84) / (1 - 0.84)),
    progress,
    breath: lsin(localFrame, 72),
  };
}

export function staggerFrame(
  localFrame: number,
  index: number,
  stepFrames = 6,
  startFrame = 0,
): number {
  return Math.max(0, localFrame - startFrame - index * stepFrames);
}
