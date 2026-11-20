import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { CaptionPlacement } from "../episode/episode.types";
import { BackgroundLayer } from "../layout/BackgroundLayer";
import { SafeLayout, StageSlot } from "../layout/SafeLayout";
import { SPRINGS, staggerFrame } from "../motion/choreography";
import { Card25D } from "../motion25d/Card25D";
import { KineticText } from "../motion25d/KineticText";
import { PaperCard } from "../stickman/HandDrawnProps";
import { FONT_UI, STYLE_PRESETS, type StylePresetName, TYPE_SCALE, clamp, pickContrastText } from "../theme";

export type ComparisonItem = {
  badge: string;
  title: string;
  body: string;
  accentColor?: string;
};

export function ComparisonCardsScene({
  heading,
  items,
  preset = "neo-25d-light",
  showCaptions = true,
  captionPlacement = "top-safe",
}: {
  heading: string;
  items: ComparisonItem[];
  preset?: StylePresetName;
  showCaptions?: boolean;
  captionPlacement?: CaptionPlacement;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = STYLE_PRESETS[preset];
  const isEditorial = preset === "b1-editorial";

  return (
    <>
      <BackgroundLayer preset={theme.background} />
      <SafeLayout showCaptions={showCaptions} captionPlacement={captionPlacement} gap={28}>
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
        <StageSlot slot="stage" style={{ alignItems: "stretch", gap: 24 }}>
          {items.slice(0, 3).map((item, i) => {
            const accent = item.accentColor ?? (i === 0 ? theme.accent : theme.secondary);
            const badgeText = item.accentColor
              ? pickContrastText(item.accentColor)
              : i === 0
                ? theme.onAccent
                : theme.onSecondary;
            const pop = spring({
              frame: staggerFrame(frame, i, 10, 6),
              fps,
              config: SPRINGS.snappy,
            });
            const content = (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div
                  style={{
                    alignSelf: "flex-start",
                    padding: "6px 18px",
                    borderRadius: 999,
                    backgroundColor: accent,
                    color: badgeText,
                    fontFamily: FONT_UI,
                    fontSize: TYPE_SCALE.caption,
                    fontWeight: 700,
                  }}
                >
                  {item.badge}
                </div>
                <div
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: TYPE_SCALE.subtitle,
                    fontWeight: 700,
                    lineHeight: 1.16,
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
                    lineHeight: 1.24,
                    color: theme.textMuted,
                  }}
                >
                  {item.body}
                </div>
              </div>
            );

            if (isEditorial) {
              return (
                <PaperCard
                  key={item.badge + i}
                  style={{
                    background: theme.surface,
                    opacity: clamp(pop),
                    transform: `translateY(${(1 - pop) * 36}px)`,
                  }}
                >
                  {content}
                </PaperCard>
              );
            }

            return (
              <Card25D
                key={item.badge + i}
                delay={6 + i * 10}
                tilt={i % 2 === 0 ? -4 : 4}
                style={{
                  background: theme.surface,
                  border: `2px solid ${theme.border}`,
                  padding: "28px 34px",
                }}
              >
                {content}
              </Card25D>
            );
          })}
        </StageSlot>
      </SafeLayout>
    </>
  );
}
