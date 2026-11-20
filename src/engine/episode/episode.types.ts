import type {ComponentType, ReactNode} from "react";
import type {StylePresetName} from "../theme";

export type CaptionCue = {text: string; startMs: number; endMs: number};
export type CaptionPlacement = "top-safe" | "bottom-safe";
export type FinishingMode = "auto" | "hd2d" | "paper" | "none";
export type PartMeta = {
  id: string;
  index: number;
  audioSrc: string;
  durationInSeconds: number;
  durationInFrames: number;
  startFrame: number;
  hasCaptions: boolean;
  captions: CaptionCue[];
};
export type EpisodeData = {
  topic: string;
  episode: string;
  fps: number;
  width: number;
  height: number;
  totalDurationInFrames: number;
  bgm: {src: string; volume: number} | null;
  parts: PartMeta[];
};
export type PartProps = {
  part: PartMeta;
  showCaptions?: boolean;
  captionPlacement?: CaptionPlacement;
};
export type PartComponents = Record<string, ComponentType<PartProps>>;
export type EpisodeProps = {
  showSafeZones?: boolean;
  showCaptions?: boolean;
  captionPlacement?: CaptionPlacement;
  hd2dOverlay?: boolean;
  finishing?: FinishingMode;
  stylePreset?: StylePresetName;
  bgmVolume?: number;
  onlyPartId?: string;
};
export type EpisodePlayerProps = EpisodeProps & {
  data: EpisodeData;
  parts: PartComponents;
  overlay?: ReactNode;
};
export type TopicDefinition = {
  slug: string;
  stylePreset?: StylePresetName;
  episodes: {slug: string; data: EpisodeData; component: ComponentType<EpisodeProps>}[];
};
