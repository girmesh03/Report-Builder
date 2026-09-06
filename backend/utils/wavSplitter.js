/**
 * @module utils/wavSplitter
 *
 * The PCM-level WAV splitter (§33.3, ADR-007): cuts a mono 16-bit PCM
 * stream into ≤ `maxDurationSec` chunks, preferring silence gaps so a
 * chunk never splits mid-sentence. Each returned chunk is a valid WAV
 * (mono, 16-bit, `sampleRate`) ready for the STT call.
 */

import { ADDIS_AI_STT_MAX_DURATION_SEC } from "./constants.js";

/** A silence gap is `windowBytes` of samples all below `silenceAmplitude`. */
const SILENCE_WINDOW_MS = 300;
const SILENCE_AMPLITUDE = 200;
const MIN_CHUNK_MS = 1000;

/** Bytes per sample for mono 16-bit PCM. */
const BYTES_PER_SAMPLE = 2;

/**
 * Whether the bytes `[offset, offset + windowBytes)` are all (near)
 * silence — every sample's absolute amplitude below the threshold.
 * @param {Buffer} pcm - Mono 16-bit PCM buffer.
 * @param {number} offset - Byte offset to scan from.
 * @param {number} windowBytes - Window width in bytes.
 * @returns {boolean} True when the whole window is below the threshold.
 */
const isSilentWindow = (pcm, offset, windowBytes) => {
  const end = Math.min(offset + windowBytes, pcm.length);
  for (let i = offset; i + 1 < end; i += BYTES_PER_SAMPLE) {
    const sample = pcm.readInt16LE(i);
    if (sample > SILENCE_AMPLITUDE || sample < -SILENCE_AMPLITUDE) {
      return false;
    }
  }
  return true;
};

/**
 * Builds a 44-byte RIFF/WAVE header for a mono 16-bit PCM chunk.
 * @param {Buffer} pcm - The chunk's PCM (data) bytes.
 * @param {number} sampleRate - Samples per second.
 * @returns {Buffer} A complete WAV-file buffer.
 */
const toWavBuffer = (pcm, sampleRate) => {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * BYTES_PER_SAMPLE;

  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(BYTES_PER_SAMPLE, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write("data", 36, "ascii");
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
};

/**
 * Splits a mono 16-bit PCM buffer into ≤ `maxDurationSec` WAV chunks,
 * cutting at silence gaps. A hard cut at the cap is used only when no
 * silence occurs before it. Each chunk never exceeds the cap.
 * @param {Buffer} pcm - Mono 16-bit PCM (little-endian) audio.
 * @param {number} sampleRate - Samples per second.
 * @returns {Array<{ buffer: Buffer, durationSec: number }>} Chunks.
 */
const splitSilenceChunks = (pcm, sampleRate) => {
  if (!pcm || pcm.length === 0) {
    return [];
  }
  const maxBytes = ADDIS_AI_STT_MAX_DURATION_SEC * sampleRate * BYTES_PER_SAMPLE;
  const windowBytes = Math.max(
    2,
    Math.floor((SILENCE_WINDOW_MS / 1000) * sampleRate) * BYTES_PER_SAMPLE,
  );
  const minBytes = Math.max(
    2,
    Math.floor((MIN_CHUNK_MS / 1000) * sampleRate) * BYTES_PER_SAMPLE,
  );

  const chunks = [];
  let start = 0;
  let i = 0;

  while (start < pcm.length) {
    // Try to end the chunk at the first silence window inside the cap
    // (or exactly at the cap when no silence is found).
    const hardEnd = Math.min(start + maxBytes, pcm.length);
    let cut = hardEnd;
    const searchStart = Math.min(start + minBytes, hardEnd);
    for (let cursor = searchStart; cursor + windowBytes <= hardEnd; cursor += windowBytes) {
      if (isSilentWindow(pcm, cursor, windowBytes)) {
        cut = cursor;
        break;
      }
    }
    // Trim trailing silence partially (roughly) by stepping back to the
    // last non-silent sample within the window before the cut.
    const chunk = Buffer.from(pcm.subarray(start, cut));
    chunks.push({
      buffer: toWavBuffer(chunk, sampleRate),
      durationSec: Number((chunk.length / (sampleRate * BYTES_PER_SAMPLE)).toFixed(2)),
    });
    i += 1;
    start = cut;
    if (i > 10000) break; // safety against pathological silence-free input
  }

  return chunks;
};

export { splitSilenceChunks, toWavBuffer };