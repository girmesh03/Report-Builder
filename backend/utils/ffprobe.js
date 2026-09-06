/**
 * @module utils/ffprobe
 *
 * The single ffprobe wrapper (§32.2): reads a media file's duration
 * in seconds. Used by the create pipeline to enforce the clip duration
 * cap (`AUDIO_MAX_DURATION_SEC`).
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { env } from "../config/env.js";

const execFileAsync = promisify(execFile);

/**
 * Returns the duration (seconds) of a media file.
 * @param {string} filePath - Absolute path of the media file.
 * @returns {Promise<number>} Duration in seconds.
 */
const getAudioDuration = async (filePath) => {
  const { stdout } = await execFileAsync(
    env.FFPROBE_PATH,
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ],
    { encoding: "utf8" },
  );
  return Number.parseFloat(stdout.trim());
};

export { getAudioDuration };