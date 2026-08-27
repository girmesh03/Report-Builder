/**
 * Logo — the product mark (§47.4 header motif): the report-header
 * line structure beside the app name. Navigation target is supplied
 * by the consumer via `to` — this component carries no auth coupling.
 * Used by PublicLayout (public app-bar) and MuiSidebar (protected
 * sidebar header).
 */
import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { APP_NAME, DASHBOARD_ROUTE } from "../../utils/constants.js";

/**
 * Renders the logo block as a router link.
 * @param {Object} props - Component props.
 * @param {boolean} [props.showName] - Render the app name beside the
 *   mark (full sidebar/app-bar true, compact/minimal surfaces false).
 * @param {string} [props.to] - Router target (default: dashboard).
 * @param {Object} [props.sx] - Extra styles.
 * @returns {JSX.Element} The logo link.
 */
const Logo = ({ showName = true, to = DASHBOARD_ROUTE, sx }) => (
  <Box
    component={RouterLink}
    to={to}
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 1.25,
      textDecoration: "none",
      color: "inherit",
      minWidth: 0,
      ...sx,
    }}
  >
    <Box
      aria-hidden
      sx={{
        width: 26,
        height: 26,
        flexShrink: 0,
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
      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
        {APP_NAME}
      </Typography>
    ) : null}
  </Box>
);

export default Logo;
