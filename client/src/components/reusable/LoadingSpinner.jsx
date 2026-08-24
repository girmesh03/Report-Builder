/**
 * LoadingSpinner — centered CircularProgress for full-page,
 * section-level, and route-transition loading (§46.14).
 */
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

/**
 * Renders the standard loading state.
 * @param {Object} props - Component props.
 * @param {string} [props.message] - Optional supporting line under
 *   the spinner, rendered in `text.secondary`.
 * @param {number|string} [props.minHeight] - Container height; full
 *   page by default, sections pass e.g. "400px", transitions "100%".
 * @returns {JSX.Element} The spinner block.
 */
const LoadingSpinner = ({ message, minHeight = "100vh" }) => {
  return (
    <Box
      role="status"
      sx={{
        minHeight,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
      }}
    >
      <CircularProgress size={36} />
      {message ? (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      ) : null}
    </Box>
  );
}

export default LoadingSpinner;
