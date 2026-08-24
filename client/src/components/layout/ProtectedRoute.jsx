/**
 * ProtectedRoute — guard of every authenticated route (§41.5):
 * spinner while the session initializes; guests redirect to
 * `/login` carrying `state.from`; sessions render the branch.
 * Ships statically so no lazy window renders it unguarded (§41.3).
 */
import { Navigate, Outlet, useLocation } from "react-router";
import { useSelector } from "react-redux";
import LoadingSpinner from "../reusable/LoadingSpinner.jsx";
import { selectAuthStatus } from "../../redux/features/authSlice.js";
import {
  AUTH_STATUSES,
  LOGIN_ROUTE,
} from "../../utils/constants.js";

/**
 * Resolves the guard for one render pass.
 * @returns {JSX.Element} Spinner, redirect, or the routed branch.
 */
const ProtectedRoute = () => {
  const status = useSelector(selectAuthStatus);
  const location = useLocation();

  if (status === AUTH_STATUSES.INITIALIZING) {
    return <LoadingSpinner message="Restoring session…" minHeight="100vh" />;
  }
  if (status !== AUTH_STATUSES.AUTHENTICATED) {
    return (
      <Navigate
        to={LOGIN_ROUTE}
        replace
        state={{ from: location }}
      />
    );
  }
  return <Outlet />;
}

export default ProtectedRoute;
