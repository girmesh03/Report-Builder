/**
 * @module pages/Branches
 *
 * Branches page (§56) — management surface for the supervisor's branches:
 * listing, creating, editing, and the two-path lifecycle actions
 * (archive → restore → permanent delete, BR-14/§30).
 *
 * This increment wires the fetch plus its loading / error / empty
 * surfaces only. The fetched `data.docs` payload is held by the page
 * but NOT passed to any child component — rows render in a later
 * increment.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import MuiPageHeader from "../components/reusable/MuiPageHeader.jsx";
import BranchesHeaderActions from "../components/branches/BranchesHeaderActions.jsx";
import LoadingSpinner from "../components/reusable/LoadingSpinner.jsx";
import MuiErrorState from "../components/reusable/MuiErrorState.jsx";
import MuiEmptyState from "../components/reusable/MuiEmptyState.jsx";
import { useGetBranchesQuery } from "../redux/features/branchesSlice.js";
import { showToast } from "../utils/toast.js";
import { BRANCHES_COPY } from "../utils/constants.js";

/** Default list query — limit 10 aligns with the grid page size and the
 *  backend default/validator (1–100) (§11.3, §46.7).
 *  Frozen so the query arg is stable (no re-fetch loop, C21). */
const BRANCHES_QUERY = Object.freeze({
  page: 1,
  limit: 10,
  sort: "name",
  isArchived: "all",
});

/**
 * Branches page component.
 * @returns {JSX.Element} The Branches page.
 */
const BranchesPage = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const [viewMode, setViewMode] = useState("grid");

  const { data, error, refetch } = useGetBranchesQuery(BRANCHES_QUERY);

  // Loading gate (C21, owner directive 2026-08-31): "no content yet",
  // NOT `isLoading`. `isLoading` stays true until a request settles and
  // spins forever on a hung request; `!data && !error` flips off the
  // moment a response (success or error) arrives.
  const loading = !data && !error;

  // xs forces list view (A8) and hides the toggle (A8); on sm+ the
  // user's toggle selection drives the effective view (default grid).
  const effectiveView = isXs ? "list" : viewMode;

  // Toast each fresh error transition once (no duplicate spam, §60.5);
  // an inline retry surface remains in place while the error persists.
  const prevErrorRef = useRef(false);
  useEffect(() => {
    const current = Boolean(error);
    if (current && !prevErrorRef.current) {
      showToast("error", error?.message ?? BRANCHES_COPY.error.title);
    }
    prevErrorRef.current = current;
  }, [error]);

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

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <>
      <MuiPageHeader
        title={BRANCHES_COPY.header.title}
        subtitle={BRANCHES_COPY.header.subtitle}
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
      {loading ? (
        <LoadingSpinner message={BRANCHES_COPY.loading.message} />
      ) : error ? (
        <MuiErrorState
          title={BRANCHES_COPY.error.title}
          message={error?.message}
          retryLabel={BRANCHES_COPY.error.retryLabel}
          onRetry={handleRetry}
        />
      ) : data?.docs?.length === 0 ? (
        <MuiEmptyState
          title={BRANCHES_COPY.empty.title}
          action={{
            label: BRANCHES_COPY.empty.createLabel,
            onClick: handleCreateOpen,
          }}
        />
      ) : null}
    </>
  );
};

export default BranchesPage;
