/**
 * MuiAppbar — the single app-bar (§46.11): `public` variant fixed
 * full-width for PublicLayout; `protected` variant static 64px
 * inside the AppShell content column. Which actions render is the
 * §47 layouts' business — this carries only geometry.
 */
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";

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
function MuiAppbar({ variant = "public", leading, actions, sx }) {
  const isPublic = variant === "public";
  return (
    <AppBar
      position={isPublic ? "fixed" : "static"}
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: 1,
        borderColor: "divider",
        ...(isPublic ? {} : { height: 64 }),
        ...sx,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          px: { xs: 1.5, sm: 3 },
          minHeight: 64,
          gap: 1.5,
        }}
      >
        {leading}
        <Box sx={{ flexGrow: 1 }} />
        {actions}
      </Toolbar>
    </AppBar>
  );
}

export default MuiAppbar;
