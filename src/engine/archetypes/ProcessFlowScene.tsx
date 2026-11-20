import { Fragment } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { CaptionPlacement } from "../episode/episode.types";
import { BackgroundLayer } from "../layout/BackgroundLayer";
import { SafeLayout, StageSlot } from "../layout/SafeLayout";
import { type PartBeats, computePartBeats } from "../motion/choreography";
import { KineticText } from "../motion25d/KineticText";
import { FONT_PX, FONT_UI, STYLE_PRESETS, type StylePresetName, TYPE_SCALE, clamp } from "../theme";

export type ProcessStep = {
  step: string;
  title: string;
  detail: string;
};

export function computeFlowTiming(
  beats: PartBeats,
  index: number,
  totalSteps: number,
) {
  const n = Math.max(1, totalSteps);
  const span = 0.78 / n;
  const cardStart = index * span * 0.75;
  const cardEnd = cardStart + span;
  const cardProgress =
    beats.progress >= 1
      ? 1
      : clamp((beats.progress - cardStart) / Math.max(0.05, cardEnd - cardStart));

  const connStart = cardStart + (cardEnd - cardStart) * 0.55;
  const connEnd = connStart + span * 0.65;
  const connectorProgress =
    beats.progress >= 1
      ? 1
      : clamp((beats.progress - connStart) / Math.max(0.05, connEnd - connStart));

  return { cardProgress, connectorProgress };
}

export function ProcessFlowScene({
  heading,
  steps,
  preset = "neo-25d-dark",
  showCaptions = true,
  captionPlacement,
}: {
  heading: string;
  steps: ProcessStep[];
  preset?: StylePresetName;
  showCaptions?: boolean;
  captionPlacement?: CaptionPlacement;
}) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const theme = STYLE_PRESETS[preset];
  const visibleSteps = steps.slice(0, 3);
  const beats = computePartBeats(frame, durationInFrames);

  return (
    <>
      <BackgroundLayer preset={theme.background} />
      <SafeLayout showCaptions={showCaptions} captionPlacement={captionPlacement} gap={26}>
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
        <StageSlot slot="stage" style={{ alignItems: "stretch", justifyContent: "center", gap: 14 }}>
          {visibleSteps.map((item, i) => {
            const { cardProgress, connectorProgress } = computeFlowTiming(
              beats,
              i,
              visibleSteps.length,
            );
            const lineLen = 30;
            const headOpacity = clamp((connectorProgress - 0.6) / 0.4);
            return (
              <Fragment key={item.step + i}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 24,
                    padding: "24px 30px",
                    borderRadius: 22,
                    background: theme.surface,
                    border: `2px solid ${theme.border}`,
                    boxShadow: "0 14px 36px rgba(0,0,0,0.22)",
                    opacity: cardProgress,
                    transform: `translateY(${(1 - cardProgress) * 28}px)`,
                  }}
                >
                  <div
                    style={{
                      flex: "0 0 auto",
                      minWidth: 74,
                      height: 74,
                      borderRadius: 18,
                      background: theme.accent,
                      color: theme.onAccent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: FONT_PX,
                      fontSize: TYPE_SCALE.subtitle,
                      fontWeight: 700,
                    }}
                  >
                    {item.step}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div
                      style={{
                        fontFamily: FONT_UI,
                        fontSize: TYPE_SCALE.subtitle,
                        fontWeight: 700,
                        lineHeight: 1.14,
                        color: theme.textPrimary,
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontFamily: FONT_UI,
                        fontSize: TYPE_SCALE.body,
                        fontWeight: 500,
                        lineHeight: 1.22,
                        color: theme.textMuted,
                      }}
                    >
                      {item.detail}
                    </div>
                  </div>
                </div>
                {i < visibleSteps.length - 1 && (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 42 }}>
                    <svg width={44} height={42} viewBox="0 0 44 42" style={{ overflow: "visible" }}>
                      <line
                        x1={22}
                        y1={2}
                        x2={22}
                        y2={32}
                        stroke={theme.accent}
                        strokeWidth={5}
                        strokeLinecap="round"
                        strokeDasharray={lineLen}
                        strokeDashoffset={lineLen * (1 - connectorProgress)}
                      />
                      <path
                        d="M 11 23 L 22 36 L 33 23"
                        fill="none"
                        stroke={theme.accent}
                        strokeWidth={5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={headOpacity}
                      />
                    </svg>
                  </div>
                )}
              </Fragment>
            );
          })}
        </StageSlot>
      </SafeLayout>
    </>
  );
}
