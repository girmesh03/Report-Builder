/**
 * @module utils/constants
 *
 * Canonical home of every non-environment literal (§11.1). Groups are
 * added here only when their first consumer lands — never
 * speculatively (KNOWN OR AMENDED ONLY, owner directive 2026-08-24).
 */

/**
 * Deep-freezes a value so nested objects and arrays are immutable too
 * (§11.2).
 * @template T
 * @param {T} value - Value to freeze.
 * @returns {T} The same value, deeply frozen.
 */
const deepFreeze = (value) => {
  if (value !== null && typeof value === "object") {
    Object.values(value).forEach(deepFreeze);
  }
  return Object.freeze(value);
};

/** @type {string} The single versioned API mount point (§26.5). */
export const API_MOUNT_PATH = deepFreeze("/api/v1");

/** @type {number} Milliseconds in one minute — unit conversion helper. */
export const MS_PER_MINUTE = deepFreeze(60000);

/** @type {number} bcrypt cost for password hashing (§11.3). */
export const BCRYPT_SALT_ROUNDS = deepFreeze(12);

/** @type {number} Access-token lifetime in minutes (§11.3). */
export const ACCESS_TOKEN_TTL_MIN = deepFreeze(15);

/** @type {number} Refresh-token lifetime in days (§11.3). */
export const REFRESH_TOKEN_TTL_DAYS = deepFreeze(7);

/** @type {number} Milliseconds in one day — unit conversion helper. */
export const MS_PER_DAY = deepFreeze(86400000);

/** @type {number} Access-token cookie/JWT lifetime in ms (derived §11.3). */
export const ACCESS_TOKEN_TTL_MS = deepFreeze(ACCESS_TOKEN_TTL_MIN * MS_PER_MINUTE);

/** @type {number} Refresh-token cookie/JWT lifetime in ms (derived §11.3). */
export const REFRESH_TOKEN_TTL_MS = deepFreeze(REFRESH_TOKEN_TTL_DAYS * MS_PER_DAY);

/** @type {number} MongoDB server-selection timeout in ms (§11.3). */
export const MONGO_CONNECT_TIMEOUT_MS = deepFreeze(10000);

/** @type {number} Boot retry backoff start in ms (§11.3, D53). */
export const DB_RETRY_INITIAL_MS = deepFreeze(1000);

/** @type {number} Boot retry backoff ceiling in ms (§11.3, D53). */
export const DB_RETRY_MAX_MS = deepFreeze(30000);

/** @type {number} Consecutive boot retries before fail-fast exit (§11.3, D53). */
export const DB_RETRY_MAX_ATTEMPTS = deepFreeze(10);

/** @type {number} Rotating log-file retention in days (§11.3). */
export const LOG_RETENTION_DAYS = deepFreeze(30);

/** @type {number} Graceful-shutdown forced-exit timeout in ms (§26.6). */
export const SHUTDOWN_FORCE_TIMEOUT_MS = deepFreeze(10000);

/** @type {number} MongoDB duplicate-key E11000 code (§11.3). */
export const MONGO_DUPLICATE_KEY_ERROR_CODE = deepFreeze(11000);

/** Rate-limit tiers — windows in minutes, maxes in requests (§11.3, §27.3). */
export const RATE_LIMIT_GLOBAL_WINDOW_MIN = deepFreeze(15);
export const RATE_LIMIT_GLOBAL_MAX = deepFreeze(100);
export const RATE_LIMIT_AUTH_WINDOW_MIN = deepFreeze(15);
export const RATE_LIMIT_AUTH_MAX = deepFreeze(20);
export const RATE_LIMIT_AI_WINDOW_MIN = deepFreeze(1);
export const RATE_LIMIT_AI_MAX = deepFreeze(10);

/** Pagination defaults (§11.3, §30). */
export const PAGINATION_DEFAULT_PAGE = deepFreeze(1);
export const PAGINATION_DEFAULT_LIMIT = deepFreeze(10);
export const PAGINATION_MAX_LIMIT = deepFreeze(100);

/** Branch field limits (§11.3, §20.2). */
export const BRANCH_NAME_MAX_LENGTH = deepFreeze(100);
export const BRANCH_LOCATION_MAX_LENGTH = deepFreeze(200);

/** Report field limits & content caps (§11.4, §21.2). */
export const CONTENT_MAX_SIZE_BYTES = deepFreeze(1048576);
export const ARCHIVED_TTL_SECONDS = deepFreeze(2592000);

/** Audio clip caps (§11.3, §32). */
export const AUDIO_ALLOWED_MIME_TYPES = deepFreeze([
  "audio/mpeg",
  "audio/wav",
  "audio/mp4",
  "audio/webm",
]);
export const AUDIO_MAX_SIZE_BYTES = deepFreeze(52428800);
export const AUDIO_MAX_DURATION_SEC = deepFreeze(900);
export const AUDIO_MAX_TOTAL_DURATION_SEC = deepFreeze(3600);

/** Max clips per report (create dialog + edit tab) (§21.2, §32). */
export const MAX_CLIPS_PER_REPORT = deepFreeze(10);

/** Multipart field names (§31.2, §32.2). */
export const MULTIPART_METADATA_FIELD = deepFreeze("metadata");
export const MULTIPART_CLIPS_FIELD = deepFreeze("clips");
export const MULTIPART_CREATEKEY_FIELD = deepFreeze("createKey");
export const MULTIPART_CLIPINDEXES_FIELD = deepFreeze("clipIndexes");
export const MULTIPART_CLIP_FIELD = deepFreeze("clip");

/** STT pipeline (§33). */
export const ADDIS_AI_STT_MAX_DURATION_SEC = deepFreeze(60);
export const STT_PCM_SAMPLE_RATE = deepFreeze(16000);
export const STT_PCM_CHANNELS = deepFreeze(1);
export const STT_PCM_BITS_PER_SAMPLE = deepFreeze(16);

/** Transient create-attempt session (§31.2, §62). */
export const ATTEMPT_SESSION_TTL_MS = deepFreeze(3600000);

/** Audio storage paths (§12.9, §32.5, §62) — local disk, gitignored. */
export const UPLOADS_AUDIO_DIR = deepFreeze("uploads/audio");
export const UPLOADS_AUDIO_STAGING_DIR = deepFreeze("uploads/audio/staging");

/** Item vocabulary ((§11.4, §24A). */
export const ITEM_TYPES = deepFreeze(["activity", "issue", "comment"]);
export const ITEM_STATUSES = deepFreeze(["reported", "in_progress", "completed"]);
export const ITEM_STATUSES_BY_TYPE = deepFreeze({
  activity: ["completed", "in_progress"],
  issue: ["reported", "in_progress", "completed"],
  comment: [],
});

/** Pagination row-per-page options for MuiDataGrid and MuiPagination (§11.3, §46.7). */
export const ROWS_PER_PAGE_OPTIONS = deepFreeze([10, 25, 50, 100]);

export { deepFreeze };
