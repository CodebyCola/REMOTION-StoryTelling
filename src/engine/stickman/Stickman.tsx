import {useCurrentFrame, useVideoConfig} from "remotion";
import {C, lsin} from "../theme";

type Point = {x: number; y: number};
type Pose = "idle" | "think" | "point" | "hold" | "celebrate" | "walk";
type Expression = "neutral" | "curious" | "happy" | "surprised";
export type StickmanProps = {
  pose?: Pose;
  expression?: Expression;
  facing?: "left" | "right";
  x?: number;
  y?: number;
  scale?: number;
  accentColor?: string;
  /** Front hand position in the unmirrored 240 x 320 figure coordinates. */
  handTarget?: Point;
};

// Each arm has a bent elbow and a wrist. All poses share the same shoulder.
const arms: Record<Pose, {back: string; elbow: Point; hand: Point}> = {
  idle: {back: "M113 115 Q95 142 90 174", elbow: {x: 139, y: 141}, hand: {x: 147, y: 169}},
  think: {back: "M113 115 Q79 161 140 151", elbow: {x: 156, y: 162}, hand: {x: 141, y: 91}},
  point: {back: "M113 115 Q87 141 90 173", elbow: {x: 153, y: 119}, hand: {x: 207, y: 88}},
  hold: {back: "M113 115 Q92 163 155 158", elbow: {x: 148, y: 150}, hand: {x: 175, y: 136}},
  celebrate: {back: "M113 115 Q74 96 60 49", elbow: {x: 157, y: 88}, hand: {x: 174, y: 41}},
  walk: {back: "M113 115 Q90 140 81 157", elbow: {x: 145, y: 147}, hand: {x: 163, y: 137}},
};

export function Stickman({
  pose = "idle", expression = "neutral", facing = "right", x, y,
  scale = 1.6, accentColor = C.b1Blue, handTarget,
}: StickmanProps) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const breath = lsin(frame, fps * 2.4);
  const step = pose === "walk" ? lsin(frame, fps * 0.82) : 0;
  const {back, elbow, hand} = arms[pose];
  const wrist = handTarget ?? {x: hand.x + step * 18, y: hand.y + breath * 1.5};
  const headTilt = (pose === "think" ? -7 : pose === "point" ? 4 : 0) + breath * 1.4;
  const lifted = pose === "celebrate" ? Math.abs(lsin(frame, fps)) * 6 : 0;
  const blink = frame % Math.round(fps * 3.4) < 3 && frame > 3;
  const mouth = {neutral: "M131 77 q5 2 11 -1", curious: "M132 78 q4 -4 10 -3", happy: "M126 74 q9 14 20 -1", surprised: "M138 72 a5 6 0 1 0 .1 0"}[expression];
  const positioned = x !== undefined || y !== undefined;
  return (
    <svg width={240 * scale} height={320 * scale} viewBox="0 0 240 320"
      style={positioned ? {position: "absolute", left: x ?? 0, top: y ?? 0, overflow: "visible"} : {position: "relative", overflow: "visible"}}>
      <g transform={facing === "left" ? "translate(240 0) scale(-1 1)" : undefined}
        stroke={C.b1Ink} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <g transform={`translate(0 ${-lifted - Math.abs(step) * 3})`}>
          <path d={`M113 191 Q99 228 ${91 - step * 17} 270 l-14 2 M114 191 Q133 226 ${143 + step * 18} 270 l15 2`} />
          <path d="M116 99 Q108 145 113 191" />
          <path d={back} transform={`rotate(${step * 16} 113 115)`} />
          <g transform={`rotate(${headTilt} 116 100)`}>
            <path d="M116 99 C91 98 77 84 78 62 C79 38 99 23 121 26 C147 27 160 47 155 68 C152 87 137 99 116 99Z" fill={C.b1Paper} />
            {expression === "curious" && <path d="M135 46 l10 -3" strokeWidth={3} />}
            <g fill={C.b1Ink} stroke="none">
              <ellipse cx={115} cy={58} rx={3} ry={blink ? 1 : 4} />
              <ellipse cx={140} cy={56} rx={3} ry={blink ? 1 : 4} />
            </g>
            <path d={mouth} strokeWidth={3.5} />
          </g>
          <path d={`M114 115 Q${elbow.x} ${elbow.y} ${wrist.x} ${wrist.y}`} />
          {pose === "point" && <path d={`M${wrist.x} ${wrist.y} l11 -4`} strokeWidth={4} />}
          <path d="M107 105 q8 4 16 -1 l-3 10 -13 -4Z" fill={accentColor} stroke={accentColor} strokeWidth={2} />
        </g>
      </g>
    </svg>
  );
}
