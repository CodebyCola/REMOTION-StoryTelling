import {Fragment} from "react";
import {Composition, Folder} from "remotion";
import {z} from "zod";
import "@engine/fonts";
import {TOPICS} from "./topics";

const controls = z.object({
  showSafeZones: z.boolean(),
  showCaptions: z.boolean(),
  captionPlacement: z.enum(["top-safe", "bottom-safe"]),
  hd2dOverlay: z.boolean(),
  finishing: z.enum(["auto", "hd2d", "paper", "none"]).optional(),
  stylePreset: z.enum(["hd2d-cinematic", "b1-editorial", "neo-25d-dark", "neo-25d-light"]).optional(),
  bgmVolume: z.number().min(0).max(1),
  onlyPartId: z.string().optional(),
});

export function RemotionRoot() {
  return <>{TOPICS.map(topic => (
    <Folder key={topic.slug} name={topic.slug}>
      {topic.episodes.filter(ep => ep.data.totalDurationInFrames > 0).map(({slug, data, component}) => {
        const id = topic.slug + "-" + slug;
        const common = {component, schema: controls, width: data.width, height: data.height, fps: data.fps};
        const defaults = {
          showSafeZones: false,
          showCaptions: true,
          captionPlacement: "top-safe" as const,
          hd2dOverlay: true,
          finishing: "auto" as const,
          ...(topic.stylePreset ? {stylePreset: topic.stylePreset} : {}),
          bgmVolume: data.bgm?.volume ?? 0.15,
        };
        return <Fragment key={id}>
          <Composition {...common} id={id} durationInFrames={data.totalDurationInFrames} defaultProps={defaults} />
          <Folder name={slug}>
            <Folder name="parts">
              {data.parts.map(part => (
                <Composition {...common} id={id + "-part-" + String(Number(part.id.split("-")[0])).padStart(2,"0")}
                  key={part.id} durationInFrames={part.durationInFrames}
                  defaultProps={{...defaults, onlyPartId:part.id}} />
              ))}
            </Folder>
          </Folder>
        </Fragment>;
      })}
    </Folder>
  ))}</>;
}
