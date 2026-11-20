import fs from "node:fs";
import path from "node:path";
import {parseArgs} from "node:util";
import {pathToFileURL} from "node:url";
import {partFiles, refreshRegistry, validateSlug} from "./registry.mjs";
export {validateSlug};

function locations(rootDir, topic, episode) {
  validateSlug(topic, "topic");
  validateSlug(episode, "episode");
  const topicDir = path.join(rootDir, "src/topics", topic);
  return {
    topicDir, episodeDir: path.join(topicDir, "episodes", episode),
    publicPartsDir: path.join(rootDir, "public/topics", topic, episode, "parts"),
  };
}

function partSource(style) {
  if (!["hybrid", "hd2d", "b1-stickman"].includes(style)) throw new Error("Invalid style: " + style);
  if (style === "hd2d") {
    return [
      'import type {PartProps} from "@engine/episode/episode.types";',
      'import {BackgroundLayer} from "@engine/layout/BackgroundLayer";',
      'import {SafeLayout, StageSlot} from "@engine/layout/SafeLayout";',
      'import {CameraRig25D} from "@engine/motion/CameraRig25D";',
      'import {KineticText} from "@engine/motion25d/KineticText";',
      'import {C, TYPE_SCALE} from "@engine/theme";',
      "",
      "export default function Part({showCaptions = true, captionPlacement}: PartProps) {",
      "  return (",
      "    <>",
      '      <BackgroundLayer preset="hd2d-night" />',
      '      <CameraRig25D preset="slow-push">',
      "        <SafeLayout showCaptions={showCaptions} captionPlacement={captionPlacement}>",
      '          <StageSlot slot="header">',
      '            <KineticText text="Scene Title" style={{fontSize: TYPE_SCALE.title, color: C.uiLine}} />',
      "          </StageSlot>",
      '          <StageSlot slot="stage" />',
      "        </SafeLayout>",
      "      </CameraRig25D>",
      "    </>",
      "  );",
      "}",
      "",
    ].join("\n");
  }
  const preset = style === "b1-stickman" ? "b1-editorial" : "neo-25d-light";
  return [
    'import {TitleHookScene} from "@engine/archetypes/TitleHookScene";',
    'import type {PartProps} from "@engine/episode/episode.types";',
    'import {Stickman} from "@engine/stickman/Stickman";',
    "",
    "export default function Part({showCaptions = true, captionPlacement}: PartProps) {",
    "  return (",
    "    <TitleHookScene",
    `      preset="${preset}"`,
    '      eyebrow="Part"',
    '      title="Scene Hook"',
    "      showCaptions={showCaptions}",
    "      captionPlacement={captionPlacement}",
    "    >",
    '      <Stickman pose="think" expression="curious" />',
    "    </TitleHookScene>",
    "  );",
    "}",
    "",
  ].join("\n");
}

function writeNew(file, content) {
  try { fs.writeFileSync(file, content, {flag: "wx"}); }
  catch (error) { if (error.code !== "EEXIST") throw error; }
}

export function scaffoldEpisode({rootDir = process.cwd(), topic, episode, partCount = 1, style = "hybrid", force = false}) {
  const dirs = locations(rootDir, topic, episode);
  const {topicDir, episodeDir, publicPartsDir} = dirs;
  if (!Number.isSafeInteger(partCount) || partCount < 1 || partCount > 999) throw new Error("Part count must be 1–999.");
  const template = partSource(style);
  fs.mkdirSync(path.dirname(episodeDir), {recursive: true});
  try { fs.mkdirSync(episodeDir); }
  catch (error) {
    if (error.code !== "EEXIST") throw error;
    if (!force) throw new Error("Episode already exists: " + episodeDir);
  }
  fs.mkdirSync(publicPartsDir, {recursive: true});
  const partsDir = path.join(episodeDir, "parts");
  fs.mkdirSync(partsDir, {recursive: true});
  const existing = new Map(partFiles(episodeDir).map(p => [p.number, p.name]));
  for (let i = 1; i <= partCount; i++) {
    const name = existing.get(i) ?? `Part${String(i).padStart(2,"0")}.tsx`;
    fs.writeFileSync(path.join(partsDir, name), template, {flag: force ? "w" : "wx"});
  }
  const stylePreset = style === "b1-stickman" ? "b1-editorial" : style === "hybrid" ? "neo-25d-light" : "hd2d-cinematic";
  writeNew(path.join(topicDir, "topic.config.ts"), `import type {TopicDefinition} from "@engine/episode/episode.types";
import {episodes} from "./episodes.generated";

export default {slug: "${topic}", stylePreset: "${stylePreset}", episodes} satisfies TopicDefinition;
`);
  writeNew(path.join(episodeDir, "episode.data.json"), JSON.stringify({
    topic, episode, fps: 30, width: 1080, height: 1920, totalDurationInFrames: 0, bgm: null, parts: [],
  }, null, 2) + "\n");
  writeNew(path.join(episodeDir, "Episode.tsx"), `import {EpisodePlayer} from "@engine/episode/EpisodePlayer";
import type {EpisodeProps} from "@engine/episode/episode.types";
import data from "./episode.data.json";
import {parts} from "./parts.generated";

export function Episode(props: EpisodeProps) {
  return <EpisodePlayer {...props} data={data} parts={parts} />;
}
`);
  refreshRegistry(rootDir);
  return dirs;
}

export function addPart({rootDir = process.cwd(), topic, episode, style = "hybrid"}) {
  const {episodeDir} = locations(rootDir, topic, episode);
  const next = (partFiles(episodeDir).at(-1)?.number ?? 0) + 1;
  const file = path.join(episodeDir, "parts", `Part${String(next).padStart(2,"0")}.tsx`);
  fs.writeFileSync(file, partSource(style), {flag: "wx"});
  refreshRegistry(rootDir);
  return file;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    const {values, positionals} = parseArgs({allowPositionals: true, options: {
      topic: {type:"string"}, episode: {type:"string"}, parts: {type:"string"}, style: {type:"string"},
      force: {type:"boolean"}, "add-part": {type:"boolean"}, registry: {type:"boolean"},
    }});
    if (values.registry) {
      refreshRegistry(process.cwd());
    } else {
      const pieces = positionals[0]?.split("/") ?? [];
      if (positionals.length > 1 || pieces.length > 2) throw new Error("Expected <topic>/<episode>.");
      const options = {topic: values.topic ?? pieces[0], episode: values.episode ?? pieces[1] ?? "ep-01",
        partCount: Number(values.parts ?? 1), style: values.style, force: values.force};
      console.log(values["add-part"] ? addPart(options) : scaffoldEpisode(options).episodeDir);
    }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
