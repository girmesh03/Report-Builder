/**
 * Dashboard — TEMPORARY BRIDGE (slice-1 amendment): proves the
 * guarded session loop end-to-end until the §49 dashboard slice
 * replaces it. Shows the signed-in identity and the logout action —
 * nothing else. Marked for removal with its owning record.
 */
import { Navigate } from "react-router";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import MuiButton from "../components/reusable/MuiButton.jsx";
import useLogout from "../hooks/useLogout.js";
import { useSelector } from "react-redux";
import { selectAuthStatus, selectAuthUser } from "../redux/features/authSlice.js";
import { AUTH_STATUSES, LOGIN_ROUTE } from "../utils/constants.js";

/**
 * Renders the bridge page behind the guard.
 * @returns {JSX.Element} The bridge surface.
 */
const Dashboard = () => {
  const status = useSelector(selectAuthStatus);
  const user = useSelector(selectAuthUser);
  const logout = useLogout();

  if (status !== AUTH_STATUSES.AUTHENTICATED) {
    return <Navigate to={LOGIN_ROUTE} replace />;
  }

  return (
    <Box
      sx={{
        maxWidth: 720,
        mx: "auto",
        px: { xs: 2, sm: 4 },
        py: 6,
      }}
    >
        <Paper variant="outlined" sx={{ p: { xs: 3, sm: 5 } }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            SIGNED IN
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.5 }}>
            {user?.fullName ?? "—"}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            {user?.email ?? ""}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, borderLeft: 2, borderColor: "divider", pl: 1.5 }}
          >
            Temporary bridge surface — the dashboard lands with its own
            slice.
          </Typography>
          <MuiButton
            variant="outlined"
            color="error"
            onClick={() => void logout()}
            sx={{ mt: 3 }}
          >
            Log out
          </MuiButton>
        </Paper>
    </Box>
  );
}

export default Dashboard;
