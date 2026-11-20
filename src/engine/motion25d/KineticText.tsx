import type {CSSProperties} from "react";
import {spring, useCurrentFrame, useVideoConfig} from "remotion";
import {FONT_UI, clamp} from "../theme";

export function KineticText({text, mode = "word", delay = 0, stagger = 4, style}: {
  text: string; mode?: "word" | "line"; delay?: number; stagger?: number; style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tokens = mode === "line" ? text.split(/\r?\n/) : text.trim().split(/\s+/);
  return <div style={{fontFamily: FONT_UI, fontWeight: 700, lineHeight: 1.15, ...style}}>
    {tokens.map((token, i) => {
      const p = spring({frame: frame - delay - i * stagger, fps, config: {damping: 17, stiffness: 140}});
      return <span key={i} style={{
        display: mode === "line" ? "block" : "inline-block", opacity: clamp(p),
        marginInlineEnd: mode === "word" && i < tokens.length - 1 ? "0.25em" : undefined,
        transform: `translateY(${(1 - p) * 0.65}em)`,
      }}>{token}{mode === "word" && i < tokens.length - 1 ? " " : ""}</span>;
    })}
  </div>;
}
