/**
 * @module redux/features/apiSlice
 *
 * The single owner of HTTP on the client (§42): one `createApi`
 * descriptor over fetchBaseQuery with `credentials: 'include'`, the
 * §42.3 reauth chain (single-flight refresh, retry-once, silent
 * expiry), and the §42.4 envelope unwrap + error normalization.
 * Domain endpoint sets inject themselves here — never elsewhere.
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AUTH_SESSION_EXPIRED, authActions, selectAuthStatus } from "./authSlice.js";
import { AUTH_STATUSES, TOAST_CATALOGUE } from "../../utils/constants.js";
import { HTTP_STATUS } from "../../utils/httpStatus.js";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? "/api/v1",
  credentials: "include",
});

/**
 * In-flight refresh single-flight marker — several concurrent 401s
 * share one refresh call (§42.3 concurrency rule).
 * @type {Promise<{data?: unknown, error?: unknown}>|null}
 */
let refreshPromise = null;

/**
 * Ends an authenticated session whose credentials just died: clears
 * the slice so the guard navigates; guests fail through silently.
 * @param {import("@reduxjs/toolkit/query").ApiInternal} api - RTK api
 *   handle carrying dispatch/getState.
 * @returns {void}
 */
const expireSession = (api) => {
  if (selectAuthStatus(api.getState()) === AUTH_STATUSES.AUTHENTICATED) {
    api.dispatch({ type: AUTH_SESSION_EXPIRED });
  }
};

/**
 * Unwraps the §27.4 envelope on success: `{ success, message, data }`
 * → `data`.  Detects the auth `data.user` shape and returns the
 * UserDto directly so every consumer gets a flat object.
 * @param {unknown} envelope - The raw `result.data` from fetchBaseQuery.
 * @returns {unknown} The inner `data` value.
 */
const unwrapEnvelope = (envelope) => {
  if (envelope && typeof envelope === "object" && "data" in envelope) {
    const inner = envelope.data;
    if (inner && typeof inner === "object" && "user" in inner) {
      return inner.user;
    }
    return inner;
  }
  return envelope;
};

/**
 * Normalizes a raw error into the §42.4 consumer shape: plain
 * end-user language, field-level details for 422s, FETCH_ERROR
 * mapping.  Success path is NOT handled here — use `unwrapEnvelope`.
 * @param {{status: number|string, data?: unknown}} raw - The error
 *   object from fetchBaseQuery.
 * @returns {{status: number|string, message: string,
 *   fieldErrors?: Object<string,string>}} Normalized error.
 */
const normalizeError = (raw) => {
  const payload =
    raw.data && typeof raw.data === "object" ? raw.data : undefined;
  let message = TOAST_CATALOGUE.common.unexpectedError;
  if (raw.status === "FETCH_ERROR") {
    message = TOAST_CATALOGUE.common.serverUnreachable;
  } else if (payload?.message) {
    message = payload.message;
  }
  /** @type {Object<string, string>|undefined} */
  let fieldErrors;
  if (
    raw.status === HTTP_STATUS.UNPROCESSABLE_ENTITY &&
    Array.isArray(payload?.details)
  ) {
    fieldErrors = Object.fromEntries(
      payload.details.map((entry) => [entry.field, entry.message]),
    );
  }
  return {
    status: raw.status,
    message,
    ...(fieldErrors ? { fieldErrors } : {}),
  };
};

/**
 * The §42.3 reauth chain wrapped around the base query.
 * On success: returns `{ data }` with the unwrapped envelope.
 * On error: returns `{ error }` with the normalized error shape.
 * On refresh success: dispatches `authenticated` with the fresh UserDto.
 * @param {string|Object} args - Request args (url + method + body).
 * @param {import("@reduxjs/toolkit/query").ApiInternal} api - Api handle.
 * @param {Object} extraOptions - Carries `skipReauth` markers.
 * @returns {Promise<{data?: unknown, error?: unknown}>} Normalized result.
 */
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (
    result.error?.status === HTTP_STATUS.UNAUTHORIZED &&
    !extraOptions?.skipReauth
  ) {
    if (!refreshPromise) {
      refreshPromise = baseQuery(
        { url: "/auth/refresh", method: "POST" },
        api,
        { skipReauth: true },
      ).finally(() => {
        refreshPromise = null;
      });
    }
    const refreshResult = await refreshPromise;
    if (refreshResult.data) {
      const freshUser = unwrapEnvelope(refreshResult.data);
      api.dispatch(authActions.authenticated(freshUser));
      result = await baseQuery(args, api, {
        ...extraOptions,
        skipReauth: true,
      });
      if (result.error?.status === HTTP_STATUS.UNAUTHORIZED) {
        expireSession(api);
      }
    } else {
      expireSession(api);
      return { error: normalizeError(refreshResult.error) };
    }
  }

  if (result.error) {
    return { error: normalizeError(result.error) };
  }
  return { data: unwrapEnvelope(result.data) };
};

/**
 * The one API descriptor of the application (§41.6). Tag families
 * grow per domain as their slices land; `Me` serves the auth surface.
 */
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: () => ({}),
});
