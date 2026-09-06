/**
 * @module models/report
 *
 * The Report model (§21, consolidated 2026-09-01): the daily
 * supervision report of the single actor. Single collection with
 * embedded `audios[]` (AudioClip subdocs) and embedded
 * `transcription{raw, latest, ready}`. There is **no separate Audio or
 * Transcription collection** (§17.2) and **no `status` field** — the
 * report's state is derived (BR-06, §17.6). The report body lives in
 * the `generated` string field (§6 format), written on chat accept.
 */

import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import {
  ARCHIVED_TTL_SECONDS,
  AUDIO_ALLOWED_MIME_TYPES,
  AUDIO_MAX_DURATION_SEC,
  AUDIO_MAX_SIZE_BYTES,
} from "../utils/constants.js";

const { Schema } = mongoose;

const reportSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: null,
    },
    visits: {
      type: [
        {
          branch: {
            type: Schema.Types.ObjectId,
            ref: "Branch",
            required: true,
          },
          clockIn: {
            type: String,
            required: true,
          },
          clockOut: {
            type: String,
            required: true,
          },
          isMain: {
            type: Boolean,
            required: true,
          },
        },
      ],
      default: undefined,
    },
    audios: {
      type: [
        {
          mimeType: {
            type: String,
            enum: AUDIO_ALLOWED_MIME_TYPES,
            required: true,
          },
          sizeBytes: {
            type: Number,
            min: 0,
            max: AUDIO_MAX_SIZE_BYTES,
            required: true,
          },
          durationSec: {
            type: Number,
            min: 0,
            max: AUDIO_MAX_DURATION_SEC,
            required: true,
          },
          filePath: {
            type: String,
            required: true,
          },
          createdAt: {
            type: Date,
            required: true,
          },
        },
      ],
      default: [],
    },
    transcription: {
      type: new Schema(
        {
          raw: {
            type: String,
            default: null,
          },
          latest: {
            type: String,
            default: null,
          },
          ready: {
            type: Boolean,
            default: true,
          },
        },
        { _id: false },
      ),
      default: () => ({}),
    },
    generated: {
      type: String,
      default: "",
    },
    isArchived: {
      type: Boolean,
      required: true,
      default: false,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
  },
);

/** Owner-scoped list index (§21.3, §50). */
reportSchema.index({ user: 1, isArchived: 1, date: -1, createdAt: -1 });

/** Branch/visits multikey index — main-branch filter (Q1), visited-branch, cascade ref-check (§21.3). */
reportSchema.index({ user: 1, "visits.branch": 1 });

/** Date rollup + range-filter index (§21.3, §38/§49). */
reportSchema.index({ user: 1, date: 1 });

/** TTL safety net on the retention anchor (§21.3, §62). */
reportSchema.index(
  { archivedAt: 1 },
  { expireAfterSeconds: ARCHIVED_TTL_SECONDS },
);

/** Server-side pagination for the list endpoint (§27.6) — registered
 *  per-schema so `Report.paginate` exists (C23, 2026-08-31). */
reportSchema.plugin(mongoosePaginate);

/**
 * The Report model — every report lookup in the app runs through it.
 * @type {mongoose.Model}
 */
const Report = mongoose.model("Report", reportSchema);

export default Report;