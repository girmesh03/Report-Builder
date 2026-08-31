/**
 * @module components/reusable/MuiErrorState
 *
 * The standard fetch/error fallback surface for a page body (§46.14).
 * Prop-driven and refetch-capable — unlike AppErrorPage, which is bound
 * to the router `useRouteError` boundary and uses a full-page reload.
 * Fills its parent and centers the alert; only the inner card caps width.
 */

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import MuiButton from "./MuiButton.jsx";

/**
 * Renders the error state.
 * @param {Object} props - Component props.
 * @param {string} [props.title] - Headline.
 * @param {string} [props.message] - End-user error message.
 * @param {string} [props.retryLabel="Retry"] - Retry button label.
 * @param {() => void} [props.onRetry] - Optional refetch callback.
 * @param {number} [props.minHeight=300] - Minimum height of the container.
 * @param {Object} [props.sx] - Additional styles.
 * @returns {JSX.Element} The error state.
 */
const MuiErrorState = ({
  title,
  message,
  retryLabel = "Retry",
  onRetry,
  minHeight = 300,
  sx,
  ...rest
}) => (
  <Box
    role="alert"
    sx={{
      width: "100%",
      minHeight,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...sx,
    }}
    {...rest}
  >
    <Paper variant="outlined" sx={{ maxWidth: 560, width: "100%", p: { xs: 3, sm: 5 }, textAlign: "center" }}>
      {title && <Typography variant="h5">{title}</Typography>}
      {message && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: title ? 1 : 0 }}>
          {message}
        </Typography>
      )}
      {onRetry && (
        <MuiButton variant="outlined" onClick={onRetry} sx={{ mt: 3, mx: "auto", display: "block" }}>
          {retryLabel}
        </MuiButton>
      )}
    </Paper>
  </Box>
);

export default MuiErrorState;
