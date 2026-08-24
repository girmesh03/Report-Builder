/**
 * Logo — the product mark (§47.4 header motif): the report-header
 * line structure above the app name. Navigation target is decided by
 * the consumer via `onClick` (logo → /dashboard when authenticated,
 * else `/` — locked decision 10).
 */
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { selectAuthStatus } from "../../redux/features/authSlice.js";
import { useSelector } from "react-redux";
import {
  AUTH_STATUSES,
  APP_NAME,
  LOGIN_REDIRECT_ROUTE,
} from "../../utils/constants.js";

/**
 * Renders the logo block.
 * @param {Object} props - Component props.
 * @param {boolean} [props.showName] - Render the app name beside the
 *   mark (sidebar header true, compact bars false).
 * @returns {JSX.Element} The clickable logo.
 */
function Logo({ showName = true }) {
  const navigate = useNavigate();
  const authStatus = useSelector(selectAuthStatus);
  const target =
    authStatus === AUTH_STATUSES.AUTHENTICATED ? LOGIN_REDIRECT_ROUTE : "/";
  return (
    <Box
      component="button"
      type="button"
      onClick={() => navigate(target)}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1.25,
        bgcolor: "transparent",
        border: 0,
        p: 0,
        cursor: "pointer",
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 26,
          height: 26,
          borderRadius: 1,
          border: 1,
          borderColor: "divider",
          display: "grid",
          gridTemplateRows: "repeat(3, 1fr)",
          alignItems: "center",
          px: 0.5,
          "& span": {
            display: "block",
            height: 0,
            borderTop: 1,
            borderColor: "text.disabled",
          },
          "& span:last-of-type": {
            borderTopWidth: 2,
            borderColor: "primary.main",
            width: "62%",
          },
        }}
      >
        <span />
        <span />
        <span />
      </Box>
      {showName ? (
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {APP_NAME}
        </Typography>
      ) : null}
    </Box>
  );
}

export default Logo;
