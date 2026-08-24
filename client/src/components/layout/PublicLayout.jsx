/**
 * PublicLayout — root wrapper of the public branch (§47.2): fixed
 * public app-bar (logo, theme toggle, auth-aware actions) over an
 * independently scrolling content area. Route transitions swap the
 * outlet for a spinner; a passed `children` replaces the outlet
 * (the §59.4 composition contract).
 */
import { Link as RouterLink, Outlet, useNavigation } from "react-router";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import MuiAppbar from "../reusable/MuiAppbar.jsx";
import MuiButton from "../reusable/MuiButton.jsx";
import LoadingSpinner from "../reusable/LoadingSpinner.jsx";
import Logo from "./Logo.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import { selectAuthStatus } from "../../redux/features/authSlice.js";
import useLogout from "../../hooks/useLogout.js";
import {
  AUTH_STATUSES,
  LOGIN_ROUTE,
} from "../../utils/constants.js";

/**
 * Renders the public shell around the routed branch.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} [props.children] - Overrides the outlet
 *   when provided.
 * @returns {JSX.Element} The layout.
 */
function PublicLayout({ children }) {
  const navigation = useNavigation();
  const status = useSelector(selectAuthStatus);
  const logout = useLogout();
  const isAuthenticated = status === AUTH_STATUSES.AUTHENTICATED;

  const actions = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <ThemeToggle />
      {isAuthenticated ? (
        <Tooltip title="Logout">
          <IconButton
            size="small"
            aria-label="Logout"
            onClick={() => void logout()}
            sx={{ color: "text.secondary" }}
          >
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <>
          <Button
            component={RouterLink}
            to={LOGIN_ROUTE}
            size="small"
            startIcon={<LoginIcon />}
            sx={{ display: { xs: "none", sm: "inline-flex" }, flexShrink: 0 }}
          >
            Log in
          </Button>
          <IconButton
            component={RouterLink}
            to={LOGIN_ROUTE}
            size="small"
            aria-label="Log in"
            sx={{ display: { xs: "inline-flex", sm: "none" } }}
          >
            <LoginIcon />
          </IconButton>
          <MuiButton
            component={RouterLink}
            to="/register"
            variant="contained"
            startIcon={<PersonAddIcon />}
            sx={{ display: { xs: "none", sm: "inline-flex" } }}
          >
            Sign up
          </MuiButton>
          <IconButton
            component={RouterLink}
            to="/register"
            size="small"
            aria-label="Sign up"
            sx={{ display: { xs: "inline-flex", sm: "none" } }}
          >
            <PersonAddIcon />
          </IconButton>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <MuiAppbar variant="public" leading={<Logo showName />} actions={actions} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 8,
          overflowY: "auto",
        }}
      >
        {navigation.state === "loading" ? (
          <LoadingSpinner message="Loading…" minHeight="100%" />
        ) : (
          children ?? <Outlet />
        )}
      </Box>
    </Box>
  );
}

export default PublicLayout;
