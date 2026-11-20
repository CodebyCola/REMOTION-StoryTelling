import type {CSSProperties, ReactNode} from "react";
import {AbsoluteFill} from "remotion";
import {C, FONT_UI, SAFE_ZONE as zone} from "../theme";

const regions: {label: string; color: string; bounds: CSSProperties}[] = [
  {label: "Top UI", color: "#ffa68e", bounds: {top: 0, left: 0, right: 0, height: zone.top}},
  {label: "Right actions", color: "#ffa68e", bounds: {top: 820, bottom: zone.bottom, right: 0, width: zone.right}},
  {label: "Bottom description", color: "#ffa68e", bounds: {height: zone.bottom, bottom: 0, left: 0, right: 0}},
  {label: "Primary safe area", color: "#86efac", bounds: {left: zone.left, top: zone.top, width: zone.width, height: zone.primaryHeight}},
  {label: "Caption band", color: "#a6ceff", bounds: {left: zone.left, top: zone.captionBandTop, width: zone.width, height: zone.captionBandBottom - zone.captionBandTop}},
];

export function SafeStage({children, showSafeZones = false}: {children?: ReactNode; showSafeZones?: boolean}) {
  return (
    <AbsoluteFill style={{overflow: "hidden", backgroundColor: C.nightDeep}}>
      {children}
      {showSafeZones && (
        <AbsoluteFill style={{pointerEvents: "none", zIndex: 1000, fontFamily: FONT_UI, fontSize: 22, fontWeight: 700}}>
          {regions.map(({label, color, bounds}) => (
            <div key={label} style={{position: "absolute", ...bounds, color, boxSizing: "border-box", border: `2px dashed ${color}`, backgroundColor: `${color}14`}}>
              <span style={{background: "#14212c", padding: "2px 8px"}}>{label}</span>
            </div>
          ))}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
}
