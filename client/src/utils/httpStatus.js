/**
 * @module utils/httpStatus
 *
 * Client mirror of the semantic HTTP status names (§11.6): consumed
 * by the network layer for status-keyed decisions (the §42.3 401
 * rule) without numeric literals at call sites.
 */

/**
 * The §11.6 mapping, frozen — identical values to the backend map.
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
