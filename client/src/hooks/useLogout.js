/**
 * @module hooks/useLogout
 *
 * The single logout flow (§47.6): call the §28 endpoint, clear the
 * local session only after success (a failing logout still clears
 * locally and navigates), toast once, land on `/login`.
 */
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { useLogoutMutation } from "../redux/features/authEndpoints.js";
import { authActions } from "../redux/features/authSlice.js";
import { showToast } from "../utils/toast.js";
import {
  TOAST_CATALOGUE,
  LOGIN_ROUTE,
} from "../utils/constants.js";

/**
 * Provides the app-wide logout action.
 * @returns {Function} Async logout callback, safe to call anywhere.
 */
function useLogout() {
  const [logoutMutation] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useCallback(async () => {
    try {
      await logoutMutation().unwrap();
      showToast("info", TOAST_CATALOGUE.auth.loggedOut);
    } catch {
      showToast(
        "error",
        TOAST_CATALOGUE.common.unexpectedError,
      );
    } finally {
      dispatch(authActions.logoutCleared());
      navigate(LOGIN_ROUTE);
    }
  }, [logoutMutation, dispatch, navigate]);
}

export default useLogout;
