/**
 * AppShell — the protected root wrapper (§47.3): sidebar + content
 * column, with the app-bar and the scrollable outlet as siblings of
 * that column. Sidebar is permanent and mini-default on md+ (owner
 * standing directive); below md it is a temporary overlay opened by
 * the hamburger in the app-bar leading slot. Content padding follows
 * the xs=1, sm=2, md=3 ladder (owner directive 2026-08-26).
 */
import { useCallback, useState } from "react";
import { Outlet, useNavigation } from "react-router";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import MuiAppbar from "../reusable/MuiAppbar.jsx";
import LoadingSpinner from "../reusable/LoadingSpinner.jsx";
import MuiSidebar from "./MuiSidebar.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import AvatarMenu from "./AvatarMenu.jsx";

/**
 * Renders the protected shell around routed pages.
 * @returns {JSX.Element} The layout.
 */
const AppShell = () => {
  const navigation = useNavigation();
  const [mode, setMode] = useState("mini");
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleMode = useCallback(
    () => setMode((m) => (m === "mini" ? "full" : "mini")),
    [],
  );
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <MuiSidebar
        mode={mode}
        onToggleMode={toggleMode}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MuiAppbar
          variant="protected"
          leading={
            /* Hamburger only below md — the permanent sidebar md+
               carries the brand in its own header. */
            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="small"
                aria-label="Open navigation"
                onClick={() => setMobileOpen(true)}
              >
                <MenuIcon fontSize="small" />
              </IconButton>
            </Box>
          }
          actions={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <ThemeToggle />
              <AvatarMenu />
            </Box>
          }
        />
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            p: { xs: 1, sm: 2, md: 3 },
          }}
        >
          {navigation.state === "loading" ? (
            <LoadingSpinner message="Loading…" minHeight="100%" />
          ) : (
            <Outlet />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AppShell;
