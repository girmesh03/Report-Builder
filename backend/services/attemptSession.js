/**
 * @module services/attemptSession
 *
 * The filesystem-backed create-attempt session (option A, owner 2026-09-01):
 * per-clip progress of an atomic report-creation lives in
 * `uploads/audio/staging/<createKey>/state.json` next to the staged clip
 * files — no Mongo collection, no model (§17.2 stays at five entities).
 * A resubmit of the same `createKey` skips clips already
 * `uploaded && transcribed` (reusing their text) and tolerates
 * committed replay via `committedReportId`. The staging dir shares the
 * TTL/sweeper lifecycle (§62); the session file is created on first
 * submit and removed on clean commit.
 */

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { UPLOADS_AUDIO_STAGING_DIR } from "../utils/constants.js";

/** Default session (first submit). */
const EMPTY_SESSION = { status: "in_progress", committedReportId: null, clips: [] };

/**
 * The staging directory for one attempt (user-scoped, BR-13).
 * @param {string} userId - The owner (`_id` string).
 * @param {string} createKey - The client key (safe hex/uuid).
 * @returns {string} Absolute-ish staging dir under uploads/audio/staging/.
 */
const attemptDir = (userId, createKey) =>
  join(UPLOADS_AUDIO_STAGING_DIR, userId, createKey);

/**
 * The session-state file inside the attempt dir.
 * @param {string} userId - The owner (`_id` string).
 * @param {string} createKey - The client key.
 * @returns {string} Path of `state.json`.
 */
const statePath = (userId, createKey) =>
  join(attemptDir(userId, createKey), "state.json");

/**
 * Loads the attempt session (file) or returns the default on first use.
 * @param {string} userId - The owner (`_id` string).
 * @param {string} createKey - The client key.
 * @returns {Promise<Object>} `{ status, committedReportId, clips }`.
 */
const loadAttempt = async (userId, createKey) => {
  try {
    const raw = await readFile(statePath(userId, createKey), "utf8");
    return JSON.parse(raw);
  } catch {
    return { ...EMPTY_SESSION, clips: [] };
  }
};

/**
 * Persists the attempt session state to disk.
 * @param {string} userId - The owner (`_id` string).
 * @param {string} createKey - The client key.
 * @param {Object} session - The session object to write.
 * @returns {Promise<void>}
 */
const saveAttempt = async (userId, createKey, session) => {
  await mkdir(attemptDir(userId, createKey), { recursive: true });
  await writeFile(statePath(userId, createKey), JSON.stringify(session), "utf8");
};

/**
 * Removes the whole attempt dir (staged clips + state) after a clean
 * commit or at abort.
 * @param {string} userId - The owner (`_id` string).
 * @param {string} createKey - The client key.
 * @returns {Promise<void>}
 */
const clearAttempt = async (userId, createKey) => {
  await rm(attemptDir(userId, createKey), { recursive: true, force: true });
};

export { loadAttempt, saveAttempt, clearAttempt, attemptDir, statePath };