import type { ReactNode } from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { CaptionPlacement } from "../episode/episode.types";
import { BackgroundLayer } from "../layout/BackgroundLayer";
import { SafeLayout, StageSlot } from "../layout/SafeLayout";
import { CameraRig25D, type CameraPreset } from "../motion/CameraRig25D";
import { SPRINGS } from "../motion/choreography";
import { KineticText } from "../motion25d/KineticText";
import { FONT_UI, STYLE_PRESETS, type StylePresetName, TYPE_SCALE, clamp } from "../theme";

export function TitleHookScene({
  eyebrow,
  title,
  subtitle,
  preset = "neo-25d-dark",
  camera = "slow-push",
  showCaptions = true,
  captionPlacement = "top-safe",
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  preset?: StylePresetName;
  camera?: CameraPreset;
  showCaptions?: boolean;
  captionPlacement?: CaptionPlacement;
  children?: ReactNode;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = STYLE_PRESETS[preset];
  const badgePop = spring({ frame, fps, config: SPRINGS.snappy });
  const subPop = spring({ frame: Math.max(0, frame - 14), fps, config: SPRINGS.smooth });

  return (
    <>
      <BackgroundLayer preset={theme.background} />
      <CameraRig25D preset={camera}>
        <SafeLayout showCaptions={showCaptions} captionPlacement={captionPlacement} gap={28}>
          <StageSlot slot="header">
            {eyebrow && (
              <div
                style={{
                  alignSelf: "flex-start",
                  padding: "8px 22px",
                  borderRadius: 999,
                  backgroundColor: theme.accent,
                  color: theme.onAccent,
                  fontFamily: FONT_UI,
                  fontSize: TYPE_SCALE.caption,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  opacity: clamp(badgePop),
                  transform: `translateY(${(1 - badgePop) * 16}px)`,
                }}
              >
                {eyebrow}
              </div>
            )}
            <KineticText
              text={title}
              mode="word"
              delay={4}
              stagger={3}
              style={{
                fontSize: TYPE_SCALE.hero,
                lineHeight: 1.08,
                color: theme.textPrimary,
                letterSpacing: -1.2,
              }}
            />
            {subtitle && (
              <div
                style={{
                  fontFamily: FONT_UI,
                  fontSize: TYPE_SCALE.subtitle,
                  lineHeight: 1.18,
                  fontWeight: 600,
                  color: theme.textMuted,
                  opacity: clamp(subPop),
                  transform: `translateY(${(1 - subPop) * 18}px)`,
                }}
              >
                {subtitle}
              </div>
            )}
          </StageSlot>
          <StageSlot slot="stage">{children}</StageSlot>
        </SafeLayout>
      </CameraRig25D>
    </>
  );
}
