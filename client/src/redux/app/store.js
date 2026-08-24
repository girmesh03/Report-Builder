/**
 * @module redux/app/store
 *
 * The store of the application (§41.6): the persisted auth session
 * mirror (sessionStorage — a page refresh keeps the session, closing
 * the tab ends it) plus the single apiSlice. A REHYDRATE with no
 * stored session downgrades `initializing` to `guest`; a fulfilled
 * login promotes the session.
 */
import {
  configureStore,
  createListenerMiddleware,
} from "@reduxjs/toolkit";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { apiSlice } from "../features/apiSlice.js";
import authReducer, { authActions } from "../features/authSlice.js";
import { AUTH_STATUSES } from "../../utils/constants.js";

/**
 * Minimal sessionStorage adapter meeting redux-persist's async
 * storage contract — every method returns a Promise (getStoredState
 * chains `.then`). The package's default storage export breaks under
 * Vite's ESM interop, hence the hand-rolled surface.
 */
const sessionStorageAdapter = {
  getItem: (key) => {
    try {
      return Promise.resolve(window.sessionStorage.getItem(key));
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem: (key, value) => {
    try {
      window.sessionStorage.setItem(key, value);
      return Promise.resolve();
    } catch {
      /* storage unavailable (private mode) — session stays in memory */
      return Promise.resolve();
    }
  },
  removeItem: (key) => {
    try {
      window.sessionStorage.removeItem(key);
      return Promise.resolve();
    } catch {
      /* nothing to remove */
      return Promise.resolve();
    }
  },
};

const authPersistConfig = {
  key: "auth",
  storage: sessionStorageAdapter,
  version: 1,
  whitelist: ["status", "user"],
};

const listenerMiddleware = createListenerMiddleware();

/**
 * A rehydrate that found no stored session resolves the boot state
 * to guest; guards may then decide immediately.
 */
listenerMiddleware.startListening({
  type: REHYDRATE,
  effect: (action, api) => {
    if (
      action.payload?.auth?.status !== AUTH_STATUSES.AUTHENTICATED &&
      api.getState().auth.status === AUTH_STATUSES.INITIALIZING
    ) {
      api.dispatch(authActions.setGuest());
    }
  },
});

export const store = configureStore({
  reducer: {
    auth: persistReducer(authPersistConfig, authReducer),
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
      },
    })
      .prepend(listenerMiddleware.middleware)
      .concat(apiSlice.middleware),
});

export const persistor = persistStore(store);
