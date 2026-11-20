import React from "react";
import { EpisodePlayer } from "@engine/episode/EpisodePlayer";
import type { EpisodeProps } from "@engine/episode/episode.types";
import data from "./episode.data.json";
import { parts } from "./parts.generated";

export const Episode: React.FC<EpisodeProps> = (props) => (
  <EpisodePlayer data={data} parts={parts} {...props} />
);
