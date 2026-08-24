/**
 * @module redux/features/authSlice
 *
 * The session mirror of the client (§41.5/§42.3): a three-state
 * status plus the persisted UserDto. Tokens never enter this slice —
 * the session lives in httpOnly cookies (§28.2); hydration comes
 * from redux-persist over sessionStorage (owner directive — there is
 * no boot probe).
 */
import { createSlice } from "@reduxjs/toolkit";
import { AUTH_STATUSES } from "../../utils/constants.js";

/**
 * Dispatched by the §42.3 reauth chain when a refresh dies under an
 * authenticated session. Exported as a plain string constant so the
 * network layer never imports this module's internals (no cycles).
 * @type {string}
 */
export const AUTH_SESSION_EXPIRED = "auth/sessionExpired";

const initialState = Object.freeze({
  status: AUTH_STATUSES.INITIALIZING,
  user: null,
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Stores an authenticated session after login or rehydrate.
     */
    authenticated(state, action) {
      state.status = AUTH_STATUSES.AUTHENTICATED;
      state.user = action.payload;
    },
    /**
     * Resolves the initializing state to guest (rehydrate found none).
     */
    setGuest(state) {
      state.status = AUTH_STATUSES.GUEST;
      state.user = null;
    },
    /**
     * Clears local session state after a successful logout call.
     */
    logoutCleared(state) {
      state.status = AUTH_STATUSES.GUEST;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(AUTH_SESSION_EXPIRED, (state) => {
      state.status = AUTH_STATUSES.GUEST;
      state.user = null;
    });
  },
});

const { actions, reducer } = authSlice;

/** Selector of the session status (camelCase, §41.6). */
const selectAuthStatus = (state) => state.auth.status;

/** Selector of the persisted user DTO. */
const selectAuthUser = (state) => state.auth.user;

export { actions as authActions, selectAuthStatus, selectAuthUser };
export default reducer;
