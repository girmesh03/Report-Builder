/**
 * @module utils/constants
 *
 * Canonical home of every non-environment literal on the client
 * (§11.1/§11.5). Entries land only when their first consumer arrives
 * — this slice's set serves the auth surfaces and the toast protocol.
 */

/** @type {string} Application display name fallback (§10.5). */
export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "Report Builder";

/**
 * Auth session statuses consumed by the guards and the network layer
 * (§41.5 enum lock).
 * @type {{INITIALIZING: string, AUTHENTICATED: string, GUEST: string}}
 */
export const AUTH_STATUSES = Object.freeze({
  INITIALIZING: "initializing",
  AUTHENTICATED: "authenticated",
  GUEST: "guest",
});

/**
 * Auto-dismiss cadence in ms; loading never auto-dismisses (§60.5).
 * @type {Object<string, number|null>}
 */
export const TOAST_AUTO_DISMISS_MS = Object.freeze({
  success: 5000,
  info: 5000,
  warning: 8000,
  error: 8000,
  loading: null,
});

/**
 * The §60.6 catalogue — single-sourced copy strings. Slice-1 rows:
 * the auth trio plus the shared offline/generic fallbacks.
 * @type {Object<string, Object<string, string>>}
 */
export const TOAST_CATALOGUE = Object.freeze({
  auth: Object.freeze({
    loggedIn: "Welcome back",
    loggedOut: "You have been logged out",
    accountCreated: "Account created — please log in",
  }),
  common: Object.freeze({
    offline: "You appear to be offline — check your connection",
    unexpectedError: "Something went wrong — please try again",
  }),
});

/** Post-login landing route when no `state.from` exists (§41.5). */
export const LOGIN_REDIRECT_ROUTE = "/dashboard";

/** Route of the sign-in page — the guard/expiry converge point (§41.5). */
export const LOGIN_ROUTE = "/login";

/** Route of the self-service registration page (§48.4). */
export const REGISTER_ROUTE = "/register";

/** Registration destination after account creation (locked decision 9). */
export const REGISTER_REDIRECT_ROUTE = "/login";

/** The app-shell entry route — bridge page until the §49 dashboard slice. */
export const DASHBOARD_ROUTE = "/dashboard";
