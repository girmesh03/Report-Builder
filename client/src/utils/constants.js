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
 * the auth trio plus the shared unreachable/generic fallbacks.
 * @type {Object<string, Object<string, string>>}
 */
export const TOAST_CATALOGUE = Object.freeze({
  auth: Object.freeze({
    loggedIn: "Welcome back",
    loggedOut: "You have been logged out",
    accountCreated: "Account created — please log in",
  }),
  common: Object.freeze({
    serverUnreachable:
      "Cannot reach the server — please try again in a moment",
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

/** Public landing route (§41.5). */
export const LANDING_ROUTE = "/";

/** Profile page route (§57). */
export const PROFILE_ROUTE = "/profile";

/**
 * Responsive app-bar/sidebar-header min heights in px (owner directive
 * 2026-08-26): xs=48, sm=56, md=64. Consumed by MuiAppbar and the
 * MuiSidebar header so both headers align at every breakpoint.
 * @type {Object<string, number>}
 */
export const APPBAR_MIN_HEIGHT = Object.freeze({ xs: 48, sm: 56, md: 64 });

/**
 * The same ladder in theme-spacing units (8px base) for containers that
 * must offset the fixed public app-bar (PublicLayout content margin).
 * @type {Object<string, number>}
 */
export const APPBAR_MIN_HEIGHT_SPACING = Object.freeze({ xs: 6, sm: 7, md: 8 });

/** @type {number} Permanent sidebar width when collapsed (px). */
export const SIDEBAR_MINI_WIDTH = Object.freeze(72);

/** @type {number} Permanent sidebar width when expanded (px). */
export const SIDEBAR_FULL_WIDTH = Object.freeze(240);

/** Pagination row-per-page options for MuiDataGrid and MuiPagination (§11.3, §46.7). */
export const ROWS_PER_PAGE_OPTIONS = Object.freeze([10, 25, 50, 100]);
