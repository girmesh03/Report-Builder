/**
 * @module middleware/clipUpload
 *
 * Multer configuration for the create-pipeline clip uploads (§32.2):
 * files land under `uploads/audio/staging/` in submission order
 * (`req.files`), MIME-membership and size cap enforced here; ffprobe
 * duration and the rest of the pipeline live in the controller/STT.
 */

import multer from "multer";
import { mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { CustomError } from "../utils/errors.js";
import {
  AUDIO_ALLOWED_MIME_TYPES,
  AUDIO_MAX_SIZE_BYTES,
  MAX_CLIPS_PER_REPORT,
  MULTIPART_CLIPS_FIELD,
  UPLOADS_AUDIO_STAGING_DIR,
} from "../utils/constants.js";

mkdirSync(UPLOADS_AUDIO_STAGING_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_AUDIO_STAGING_DIR);
  },
  filename: (_req, file, cb) => {
    cb(null, `${randomUUID()}-${file.originalname}`);
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

/** Multer config for the clip field — accepts `clips` array of files. */
export const uploadClips = multer({
  storage,
  limits: { fileSize: AUDIO_MAX_SIZE_BYTES, files: MAX_CLIPS_PER_REPORT },
  fileFilter,
}).array(MULTIPART_CLIPS_FIELD, MAX_CLIPS_PER_REPORT);

export default uploadClips;