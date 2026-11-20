import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  getAudioDurationInSeconds,
  parseMp3DurationFromBuffer,
  parseWavDurationFromBuffer,
} from "../.agents/skills/remotion-storytelling/scripts/audio-duration.mjs";

function chunk(id, bytes) {
  const result = Buffer.alloc(8 + bytes.length + (bytes.length % 2));
  result.write(id);
  result.writeUInt32LE(bytes.length, 4);
  bytes.copy(result, 8);
  return result;
}

test("WAV skips padded non-audio chunks and rejects truncated audio", () => {
  const format = Buffer.alloc(16);
  format.writeUInt16LE(1, 0);
  format.writeUInt16LE(1, 2);
  format.writeUInt32LE(8000, 4);
  format.writeUInt32LE(16000, 8);
  format.writeUInt16LE(2, 12);
  format.writeUInt16LE(16, 14);
  const wav = Buffer.concat([
    Buffer.from("RIFF    WAVE"),
    chunk("JUNK", Buffer.alloc(3)),
    chunk("fmt ", format),
    chunk("LIST", Buffer.alloc(7)),
    chunk("data", Buffer.alloc(8000)),
  ]);
  wav.writeUInt32LE(wav.length - 8, 4);
  assert.equal(parseWavDurationFromBuffer(wav), 0.5);
  assert.throws(() => parseWavDurationFromBuffer(wav.subarray(0, -200)), /WAV/);
});

test("MP3 sums variable bitrate frames and ignores ID3v2 and ID3v1 metadata", () => {
  const tag = Buffer.alloc(138);
  tag.write("ID3");
  tag[3] = 4;
  tag[8] = 1; // A synchsafe tag size of 128 bytes.
  const trailer = Buffer.alloc(128);
  trailer.write("TAG");
  // MPEG-1 Layer III, 48 kHz. Frames at 128 and 192 kbps carry 1152 samples each.
  const frames = [Buffer.alloc(384), Buffer.alloc(576)];
  frames[0].set([0xff, 0xfb, 0x94, 0]);
  frames[1].set([0xff, 0xfb, 0xb4, 0]);
  const mp3 = Buffer.concat([tag, ...frames, trailer]);
  assert.equal(parseMp3DurationFromBuffer(mp3), 0.048);
  assert.throws(
    () =>
      parseMp3DurationFromBuffer(
        Buffer.concat([tag, frames[0].subarray(0, -1)]),
      ),
    /MP3/,
  );
});

test("Safe Room's five real MP3 slices produce the authored episode frame counts", () => {
  const filenames = [
    "01-cold-path",
    "02-relief",
    "03-signals",
    "04-meaning",
    "05-loop-path",
  ];
  const counts = filenames.map((name) => {
    const asset = new URL(
      `../public/topics/safe-room/ep-01/parts/${name}.mp3`,
      import.meta.url,
    );
    return Math.ceil(getAudioDurationInSeconds(fileURLToPath(asset)) * 30);
  });
  assert.deepEqual(counts, [330, 342, 364, 345, 256]);
});
