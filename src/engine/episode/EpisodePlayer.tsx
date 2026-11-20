import {TransitionSeries} from "@remotion/transitions";
import {Sequence} from "remotion";
import {PartCaptionTrack} from "../audio/CaptionOverlay";
import {PartAudio} from "../audio/PartAudio";
import {HD2DOverlay} from "../hd2d/HD2DOverlay";
import {PaperStageOverlay} from "../layout/PaperStageOverlay";
import {SafeLayoutContext} from "../layout/SafeLayout";
import {SafeStage} from "../layout/SafeStage";
import {resolveFinishingMode} from "../theme";
import type {EpisodePlayerProps} from "./episode.types";
import {resolveParts} from "./resolveParts";

export function EpisodePlayer({
  data, parts, overlay, onlyPartId, showSafeZones = false, showCaptions = true,
  captionPlacement = "top-safe", hd2dOverlay = true, finishing, stylePreset, bgmVolume,
}: EpisodePlayerProps) {
  const selected = resolveParts(data.parts, parts, onlyPartId);
  const offset = onlyPartId ? selected[0].part.startFrame : 0;
  const activeFinishing = resolveFinishingMode({finishing, stylePreset, hd2dOverlay});
  return (
    <SafeStage showSafeZones={showSafeZones}>
      {data.bgm && (
        <Sequence from={-offset} layout="none" name="Background music">
          <PartAudio src={data.bgm.src} volume={bgmVolume ?? data.bgm.volume} loop />
        </Sequence>
      )}
      <TransitionSeries>
        {selected.map(({part, Component}) => (
          <TransitionSeries.Sequence key={part.id} name={part.id} durationInFrames={part.durationInFrames}>
            <PartAudio src={part.audioSrc} />
            <SafeLayoutContext.Provider value={{captionsRenderedByTrack: showCaptions && part.hasCaptions, captionPlacement}}>
              <Component part={part} showCaptions={showCaptions && !part.hasCaptions} captionPlacement={captionPlacement} />
            </SafeLayoutContext.Provider>
            {showCaptions && part.hasCaptions && <PartCaptionTrack captions={part.captions} placement={captionPlacement} />}
          </TransitionSeries.Sequence>
        ))}
      </TransitionSeries>
      {overlay && <Sequence from={-offset} layout="none" name="Episode overlay">{overlay}</Sequence>}
      {activeFinishing === "hd2d" && <HD2DOverlay />}
      {activeFinishing === "paper" && <PaperStageOverlay />}
    </SafeStage>
  );
}