/**
 * @module validators/report
 *
 * The §29/§31 rule chains for the report surface. The create chain
 * validates the multipart create: `metadata` (JSON string → object),
 * `createKey` (idempotency/resume), and `clipIndexes` (JSON array
 * mapping each uploaded `clips[]` file to its original index).
 *
 * Visited-branch resolution to an ACTIVE branch of this user happens
 * in the controller (§31.2) — 422 there, not here.
 */

import { body, param, query } from "express-validator";
import {
  MULTIPART_CREATEKEY_FIELD,
  MULTIPART_METADATA_FIELD,
  MULTIPART_CLIPINDEXES_FIELD,
  CONTENT_MAX_SIZE_BYTES,
} from "../utils/constants.js";

/** The §6.5 `HH:mm` regex. */
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * The locked visits invariant contract (§31.2/§31.5): non-empty, exactly
 * one `isMain` when > 1, per-visit `HH:mm` with `in < out`, chronological.
 * @param {Array<Object>|undefined} visits - The visits array to check.
 * @returns {boolean} True when valid; throws otherwise.
 */
const validateVisits = (visits) => {
  if (!Array.isArray(visits) || visits.length < 1) {
    throw new Error("At least one visit is required");
  }
  if (visits.length > 1) {
    const mains = visits.filter((v) => v?.isMain === true).length;
    if (mains !== 1) {
      throw new Error("Exactly one visit must be the main branch");
    }
  }
  visits.forEach((visit, i) => {
    if (!HHMM.test(visit?.clockIn) || !HHMM.test(visit?.clockOut)) {
      throw new Error(`visits[${i}] clocks must be HH:mm`);
    }
    if (visit.clockIn >= visit.clockOut) {
      throw new Error(`visits[${i}] clockIn must be before clockOut`);
    }
    if (i > 0 && visits[i - 1].clockIn > visit.clockIn) {
      throw new Error("visits must be in chronological order");
    }
  });
  return true;
};

/** createKey — the atomic create's idempotency/resume key. */
const createKeyChain = [
  body(MULTIPART_CREATEKEY_FIELD)
    .isString()
    .withMessage("A create key is required")
    .isLength({ min: 8, max: 80 })
    .withMessage("Create key must be 8-80 characters"),
];

/** metadata — JSON string → object with the full visits contract. */
const metadataChain = [
  body(MULTIPART_METADATA_FIELD)
    .isString()
    .withMessage("Metadata must be a JSON string")
    .customSanitizer((value) => JSON.parse(value))
    .custom((meta) => {
      if (!Array.isArray(meta?.visits)) {
        throw new Error("At least one visit is required");
      }
      validateVisits(meta.visits);
      return true;
    }),
];

/** clipIndexes — JSON array string → array, mapping files to indices. */
const clipIndexesChain = [
  body(MULTIPART_CLIPINDEXES_FIELD)
    .isString()
    .withMessage("Clip indexes are required")
    .customSanitizer((value) => JSON.parse(value))
    .custom((value) => {
      if (!Array.isArray(value) || value.some((n) => !Number.isInteger(n))) {
        throw new Error("Clip indexes must be an array of integers");
      }
      return true;
    }),
];

/** Create: createKey + metadata + clipIndexes. */
export const createReportChain = [
  ...createKeyChain,
  ...metadataChain,
  ...clipIndexesChain,
];

/** Params: reportId (clips / meta routes). */
export const reportIdParamChain = [
  param("reportId").isMongoId().withMessage("Invalid report ID"),
];

/** Params: clipId for a nested clip route. */
export const clipIdParamChain = [
  param("clipId").isMongoId().withMessage("Invalid clip ID"),
];

/** PATCH transcription: `latest` — string, empty allowed (F1), capped. */
export const latestBodyChain = [
  body("latest")
    .isString()
    .withMessage("Latest must be a string")
    .isLength({ max: CONTENT_MAX_SIZE_BYTES })
    .withMessage("Latest is too long"),
];

/** GET /reports — list pagination + filters (§31.3). */
export const listReportsChain = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt()
    .withMessage("Limit must be between 1 and 100"),
  query("sort")
    .optional()
    .isIn(["date", "-date"])
    .withMessage("Invalid sort value"),
  query("isArchived")
    .optional()
    .isIn(["active", "archived", "all"])
    .withMessage("Invalid archive filter value"),
  query("branch").optional().isMongoId().withMessage("Invalid branch filter"),
  query("generated")
    .optional()
    .isIn(["true", "false"])
    .withMessage("Invalid generated filter"),
];

/** PATCH meta: `{ date?, visits[] }` whole block (§31.5). */
export const patchMetaChain = [
  body("date").optional().isISO8601().withMessage("Date must be a valid date"),
  body("visits")
    .optional()
    .custom((visits) => {
      validateVisits(visits);
      return true;
    }),
  body().custom((_, { req }) => {
    if (req.body.date === undefined && req.body.visits === undefined) {
      throw new Error("At least one of date or visits is required");
    }
    return true;
  }),
];

export default {
  createReportChain,
  reportIdParamChain,
  clipIdParamChain,
  latestBodyChain,
  listReportsChain,
  patchMetaChain,
};