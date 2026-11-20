import {Audio} from "@remotion/media";
import {staticFile} from "remotion";

export function PartAudio({src, volume = 1, loop = false}: {src: string; volume?: number; loop?: boolean}) {
  return <Audio src={staticFile(src)} volume={volume} loop={loop} />;
}
