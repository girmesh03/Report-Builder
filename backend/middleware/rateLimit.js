/**
 * @module middleware/rateLimit
 *
 * The §27.3 rate-limit tiers built from §11.3 constants — never
 * inline values. Every endpoint belongs to exactly one tier; the
 * health path is exempt from the global limiter here, and auth paths
 * are excluded from it because they carry their own tier. Violations
 * answer 429 through the standard error envelope (ADR-016).
 */
import { rateLimit } from "express-rate-limit";
import { HTTP_STATUS } from "../utils/httpStatus.js";
import {
  RATE_LIMIT_GLOBAL_WINDOW_MIN,
  RATE_LIMIT_GLOBAL_MAX,
  RATE_LIMIT_AUTH_WINDOW_MIN,
  RATE_LIMIT_AUTH_MAX,
  MS_PER_MINUTE,
  API_MOUNT_PATH,
} from "../utils/constants.js";

/** Mount point whose handler answers health probes (§26.6). */
const HEALTH_PATH = `${API_MOUNT_PATH}/health`;
/** Prefix carried by every auth-tier endpoint (§27.3). */
const AUTH_PREFIX = `${API_MOUNT_PATH}/auth`;

/**
 * Builds one tier limiter answering with the error envelope.
 * @param {number} windowMin - Window length in minutes.
 * @param {number} max - Maximum requests per window.
 * @returns {import("express-rate-limit").RateLimitRequestHandler} Tier limiter.
 */
function buildTier(windowMin, max) {
  return rateLimit({
    windowMs: windowMin * MS_PER_MINUTE,
    limit: max,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        message: "Too many requests — slow down and try again shortly",
        data: null,
      });
    },
  });
}

/** The auth-tier limiter — applied to the whole /auth router (§28). */
export const authLimiter = buildTier(RATE_LIMIT_AUTH_WINDOW_MIN, RATE_LIMIT_AUTH_MAX);

/**
 * The global tier — every non-auth, non-health endpoint (§27.3).
 * @type {import("express-rate-limit").RateLimitRequestHandler}
 */
export const globalLimiter = Object.assign(
  buildTier(RATE_LIMIT_GLOBAL_WINDOW_MIN, RATE_LIMIT_GLOBAL_MAX),
  {
    skip: (req) => req.path === HEALTH_PATH || req.path.startsWith(AUTH_PREFIX),
  },
);
