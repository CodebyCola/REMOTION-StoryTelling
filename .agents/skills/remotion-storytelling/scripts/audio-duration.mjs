import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

export function parseWavDurationFromBuffer(buffer) {
  if (
    buffer.length < 12 ||
    buffer.toString("ascii", 0, 4) !== "RIFF" ||
    buffer.toString("ascii", 8, 12) !== "WAVE"
  ) {
    throw new Error("Invalid WAV RIFF header");
  }
  const end = buffer.readUInt32LE(4) + 8;
  if (end > buffer.length) throw new Error("Truncated WAV file");
  let byteRate = 0;
  let dataSize = 0;
  for (let offset = 12; offset < end; ) {
    if (offset + 8 > end) throw new Error("Truncated WAV chunk header");
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (start + size > end) throw new Error(`Truncated WAV ${id} chunk`);
    if (id === "fmt ") {
      if (size < 16) throw new Error("Invalid WAV format chunk");
      byteRate = buffer.readUInt32LE(start + 8);
    } else if (id === "data") {
      dataSize += size;
    }
    offset = start + size + (size % 2);
  }
  if (!byteRate || !dataSize)
    throw new Error("WAV needs a valid format and nonempty audio data");
  return dataSize / byteRate;
}

const mpeg1Bitrates = [
  0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320,
];
const mpeg2Bitrates = [
  0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160,
];

export function parseMp3DurationFromBuffer(buffer) {
  let offset = 0;
  let end = buffer.length;
  // ID3v2 stores its length as four base-128 digits. A v2.4 footer is extra.
  while (buffer.toString("ascii", offset, offset + 3) === "ID3") {
    if (offset + 10 > end) throw new Error("Truncated MP3 ID3v2 header");
    const sizeBytes = buffer.subarray(offset + 6, offset + 10);
    if (sizeBytes.some((byte) => byte > 127))
      throw new Error("Invalid MP3 ID3v2 tag size");
    const size = sizeBytes.reduce((length, byte) => length * 128 + byte, 0);
    const footer =
      buffer[offset + 3] === 4 && buffer[offset + 5] & 0x10 ? 10 : 0;
    offset += 10 + size + footer;
  }
  if (end >= 128 && buffer.toString("ascii", end - 128, end - 125) === "TAG")
    end -= 128;

  // Accumulate integer samples by rate so a long string of frames has no rounding drift.
  const samplesByRate = new Map();
  while (offset < end) {
    const version = (buffer[offset + 1] >> 3) & 3;
    const layer = (buffer[offset + 1] >> 1) & 3;
    if (
      offset + 4 > end ||
      buffer[offset] !== 0xff ||
      (buffer[offset + 1] & 0xe0) !== 0xe0 ||
      version === 1 ||
      layer !== 1
    ) {
      throw new Error(`Invalid MP3 Layer III header at byte ${offset}`);
    }
    const mpeg1 = version === 3;
    const bitrate = (mpeg1 ? mpeg1Bitrates : mpeg2Bitrates)[
      buffer[offset + 2] >> 4
    ];
    const rateIndex = (buffer[offset + 2] >> 2) & 3;
    const rateDivisor = version === 0 ? 4 : mpeg1 ? 1 : 2;
    const sampleRate = [44100, 48000, 32000][rateIndex] / rateDivisor;
    if (!bitrate || !sampleRate)
      throw new Error(`Unsupported MP3 rate at byte ${offset}`);
    const padding = (buffer[offset + 2] >> 1) & 1;
    const length =
      Math.floor(((mpeg1 ? 144000 : 72000) * bitrate) / sampleRate) + padding;
    if (offset + length > end)
      throw new Error(`Truncated MP3 frame at byte ${offset}`);
    samplesByRate.set(
      sampleRate,
      (samplesByRate.get(sampleRate) ?? 0) + (mpeg1 ? 1152 : 576),
    );
    offset += length;
  }
  if (!samplesByRate.size) throw new Error("MP3 contains no audio frames");
  let seconds = 0;
  for (const [sampleRate, samples] of samplesByRate)
    seconds += samples / sampleRate;
  return seconds;
}

export function getAudioDurationInSeconds(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".wav")
    return parseWavDurationFromBuffer(readFileSync(filePath));
  if (extension === ".mp3")
    return parseMp3DurationFromBuffer(readFileSync(filePath));
  const result = spawnSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=nw=1:nk=1",
      path.resolve(filePath),
    ],
    { encoding: "utf8", windowsHide: true },
  );
  if (result.error?.code === "ENOENT")
    throw new Error(`Install ffprobe or supply MP3/WAV audio for ${filePath}`);
  const seconds = Number(result.stdout?.trim());
  if (result.status !== 0 || !Number.isFinite(seconds) || seconds <= 0) {
    throw new Error(
      `Cannot measure ${filePath}: ${result.error?.message || result.stderr?.trim() || "invalid ffprobe duration"}`,
    );
  }
  return seconds;
}
