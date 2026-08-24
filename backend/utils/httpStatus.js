/**
 * @module utils/httpStatus
 *
 * Semantic names for every HTTP status the app emits (§11.6). Numeric
 * literals are banned at call sites — consumers use these names only.
 */

/**
 * The §11.6 mapping, frozen.
 * @type {Object<string, number>}
 */
export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  PARTIAL_CONTENT: 206,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  REQUESTED_RANGE_NOT_SATISFIABLE: 416,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
});
