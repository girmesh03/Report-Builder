/**
 * @module pages/Branches
 *
 * Branches page (§56) — management surface for the supervisor's branches:
 * listing, creating, editing, and the two-path lifecycle actions
 * (archive → restore → permanent delete, BR-14/§30).
 */

import { useState, useCallback } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import MuiPageHeader from "../components/reusable/MuiPageHeader.jsx";
import BranchesHeaderActions from "../components/branches/BranchesHeaderActions.jsx";

/**
 * Branches page component.
 * @returns {JSX.Element} The Branches page.
 */
const BranchesPage = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const [viewMode, setViewMode] = useState("grid");

  // xs forces list view (A8) and hides the toggle (A8); on sm+ the
  // user's toggle selection drives the effective view (default grid).
  const effectiveView = isXs ? "list" : viewMode;

  const handleFilterOpen = useCallback(() => {
    console.log("BranchesPage: filter dialog opened");
  }, []);

  const handleCreateOpen = useCallback(() => {
    console.log("BranchesPage: create branch dialog opened");
  }, []);

  const handleViewModeChange = useCallback((mode) => {
    console.log("BranchesPage: view mode changed to", mode);
    setViewMode(mode);
  }, []);

  return (
    <>
      <MuiPageHeader
        title="Branches"
        subtitle="Your supervision branches"
        actions={
          <BranchesHeaderActions
            viewMode={isXs ? undefined : effectiveView}
            onViewModeChange={handleViewModeChange}
            showArchived={false}
            onFilterDialogOpen={handleFilterOpen}
            onCreateDialogOpen={handleCreateOpen}
          />
        }
      />
    </>
  );
};

export default BranchesPage;
