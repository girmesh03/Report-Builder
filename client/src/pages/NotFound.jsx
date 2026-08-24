/**
 * NotFound — the §59.4 404 page: ships statically, reuses
 * PublicLayout via children so chrome stays consistent on any
 * unmatched URL (§47.2).
 */
import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import PublicLayout from "../components/layout/PublicLayout.jsx";
import MuiButton from "../components/reusable/MuiButton.jsx";
import { LOGIN_ROUTE } from "../utils/constants.js";

/**
 * Renders the not-found card inside the public shell.
 * @returns {JSX.Element} The 404 page.
 */
function NotFound() {
  return (
    <PublicLayout>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 10 }}>
        <Paper variant="outlined" sx={{ p: { xs: 3, sm: 6 }, textAlign: "center" }}>
          <Typography variant="h2" component="p">
            404
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            This route doesn't exist in the registry.
          </Typography>
          <MuiButton variant="outlined" component={RouterLink} to={LOGIN_ROUTE} sx={{ mt: 3 }}>
            Go to sign-in
          </MuiButton>
        </Paper>
      </Box>
    </PublicLayout>
  );
}

export default NotFound;
