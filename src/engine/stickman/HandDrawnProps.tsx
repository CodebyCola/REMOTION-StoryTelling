import type {CSSProperties, ReactNode} from "react";
import {C, FONT_UI} from "../theme";

type SketchProps = {width?: number; height?: number; color?: string; style?: CSSProperties};

export function PaperCard({children, style}: {children?: ReactNode; style?: CSSProperties}) {
  return <div style={{
    position: "relative", background: "#fffdf4", color: C.b1Ink, border: `3px solid ${C.b1Ink}`,
    borderRadius: "12px 8px 15px 6px / 6px 14px 8px 12px", padding: "32px 40px",
    boxShadow: "5px 7px 0 #382f201d", fontFamily: FONT_UI, ...style,
  }}>{children}</div>;
}

export function SketchArrow({width = 180, height = 90, color = C.b1Ink, style}: SketchProps) {
  return <svg width={width} height={height} viewBox="0 0 180 90" preserveAspectRatio="none" style={style}>
    <path d="M6 16 C35 78 99 86 169 35 M143 35 L170 32 162 58" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

export function SketchCircle({width = 220, height = 105, color = C.b1Blue, style}: SketchProps) {
  return <svg width={width} height={height} viewBox="0 0 220 105" preserveAspectRatio="none" style={style}>
    <path d="M155 10 C101 -2 19 10 8 47 C-5 86 96 105 165 90 C231 76 229 23 156 14 C131 9 115 9 96 11" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
  </svg>;
}

export function InkUnderline({width = 220, height = 16, color = C.b1Yellow, style}: SketchProps) {
  return <svg width={width} height={height} viewBox="0 0 220 16" preserveAspectRatio="none" style={style}>
    <path d="M4 9 Q100 0 213 6 L217 11 Q114 7 6 14Z" fill={color} />
  </svg>;
}
