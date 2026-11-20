import { type CSSProperties, type ReactNode, createContext, useContext } from "react";
import type { CaptionPlacement } from "../episode/episode.types";
import { SAFE_ZONE } from "../theme";

export type SafeSlotName =
  | "header"
  | "stage"
  | "split-top"
  | "split-bottom"
  | "footer";

export const SafeLayoutContext = createContext<{
  captionsRenderedByTrack?: boolean;
  captionPlacement?: CaptionPlacement;
}>({});

export function resolveCaptionVisibility({
  captionsRenderedByTrack = false,
  showCaptions = true,
}: {
  captionsRenderedByTrack?: boolean;
  showCaptions?: boolean;
}) {
  return captionsRenderedByTrack ? true : showCaptions;
}

export function computeSafeBounds({
  showCaptions = true,
  captionPlacement = "top-safe",
}: {
  showCaptions?: boolean;
  captionPlacement?: CaptionPlacement;
} = {}) {
  const top =
    showCaptions && captionPlacement === "top-safe" ? 396 : SAFE_ZONE.top;
  const bottom =
    showCaptions && captionPlacement === "bottom-safe"
      ? SAFE_ZONE.captionBandTop - 16
      : SAFE_ZONE.captionBandBottom;
  return {
    left: SAFE_ZONE.left,
    top,
    width: SAFE_ZONE.width,
    height: bottom - top,
    bottom,
  };
}

export function useSafeBounds({
  showCaptions = true,
  captionPlacement,
}: {
  showCaptions?: boolean;
  captionPlacement?: CaptionPlacement;
} = {}) {
  const ctx = useContext(SafeLayoutContext);
  const effectiveShowCaptions = resolveCaptionVisibility({
    captionsRenderedByTrack: ctx.captionsRenderedByTrack,
    showCaptions,
  });
  const effectivePlacement = captionPlacement ?? ctx.captionPlacement ?? "top-safe";
  return computeSafeBounds({
    showCaptions: effectiveShowCaptions,
    captionPlacement: effectivePlacement,
  });
}

export function SafeLayout({
  children,
  showCaptions = true,
  captionPlacement,
  gap = 24,
  style,
}: {
  children?: ReactNode;
  showCaptions?: boolean;
  captionPlacement?: CaptionPlacement;
  gap?: number;
  style?: CSSProperties;
}) {
  const bounds = useSafeBounds({ showCaptions, captionPlacement });
  return (
    <div
      style={{
        position: "absolute",
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height,
        display: "flex",
        flexDirection: "column",
        gap,
        boxSizing: "border-box",
        zIndex: 10,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const slotStyles: Record<SafeSlotName, CSSProperties> = {
  header: {
    flex: "0 0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  stage: {
    flex: "1 1 0",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 0,
  },
  "split-top": {
    flex: "1 1 0",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 0,
  },
  "split-bottom": {
    flex: "1 1 0",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 0,
  },
  footer: {
    flex: "0 0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
};

export function StageSlot({
  slot = "stage",
  children,
  style,
}: {
  slot?: SafeSlotName;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return <div style={{ ...slotStyles[slot], ...style }}>{children}</div>;
}
