/**
 * AppErrorPage — the router-level error surface (§41.4/§60): distinct
 * from the 404 page; offers recovery without a full reload.
 */
import { useRouteError, isRouteErrorResponse } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiButton from "../components/reusable/MuiButton.jsx";

/**
 * Renders the error boundary fallback.
 * @returns {JSX.Element} The error surface.
 */
function AppErrorPage() {
  const error = useRouteError();
  const headline = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : "Something went wrong";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        px: 3,
        textAlign: "center",
      }}
    >
      <Typography variant="h4">{headline}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
        The view hit an unexpected state. Reloading usually clears it.
      </Typography>
      <MuiButton variant="outlined" onClick={() => window.location.reload()}>
        Reload
      </MuiButton>
    </Box>
  );
}

export default AppErrorPage;
