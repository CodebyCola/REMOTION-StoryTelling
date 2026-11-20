import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { parseSrt } from "@remotion/captions";
import { getAudioDurationInSeconds } from "./audio-duration.mjs";

const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const collator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});
const audioExtensions = new Set([".mp3", ".wav", ".m4a", ".ogg"]);

function normalizeCue(cue, index) {
  const milliseconds = cue?.startMs !== undefined || cue?.endMs !== undefined;
  const start = milliseconds ? cue?.startMs : cue?.start;
  const end = milliseconds ? cue?.endMs : cue?.end;
  if (
    typeof cue?.text !== "string" ||
    !cue.text.trim() ||
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start < 0 ||
    end <= start
  ) {
    throw new Error(`Invalid text or time range in caption ${index + 1}`);
  }
  return {
    text: cue.text,
    startMs: milliseconds ? start : start * 1000,
    endMs: milliseconds ? end : end * 1000,
  };
}

export function parseSrtContent(srtText) {
  const input = srtText.trim().replace(/\r\n?/g, "\n");
  if (!input) return [];
  return parseSrt({ input, strict: true }).captions.map(normalizeCue);
}

function readCaptions(partsDir, id) {
  for (const extension of [".srt", ".json"]) {
    const file = path.join(partsDir, id + extension);
    if (!fs.existsSync(file)) continue;
    try {
      const content = fs.readFileSync(file, "utf8");
      if (extension === ".srt") return parseSrtContent(content);
      const array = JSON.parse(content.replace(/^\uFEFF/, ""));
      if (!Array.isArray(array))
        throw new Error("Expected a JSON array of captions");
      return array.map(normalizeCue);
    } catch (error) {
      throw new Error(`${file}: ${error.message}`, { cause: error });
    }
  }
  return [];
}

export function syncEpisode({ rootDir = process.cwd(), target, fps = 30 }) {
  const slugs = typeof target === "string" ? target.split("/") : [];
  if (slugs.length !== 2 || !slugs.every((part) => slug.test(part))) {
    throw new Error(
      "Invalid target. Use <topic>/<episode> with lowercase kebab-case slugs.",
    );
  }
  if (!Number.isFinite(fps) || fps <= 0)
    throw new Error("Invalid fps. Supply a positive number.");
  const [topic, episode] = slugs;
  const assetBase = `topics/${topic}/${episode}`;
  const assetDir = path.resolve(rootDir, "public", assetBase);
  const partsDir = path.join(assetDir, "parts");
  const filenames = fs
    .readdirSync(partsDir, { withFileTypes: true })
    .filter(
      (file) =>
        file.isFile() &&
        audioExtensions.has(path.extname(file.name).toLowerCase()),
    )
    .map((file) => file.name)
    .sort(collator.compare);
  if (!filenames.length)
    throw new Error(`No numbered audio files found in ${partsDir}`);

  const prefixes = new Set();
  let totalDurationInFrames = 0;
  const parts = filenames.map((filename, position) => {
    const id = path.parse(filename).name;
    const prefix = /^(\d+)(?:-.+)?$/.exec(id)?.[1];
    if (!prefix || BigInt(prefix) === 0n)
      throw new Error(
        `Expected a positive numbered audio filename, got ${filename}`,
      );
    const number = BigInt(prefix);
    if (prefixes.has(number))
      throw new Error(`Duplicate part number ${number} in ${filename}`);
    prefixes.add(number);
    let durationInSeconds;
    try {
      durationInSeconds = getAudioDurationInSeconds(
        path.join(partsDir, filename),
      );
    } catch (error) {
      throw new Error(`${filename}: ${error.message}`, { cause: error });
    }
    const durationInFrames = Math.max(1, Math.ceil(durationInSeconds * fps));
    const startFrame = totalDurationInFrames;
    totalDurationInFrames += durationInFrames;
    const captions = readCaptions(partsDir, id);
    return {
      id,
      index: position + 1,
      audioSrc: `${assetBase}/parts/${filename}`,
      durationInSeconds,
      durationInFrames,
      startFrame,
      hasCaptions: captions.length > 0,
      captions,
    };
  });
  const bgmFile = ["bgm.mp3", "bgm.wav"].find((name) =>
    fs.statSync(path.join(assetDir, name), { throwIfNoEntry: false })?.isFile(),
  );
  const data = {
    topic,
    episode,
    fps,
    width: 1080,
    height: 1920,
    totalDurationInFrames,
    bgm: bgmFile ? { src: `${assetBase}/${bgmFile}`, volume: 0.15 } : null,
    parts,
  };
  const outputDir = path.resolve(
    rootDir,
    "src",
    "topics",
    topic,
    "episodes",
    episode,
  );
  const outputFile = path.join(outputDir, "episode.data.json");
  fs.mkdirSync(outputDir, { recursive: true });
  const temporary = `${outputFile}.${randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temporary, JSON.stringify(data, null, 2) + "\n", {
      flag: "wx",
    });
    fs.renameSync(temporary, outputFile);
  } finally {
    fs.rmSync(temporary, { force: true });
  }
  return { data, outputFile };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const { values, positionals } = parseArgs({
      allowPositionals: true,
      options: {
        topic: { type: "string" },
        episode: { type: "string" },
        fps: { type: "string" },
      },
    });
    const target = positionals.length
      ? positionals[0]
      : `${values.topic ?? ""}/${values.episode ?? ""}`;
    if (
      positionals.length > 1 ||
      (positionals.length && (values.topic || values.episode))
    ) {
      throw new Error(
        "Usage: npm run sync -- <topic>/<episode> or --topic <topic> --episode <episode>",
      );
    }
    const { data, outputFile } = syncEpisode({
      target,
      fps: Number(values.fps ?? 30),
    });
    console.log(
      JSON.stringify({
        target,
        parts: data.parts.length,
        totalDurationInFrames: data.totalDurationInFrames,
        outputFile,
      }),
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
