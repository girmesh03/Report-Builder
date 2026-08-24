/**
 * @module utils/errors
 *
 * `CustomError` — the app's error type carrying a semantic status
 * name resolved through `httpStatus` (§11.6, §27.5) — and
 * `toErrorEnvelope`, the single mapper the global handler uses to
 * turn any thrown error into the §27.4 error envelope.
 */
import mongoose from "mongoose";
import multer from "multer";
import { HTTP_STATUS } from "./httpStatus.js";
import { MONGO_DUPLICATE_KEY_ERROR_CODE } from "./constants.js";

/**
 * Application error with a user-facing message and a semantic status.
 * @param {string} statusName - Key of `HTTP_STATUS` (e.g. `NOT_FOUND`);
 *   unknown names throw so typos fail at construction, never in prod.
 * @param {string} message - Plain end-user language (§12.5).
 * @param {Array<{field: string, message: string}>} [details] -
 *   Validation field errors only (§27.5).
 */
class CustomError extends Error {
  constructor(statusName, message, details = undefined) {
    const statusCode = HTTP_STATUS[statusName];
    if (statusCode === undefined) {
      throw new Error(`Unknown status name: ${statusName}`);
    }
    super(message);
    this.name = "CustomError";
    this.statusCode = statusCode;
    this.status = statusName;
    this.details = details;
  }
}

/**
 * Flattens a Mongoose ValidationError into the §29.2 details shape —
 * one entry per field, first failure wins per field.
 * @param {mongoose.Error.ValidationError} error - The validation error.
 * @returns {Array<{field: string, message: string}>} Field errors.
 */
function validationDetails(error) {
  /** @type {Object<string, string>} */
  const seen = {};
  Object.values(error.errors).forEach((entry) => {
    if (!seen[entry.path]) {
      seen[entry.path] = entry.message;
    }
  });
  return Object.entries(seen).map(([field, message]) => ({
    field,
    message,
  }));
}

/**
 * Maps any error to `{ statusCode, body }` for the global handler
 * (§27.5). Unknown statuses fall back to a generic 500 phrase; the
 * caller decides stack rendering (development only).
 * @param {unknown} err - The thrown value.
 * @returns {{statusCode: number, body: {success: false, message: string,
 *   data: null, details?: Array<{field: string, message: string}>}}}
 *   Status code plus the envelope body.
 */
function toErrorEnvelope(err) {
  let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong — please try again";
  /** @type {Array<{field: string, message: string}>|undefined} */
  let details;

  if (err instanceof CustomError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    message = "Check the highlighted fields";
    details = validationDetails(err);
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    message = "Invalid identifier";
  } else if (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    err.type === "entity.parse.failed"
  ) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = "Malformed request body";
  } else if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    err.code === MONGO_DUPLICATE_KEY_ERROR_CODE
  ) {
    statusCode = HTTP_STATUS.CONFLICT;
    message = "An account with this email already exists";
  } else if (err instanceof multer.MulterError) {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large"
        : "File upload failed";
  }

  const body = { success: false, message, data: null };
  if (details !== undefined && details.length > 0) {
    body.details = details;
  }
  return { statusCode, body };
}

export { CustomError, toErrorEnvelope };
