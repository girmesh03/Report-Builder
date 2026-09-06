/**
 * @module middleware/clipUpload
 *
 * Muulter configuration for clip uploads (§32.2) — two surfaces:
 *   - `uploadClips` — create pipeline: `clips` array → staging dir
 *     (B2 atomic POST /reports); the controller moves them after commit.
 *   - `uploadClip` — post-create add: single `clip` → final
 *     `uploads/audio/`, filename `{reportId}-{timestamp}{ext}`
 *     (§32.2, no user input in the name).
 * MIME-membership and size cap enforced here; ffprobe duration and the
 * rest of the pipeline live in the controller/STT.
 */

import multer from "multer";
import { mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import { CustomError } from "../utils/errors.js";
import {
  AUDIO_ALLOWED_MIME_TYPES,
  AUDIO_MAX_SIZE_BYTES,
  MAX_CLIPS_PER_REPORT,
  MULTIPART_CLIPS_FIELD,
  MULTIPART_CLIP_FIELD,
  UPLOADS_AUDIO_DIR,
  UPLOADS_AUDIO_STAGING_DIR,
} from "../utils/constants.js";

mkdirSync(UPLOADS_AUDIO_STAGING_DIR, { recursive: true });
mkdirSync(UPLOADS_AUDIO_DIR, { recursive: true });

const stagingStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_AUDIO_STAGING_DIR),
  filename: (_req, file, cb) => cb(null, `${randomUUID()}-${file.originalname}`),
});

const finalStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_AUDIO_DIR),
  filename: (req, file, cb) => {
    // §32.2: `{reportId}-{timestamp}` + sanitized extension — never user
    // input in the base name.
    const reportId = req.params?.reportId ?? "unknown";
    const safeExt = /^\.(mpeg|wav|mp4|webm)$/.test(extname(file.originalname).toLowerCase())
      ? extname(file.originalname).toLowerCase()
      : "";
    cb(null, `${reportId}-${Date.now()}${safeExt}`);
  },
});

/**
 * Accepts only allow-listed audio MIME types (video rejected — §32.2).
 * @param {import("multer").Express.Multer.File} file - The uploaded file.
 * @param {import("multer").diskStorage} _files - Full upload batch.
 */
const fileFilter = (_req, file, cb) => {
  if (AUDIO_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new CustomError("UNPROCESSABLE_ENTITY", "Only audio files are allowed"));
  }
};

/** Create-pipeline: accepts `clips` array → staging (B2). */
export const uploadClips = multer({
  storage: stagingStorage,
  limits: { fileSize: AUDIO_MAX_SIZE_BYTES, files: MAX_CLIPS_PER_REPORT },
  fileFilter,
}).array(MULTIPART_CLIPS_FIELD, MAX_CLIPS_PER_REPORT);

/** Post-create: single `clip` → final uploads/audio/ (B3). */
export const uploadClip = multer({
  storage: finalStorage,
  limits: { fileSize: AUDIO_MAX_SIZE_BYTES },
  fileFilter,
}).single(MULTIPART_CLIP_FIELD);

export default uploadClips;