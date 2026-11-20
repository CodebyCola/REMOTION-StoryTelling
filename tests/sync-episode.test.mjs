import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  parseSrtContent,
  syncEpisode,
} from "../.agents/skills/remotion-storytelling/scripts/sync-episode.mjs";

function wav(samples) {
  const audio = Buffer.alloc(44 + samples * 2);
  audio.write("RIFF");
  audio.writeUInt32LE(audio.length - 8, 4);
  audio.write("WAVEfmt ", 8);
  audio.writeUInt32LE(16, 16);
  audio.writeUInt16LE(1, 20);
  audio.writeUInt16LE(1, 22);
  audio.writeUInt32LE(8000, 24);
  audio.writeUInt32LE(16000, 28);
  audio.writeUInt16LE(2, 32);
  audio.writeUInt16LE(16, 34);
  audio.write("data", 36);
  audio.writeUInt32LE(samples * 2, 40);
  return audio;
}

function workspace(t) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "story-sync-"));
  t.after(() => fs.rmSync(rootDir, { recursive: true, force: true }));
  const assetDir = path.join(rootDir, "public/topics/demo/ep-01");
  const partsDir = path.join(assetDir, "parts");
  fs.mkdirSync(partsDir, { recursive: true });
  const write = (name, content) =>
    fs.writeFileSync(path.join(partsDir, name), content);
  const sync = () => syncEpisode({ rootDir, target: "demo/ep-01" });
  return { rootDir, assetDir, write, sync };
}

test("SRT accepts BOM, CRLF, comma/dot timestamps, and multiline text", () => {
  assert.deepEqual(parseSrtContent(" \r\n "), []);
  const srt =
    "\uFEFF1\r\n00:00:00,250 --> 00:00:01.125\r\nBaris satu\r\nBaris dua\r\n\r\n2\n00:00:02.100 --> 00:00:03,000\nHalo\n";
  assert.deepEqual(parseSrtContent(srt), [
    { text: "Baris satu\nBaris dua", startMs: 250, endMs: 1125 },
    { text: "Halo", startMs: 2100, endMs: 3000 },
  ]);
});

test("sync builds the ordered timeline with local subtitle times and optional BGM", (t) => {
  const { assetDir, sync, write } = workspace(t);
  write("10-ending.wav", wav(12000));
  write("1-opening.wav", wav(8001));
  write("2-mid.wav", wav(4000));
  write("03-bridge.wav", wav(8000));
  write("1-opening.srt", "1\n00:00:00,100 --> 00:00:00,800\nHello\n");
  write(
    "2-mid.json",
    JSON.stringify([
      { text: "A", start: 0.1, end: 0.2 },
      { text: "B", startMs: 240, endMs: 350 },
    ]),
  );
  write("03-bridge.srt", " \r\n ");
  fs.writeFileSync(path.join(assetDir, "bgm.wav"), wav(800));
  const { data, outputFile } = sync();
  assert.equal(data.topic, "demo");
  assert.equal(data.episode, "ep-01");
  assert.deepEqual([data.width, data.height, data.fps], [1080, 1920, 30]);
  assert.equal(data.bgm.src, "topics/demo/ep-01/bgm.wav");
  assert.ok(data.bgm.volume > 0 && data.bgm.volume <= 1);
  assert.equal(data.totalDurationInFrames, 121);
  assert.deepEqual(
    data.parts.map((p) => [p.id, p.index, p.startFrame, p.durationInFrames]),
    [
      ["1-opening", 1, 0, 31],
      ["2-mid", 2, 31, 15],
      ["03-bridge", 3, 46, 30],
      ["10-ending", 4, 76, 45],
    ],
  );
  assert.deepEqual(
    data.parts.map((p) => p.hasCaptions),
    [true, true, false, false],
  );
  assert.deepEqual(data.parts[0].captions, [
    { text: "Hello", startMs: 100, endMs: 800 },
  ]);
  assert.deepEqual(data.parts[1].captions, [
    { text: "A", startMs: 100, endMs: 200 },
    { text: "B", startMs: 240, endMs: 350 },
  ]);
  assert.deepEqual(data.parts[3].captions, []);
  assert.equal(data.parts[0].audioSrc, "topics/demo/ep-01/parts/1-opening.wav");
  assert.deepEqual(JSON.parse(fs.readFileSync(outputFile, "utf8")), data);
});

test("a failed sync preserves the last timeline and reports the offending file", (t) => {
  const { sync, write } = workspace(t);
  write("01-part.wav", wav(8000));
  const { outputFile, data } = sync();
  assert.equal(data.bgm, null);
  const original = fs.readFileSync(outputFile, "utf8");
  write("01-part.json", '[{"text":"bad","start":1,"end":0}]');
  assert.throws(sync, /01-part\.json/);
  assert.equal(fs.readFileSync(outputFile, "utf8"), original);
  write("01-part.json", "[]");
  write("1-other.wav", wav(4000));
  assert.throws(sync, /duplicate/i);
  assert.equal(fs.readFileSync(outputFile, "utf8"), original);
});

test("rejects invalid target paths, missing audio and unnumbered audio", (t) => {
  const { rootDir, sync, write } = workspace(t);
  for (const target of [
    "../ep-01",
    "demo/../ep-01",
    "Demo/ep-01",
    "demo/..",
    "demo/ep-01\\extra",
  ]) {
    assert.throws(() => syncEpisode({ rootDir, target }), /invalid/i);
  }
  assert.throws(sync, /audio/i);
  write("intro.wav", wav(100));
  assert.throws(sync, /intro\.wav/);
});

test("CLI accepts separate topic and episode flags and writes relative to the working directory", (t) => {
  const { rootDir, write } = workspace(t);
  write("01-hello.wav", wav(8000));
  const script = fileURLToPath(
    new URL(
      "../.agents/skills/remotion-storytelling/scripts/sync-episode.mjs",
      import.meta.url,
    ),
  );
  const run = spawnSync(
    process.execPath,
    [script, "--topic", "demo", "--episode", "ep-01"],
    { cwd: rootDir, encoding: "utf8" },
  );
  assert.equal(run.status, 0, run.stderr);
  assert.equal(JSON.parse(run.stdout).totalDurationInFrames, 30);
  assert.ok(
    fs.existsSync(
      path.join(rootDir, "src/topics/demo/episodes/ep-01/episode.data.json"),
    ),
  );
});
