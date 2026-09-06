/**
 * @module services/stt
 *
 * The §33 STT pipeline service — Addis-only, Path A (ADR-001):
 * ffmpeg preparation (mono 16 kHz 16-bit PCM), silence-boundary
 * chunking (`wavSplitter`), one `addis.speech.transcribe` per chunk,
 * and a deterministic single-space merge. Per-clip all-or-nothing
 * (a failed chunk fails the clip). Provider errors are mapped to
 * semantic statuses: 402 (insufficient credits) and 429 (rate) are
 * surfaced distinctly (§16.5). No prompts, no fallback providers.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import AddisAI, {
  fileFromPath,
  InsufficientCreditsError,
  RateLimitError,
  APIConnectionError,
  APIConnectionTimeoutError,
  APIError,
} from "addisai";
import { env } from "../config/env.js";
import logger from "../utils/logger.js";
import { CustomError } from "../utils/errors.js";
import {
  ADDIS_AI_STT_MAX_DURATION_SEC,
  STT_PCM_SAMPLE_RATE,
  STT_PCM_CHANNELS,
  STT_PCM_BITS_PER_SAMPLE,
} from "../utils/constants.js";
import { splitSilenceChunks } from "../utils/wavSplitter.js";

const execFileAsync = promisify(execFile);

/** The single Addis SDK client (§33.4) — server-side only (§10.3). */
const addis = new AddisAI({
  apiKey: env.ADDIS_API_KEY,
  baseURL: env.ADDIS_AI_BASE_URL || undefined,
  timeout: Number(env.AI_TIMEOUT_MS),
  maxRetries: 2,
});

/**
 * Maps an Addis/transport error to the §27.5 semantic statuses.
 * @param {unknown} error - The thrown value from the SDK call.
 * @returns {CustomError} Mapped application error (402 / 429 / 502).
 */
const mapSttError = (error) => {
  if (error instanceof InsufficientCreditsError) {
    return new CustomError(
      "PAYMENT_REQUIRED",
      "Transcription failed — insufficient credits",
    );
  }
  if (error instanceof RateLimitError) {
    return new CustomError(
      "TOO_MANY_REQUESTS",
      "Transcription is busy — please retry shortly",
    );
  }
  if (
    error instanceof APIConnectionError ||
    error instanceof APIConnectionTimeoutError
  ) {
    return new CustomError(
      "BAD_GATEWAY",
      "Transcription failed — please retry",
    );
  }
  if (error instanceof APIError) {
    return new CustomError(
      "BAD_GATEWAY",
      "Transcription failed — please retry",
    );
  }
  throw error;
};

/**
 * Prepares one file into mono 16 kHz 16-bit PCM via ffmpeg.
 * @param {string} inputPath - Path of the uploaded clip.
 * @returns {Promise<Buffer>} Raw PCM bytes.
 */
const toPcm = async (inputPath) => {
  try {
    const { stdout } = await execFileAsync(
      env.FFMPEG_PATH,
      [
        "-i", inputPath,
        "-ac", String(STT_PCM_CHANNELS),
        "-ar", String(STT_PCM_SAMPLE_RATE),
        "-sample_fmt", "s16",
        "-f", "s16le",
        "-",
      ],
      { encoding: null, maxBuffer: 1024 * 1024 * 80 },
    );
    return Buffer.from(stdout);
  } catch {
    throw new CustomError(
      "UNPROCESSABLE_ENTITY",
      "The audio file could not be processed",
    );
  }
};

/**
 * Transcribes one clip: prep → silence chunks → per-chunk Addis call →
 * merged text. Per-clip all-or-nothing — any chunk failure fails the
 * clip (a provider error throws; nothing partial is returned).
 * @param {string} inputPath - Path of the uploaded clip.
 * @returns {Promise<string>} The merged (possibly empty) text.
 */
const transcribeClip = async (inputPath) => {
  const language = env.ADDIS_AI_STT_LANGUAGE_CODE || "am";
  const pcm = await toPcm(inputPath);
  // `toPcm` already guarantees mono 16-bit PCM; chunk + transcribe.
  const chunks = splitSilenceChunks(pcm, STT_PCM_SAMPLE_RATE);

  if (chunks.length === 0) {
    return "";
  }

  const workdir = await mkdtemp(join(tmpdir(), "stt-"));
  const texts = [];
  try {
    for (const chunk of chunks) {
      const chunkPath = join(workdir, `${randomUUID()}.wav`);
      writeFileSync(chunkPath, chunk.buffer);
      try {
        const result = await addis.speech.transcribe({
          audio: await fileFromPath(chunkPath, "audio/wav"),
          language,
        });
        texts.push(result.text ?? "");
      } catch (error) {
        throw mapSttError(error);
      }
    }
  } finally {
    await rm(workdir, { recursive: true, force: true });
  }
  return texts.join(" ");
};

/** Diagnostic for the G-STT gate — returns the merged text (never logged). */
const stt = { transcribeClip };

export { transcribeClip, toPcm, splitSilenceChunks, STT_PCM_SAMPLE_RATE };

export default stt;