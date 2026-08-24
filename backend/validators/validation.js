/**
 * @module validators/validation
 *
 * The §29.2 harness: aggregates express-validator chain results into
 * the §27-owned 422 shape (`details` — one entry per field, first
 * failure wins), attaches `req.validated = { body, params, query }`
 * via matchedData on success. The only place a 422 is constructed.
 */
import { validationResult, matchedData } from "express-validator";
import { HTTP_STATUS } from "../utils/httpStatus.js";

/**
 * Mounts after a rule chain: responds 422 with field details on
 * failure, else forwards with `req.validated` populated.
 * @param {Object} [options] - matchedData options (e.g. includeOptionals).
 * @returns {import("express").RequestHandler} Harness middleware.
 */
function validate(options = {}) {
  return (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      /** @type {Record<string, string>} */
      const seen = {};
      const details = [];
      result.array().forEach((entry) => {
        if (!seen[entry.path]) {
          seen[entry.path] = entry.msg;
          details.push({ field: entry.path, message: entry.msg });
        }
      });
      res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        success: false,
        message: "Check the highlighted fields",
        data: null,
        details,
      });
      return;
    }
    req.validated = {
      body: matchedData(req, { ...options, locations: ["body"] }),
      params: matchedData(req, { ...options, locations: ["params"] }),
      query: matchedData(req, { ...options, locations: ["query"] }),
    };
    next();
  };
}

export default validate;
