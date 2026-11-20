import type { ReactNode } from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { CaptionPlacement } from "../episode/episode.types";
import { BackgroundLayer } from "../layout/BackgroundLayer";
import { SafeLayout, StageSlot, useSafeBounds } from "../layout/SafeLayout";
import { Connector25D } from "../motion/Connector25D";
import { SPRINGS, computePartBeats, staggerFrame } from "../motion/choreography";
import { KineticText } from "../motion25d/KineticText";
import { FONT_UI, STYLE_PRESETS, type StylePresetName, TYPE_SCALE, clamp, lsin } from "../theme";

export type CalloutPoint = {
  id: string;
  label: string;
  targetX: number;
  targetY: number;
  boxX: number;
  boxY: number;
  boxWidth?: number;
};

export function computeCalloutLayout(
  pt: CalloutPoint,
  bounds: { left: number; top: number; width: number; bottom: number },
) {
  const boxW = Math.min(pt.boxWidth ?? 420, bounds.width);
  const left = clamp(pt.boxX, bounds.left, bounds.left + bounds.width - boxW);
  const top = clamp(pt.boxY, bounds.top, bounds.bottom - 96);
  return { left, top, boxW };
}

export function SpotlightCalloutScene({
  heading,
  points,
  preset = "hd2d-cinematic",
  showCaptions = true,
  captionPlacement,
  children,
}: {
  heading?: string;
  points: CalloutPoint[];
  preset?: StylePresetName;
  showCaptions?: boolean;
  captionPlacement?: CaptionPlacement;
  children?: ReactNode;
}) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const theme = STYLE_PRESETS[preset];
  const beats = computePartBeats(frame, durationInFrames);
  const bounds = useSafeBounds({ showCaptions, captionPlacement });

  return (
    <>
      <BackgroundLayer preset={theme.background} />
      <SafeLayout showCaptions={showCaptions} captionPlacement={captionPlacement} gap={20}>
        {heading && (
          <StageSlot slot="header">
            <KineticText
              text={heading}
              mode="word"
              delay={0}
              stagger={3}
              style={{
                fontSize: TYPE_SCALE.title,
                lineHeight: 1.12,
                color: theme.textPrimary,
              }}
            />
          </StageSlot>
        )}
        <StageSlot slot="stage">{children}</StageSlot>
      </SafeLayout>
      {points.map((pt, i) => {
        const pop = spring({
          frame: staggerFrame(frame, i, 12, 8),
          fps,
          config: SPRINGS.snappy,
        });
        const pulse = (frame / 45 + i * 0.35) % 1;
        const { left: safeLeft, top: safeTop, boxW } = computeCalloutLayout(pt, bounds);
        const lineProgress = clamp((beats.act - i * 0.18) / 0.4);

        return (
          <div key={pt.id}>
            <Connector25D
              from={{ x: pt.targetX, y: pt.targetY }}
              to={{ x: safeLeft + boxW / 2, y: safeTop + 36 }}
              progress={lineProgress}
              color={theme.accent}
              strokeWidth={4}
              curved
              arrowHead={false}
              zIndex={20}
            />
            <svg
              width={1080}
              height={1920}
              style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", zIndex: 25 }}
            >
              <circle
                cx={pt.targetX}
                cy={pt.targetY}
                r={18 + pulse * 34}
                fill="none"
                stroke={theme.secondary}
                strokeWidth={3}
                opacity={(1 - pulse) * 0.85 * clamp(pop)}
              />
              <circle
                cx={pt.targetX}
                cy={pt.targetY}
                r={9 + lsin(frame, 45) * 1.5}
                fill={theme.secondary}
                stroke={theme.textPrimary}
                strokeWidth={2}
                opacity={clamp(pop)}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                left: safeLeft,
                top: safeTop,
                width: boxW,
                padding: "14px 24px",
                borderRadius: 16,
                background: theme.surface,
                border: `2px solid ${theme.accent}`,
                color: theme.textPrimary,
                fontFamily: FONT_UI,
                fontSize: TYPE_SCALE.body,
                fontWeight: 700,
                lineHeight: 1.2,
                boxShadow: "0 12px 30px rgba(0,0,0,0.28)",
                opacity: clamp(pop),
                transform: `translateY(${(1 - pop) * 16}px)`,
                zIndex: 30,
              }}
            >
              {pt.label}
            </div>
          </div>
        );
      })}
    </>
  );
}
