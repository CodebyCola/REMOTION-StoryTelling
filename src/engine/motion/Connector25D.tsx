import { C, H, W, clamp } from "../theme";

export type ConnectorPoint = { x: number; y: number };

export function Connector25D({
  from,
  to,
  progress,
  color = C.warmMid,
  strokeWidth = 5,
  curved = true,
  arrowHead = true,
  zIndex,
}: {
  from: ConnectorPoint;
  to: ConnectorPoint;
  progress: number;
  color?: string;
  strokeWidth?: number;
  curved?: boolean;
  arrowHead?: boolean;
  zIndex?: number;
}) {
  const p = clamp(progress);
  if (p <= 0.001) return null;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.max(1, Math.hypot(dx, dy));
  const bend = curved ? Math.min(90, dist * 0.25) : 0;
  const cx = (from.x + to.x) / 2 + (Math.abs(dx) < Math.abs(dy) ? bend : 0);
  const cy = (from.y + to.y) / 2 - (Math.abs(dx) >= Math.abs(dy) ? bend : 0);

  const d = curved
    ? `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`
    : `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  const pathLength = Math.max(
    1,
    curved ? Math.hypot(cx - from.x, cy - from.y) + Math.hypot(to.x - cx, to.y - cy) : dist,
  );

  const angle = Math.atan2(to.y - (curved ? cy : from.y), to.x - (curved ? cx : from.x));
  const headLen = strokeWidth * 3.2;
  const headOpacity = clamp((p - 0.72) / 0.28);
  const h1x = to.x - headLen * Math.cos(angle - Math.PI / 6);
  const h1y = to.y - headLen * Math.sin(angle - Math.PI / 6);
  const h2x = to.x - headLen * Math.cos(angle + Math.PI / 6);
  const h2y = to.y - headLen * Math.sin(angle + Math.PI / 6);

  return (
    <svg
      width={W}
      height={H}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        overflow: "visible",
        pointerEvents: "none",
        zIndex,
      }}
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={pathLength}
        strokeDashoffset={pathLength * (1 - p)}
      />
      {arrowHead && (
        <path
          d={`M ${h1x} ${h1y} L ${to.x} ${to.y} L ${h2x} ${h2y}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={headOpacity}
        />
      )}
    </svg>
  );
}
