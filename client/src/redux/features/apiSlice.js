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
import { AUTH_SESSION_EXPIRED, selectAuthStatus } from "./authSlice.js";
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
function expireSession(api) {
  if (selectAuthStatus(api.getState()) === AUTH_STATUSES.AUTHENTICATED) {
    api.dispatch({ type: AUTH_SESSION_EXPIRED });
  }
}

/**
 * Normalizes a raw result into page-ready shape (§42.4): success
 * unwraps the `{ success, message, data }` envelope to `data`;
 * errors become `{ status, message, fieldErrors }` with plain
 * end-user language; 401s stay silent for the pages (expiry is the
 * chain's job).
 * @param {{data?: unknown, error?: unknown}} result - Raw result.
 * @returns {{data?: unknown, error?: {status: number|string,
 *   message: string, fieldErrors?: Object<string,string>}}} Normalized.
 */
function normalizeResult(result) {
  if (!result.error) {
    const envelope = result.data;
    return {
      data:
        envelope && typeof envelope === "object" && "data" in envelope
          ? envelope.data
          : envelope,
    };
  }
  const raw = result.error;
  const payload =
    raw.data && typeof raw.data === "object" ? raw.data : undefined;
  let message = TOAST_CATALOGUE.common.unexpectedError;
  if (raw.status === "FETCH_ERROR") {
    message = TOAST_CATALOGUE.common.offline;
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
    error: { status: raw.status, message, ...(fieldErrors ? { fieldErrors } : {}) },
  };
}

/**
 * The §42.3 reauth chain wrapped around the base query.
 * @param {string|Object} args - Request args (url + method + body).
 * @param {import("@reduxjs/toolkit/query").ApiInternal} api - Api handle.
 * @param {Object} extraOptions - Carries `skipReauth` markers.
 * @returns {Promise<{data?: unknown, error?: unknown}>} Normalized result.
 */
async function baseQueryWithReauth(args, api, extraOptions) {
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
      result = await baseQuery(args, api, {
        ...extraOptions,
        skipReauth: true,
      });
      if (result.error?.status === HTTP_STATUS.UNAUTHORIZED) {
        expireSession(api);
      }
    } else {
      expireSession(api);
      return normalizeResult(refreshResult);
    }
  }

  return normalizeResult(result);
}

/**
 * The one API descriptor of the application (§41.6). Tag families
 * grow per domain as their slices land; `Me` serves the auth surface.
 */
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Me"],
  endpoints: () => ({}),
});
