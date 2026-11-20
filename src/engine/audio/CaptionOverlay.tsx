import type {CSSProperties} from "react";
import {Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import type {CaptionCue, CaptionPlacement} from "../episode/episode.types";
import {FONT_UI, SAFE_ZONE, clamp} from "../theme";

type OverlayProps = {
  text: string;
  from: number;
  to: number;
  name: string;
  top?: number;
  frame?: number;
  placement?: CaptionPlacement;
};

function captionStyle(placement: CaptionPlacement): CSSProperties {
  return {
    position: "absolute",
    left: SAFE_ZONE.left,
    right: SAFE_ZONE.right,
    ...(placement === "top-safe" ? {top: 268} : {bottom: SAFE_ZONE.bottom + 12, minHeight: 128}),
    fontFamily: FONT_UI,
    fontSize: placement === "top-safe" ? 68 : 54,
    fontWeight: 600,
    lineHeight: 1.18,
    letterSpacing: -0.5,
    textAlign: "center",
    whiteSpace: "pre-line",
    overflowWrap: "anywhere",
    textWrap: "balance",
    color: "#F8FAFC",
    textShadow: "0 3px 0 rgba(5,8,16,0.85), 0 6px 24px rgba(5,8,16,0.75)",
    zIndex: 50,
  };
}

export function CaptionOverlay({text, from, to, name, top, placement = "top-safe", frame}: OverlayProps) {
  const localFrame = useCurrentFrame();
  const f = frame ?? localFrame;
  if (f < from || f >= to) return null;
  const fade = Math.min(20, (to - from) / 2);
  const opacity = Easing.inOut(Easing.cubic)(clamp(Math.min(f - from, to - f) / fade));
  const dy = interpolate(f, [from, from + 26], [12, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  return (
    <Interactive.Div name={name} style={{...captionStyle(placement), ...(top === undefined ? {} : {top, bottom: "auto"}), opacity, translate: `0px ${dy}px`}}>
      {text}
    </Interactive.Div>
  );
}

export function PartCaptionTrack({captions, placement = "top-safe"}: {captions: CaptionCue[]; placement?: CaptionPlacement}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = frame * 1000 / fps;
  const active = captions.filter((cue) => cue.startMs <= ms && ms < cue.endMs);
  if (!active.length) return null;
  return <div style={captionStyle(placement)}>{active.map((cue) => cue.text).join("\n")}</div>;
}
