/**
 * PublicRoute — inverse guard over Login and Register only (§41.5):
 * an authenticated visitor is sent to `/dashboard`; guests render
 * the branch. Landing sits outside this guard.
 */
import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";
import LoadingSpinner from "../reusable/LoadingSpinner.jsx";
import { selectAuthStatus } from "../../redux/features/authSlice.js";
import {
  AUTH_STATUSES,
  LOGIN_REDIRECT_ROUTE,
} from "../../utils/constants.js";

/**
 * Resolves the guard for one render pass.
 * @returns {JSX.Element} Redirect, spinner, or the routed branch.
 */
function PublicRoute() {
  const status = useSelector(selectAuthStatus);

  if (status === AUTH_STATUSES.INITIALIZING) {
    return <LoadingSpinner message="Loading…" minHeight="100vh" />;
  }
  if (status === AUTH_STATUSES.AUTHENTICATED) {
    return <Navigate to={LOGIN_REDIRECT_ROUTE} replace />;
  }
  return <Outlet />;
}

export default PublicRoute;
