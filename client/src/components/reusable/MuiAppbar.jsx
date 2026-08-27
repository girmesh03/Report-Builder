/**
 * MuiAppbar — the single app-bar (§46.11): `public` variant fixed
 * full-width for PublicLayout; `protected` variant static inside the
 * AppShell content column. Heights come from APPBAR_MIN_HEIGHT
 * (xs=48, sm=56, md=64 — owner directive 2026-08-26), never a fixed
 * value. The protected variant carries the placeholder global-search
 * action (SearchIcon only; the §59 dialog is not yet built).
 */
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import SearchIcon from "@mui/icons-material/Search";
import { APPBAR_MIN_HEIGHT } from "../../utils/constants.js";

/**
 * Renders the app-bar shell for one variant.
 * @param {Object} props - Component props.
 * @param {"public"|"protected"} [props.variant] - Geometry variant.
 * @param {React.ReactNode} [props.leading] - Leading slot (logo /
 *   hamburger).
 * @param {React.ReactNode} [props.actions] - Right-aligned actions
 *   slot; collapses to icons below 600px per §45.3 at call sites.
 * @param {Object} [props.sx] - Extra styles from the layout.
 * @returns {JSX.Element} The bar.
 */
const MuiAppbar = ({ variant = "public", leading, actions, sx }) => {
  const isPublic = variant === "public";

  /** Search placeholder — icon-only until the §59 surface arrives. */
  const searchAction = !isPublic ? (
    <Tooltip title="Global search (coming soon)">
      <IconButton
        size="small"
        aria-label="Global search"
        onClick={() => console.log("Global search — not yet implemented")}
      >
        <SearchIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  ) : null;

  return (
    <AppBar
      position={isPublic ? "fixed" : "static"}
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: 1,
        borderColor: "divider",
        ...sx,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          px: { xs: 1.5, sm: 3 },
          minHeight: APPBAR_MIN_HEIGHT,
          gap: 1.5,
        }}
      >
        {leading}
        <Box sx={{ flexGrow: 1 }} />
        {searchAction}
        {actions}
      </Toolbar>
    </AppBar>
  );
};

export default MuiAppbar;
