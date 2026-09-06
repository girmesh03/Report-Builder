/**
 * @module pages/Reports
 *
 * Reports page (§50) — the supervisor's daily supervision reports:
 * listing (grid/card), creating, and the report lifecycle actions.
 *
 * This increment wires the page shell (MuiPageHeader + header actions)
 * plus the fetch surfaces — loading / error / empty primaries. The
 * fetched `data.docs` payload is held by the page but NOT passed to any
 * child component; rows render in later increments (grid/cards, Stage B4/B5).
 *
 * Header actions are STUBS this increment (owner 2026-09-01): each click
 * `console.log`s its payload; the real filter menu (B2), view→grid/list
 * rendering (B4), and create dialog (B6) replace them incrementally. The
 * temporary `viewMode` state exists only to drive the toggle — it becomes
 * the real effective-view state in B4. On xs (A8) the header forces list
 * intent: the toggle is hidden and the create collapses to an icon-only
 * button (`viewMode` passed as `undefined` to ReportsHeaderActions).
 */

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import MuiPageHeader from "../components/reusable/MuiPageHeader.jsx";
import LoadingSpinner from "../components/reusable/LoadingSpinner.jsx";
import MuiErrorState from "../components/reusable/MuiErrorState.jsx";
import MuiEmptyState from "../components/reusable/MuiEmptyState.jsx";
import ReportsHeaderActions from "../components/reports/ReportsHeaderActions.jsx";
import { useGetReportsQuery } from "../redux/features/reportsSlice.js";
import { showToast } from "../utils/toast.js";
import {
  REPORTS_COPY,
  TOAST_CATALOGUE,
} from "../utils/constants.js";

/** Report list query — limit 10 aligns with the backend default/validator
 *  (1–100) (§11.3, §31.3). Default sort business-date desc, no archive
 *  filter, no branch/generated filters yet (Stage B2). */
const PAGE_SIZE = 10;

/**
 * Reports page component.
 * @returns {JSX.Element} The Reports page.
 */
const ReportsPage = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  // Temporary view-mode state driving the header toggle; becomes the real
  // effective-view state when the grid/card rendering lands (B4).
  const [viewMode, setViewMode] = useState("grid");

  // xs forces list view (A8) and hides the toggle; on sm+ the user's
  // toggle selection drives the effective view (default grid).
  const effectiveView = isXs ? "list" : viewMode;

  // Stable query arg (C21): a single object — never recreated per render,
  // so RTK Query does not refetch on re-render.
  const query = useMemo(
    () => ({ page: 1, limit: PAGE_SIZE, sort: "-date", isArchived: "all" }),
    [],
  );

  const { data, error, refetch } = useGetReportsQuery(query);

  // Loading gate (C21, owner directive 2026-08-31): "no content yet",
  // NOT `isLoading`. `!data && !error` flips off the moment a response
  // (success or error) arrives.
  const loading = !data && !error;

  // Toast each fresh error transition once (no duplicate spam, §60.5);
  // an inline retry surface remains in place while the error persists.
  const prevErrorRef = useRef(false);
  useEffect(() => {
    const current = Boolean(error);
    if (current && !prevErrorRef.current) {
      showToast("error", error?.message ?? TOAST_CATALOGUE.common.unexpectedError);
    }
    prevErrorRef.current = current;
  }, [error]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Header-action STUBS (owner 2026-09-01): console.log only — the real
  // handlers land incrementally (B2 filter menu, B4 view rendering,
  // B6 create dialog).
  const handleViewModeChange = useCallback((mode) => {
    console.log("reports view mode:", mode);
    setViewMode(mode);
  }, []);

  const handleFilterMenuOpen = useCallback((event) => {
    console.log("reports filter anchor:", event?.currentTarget);
  }, []);

  const handleCreateDialogOpen = useCallback(() => {
    console.log("reports create dialog: open");
  }, []);

  return (
    <>
      <MuiPageHeader
        title={REPORTS_COPY.header.title}
        subtitle={REPORTS_COPY.header.subtitle}
        actions={
          <ReportsHeaderActions
            viewMode={isXs ? undefined : effectiveView}
            onViewModeChange={handleViewModeChange}
            onFilterMenuOpen={handleFilterMenuOpen}
            onCreateDialogOpen={handleCreateDialogOpen}
          />
        }
      />
      {loading ? (
        <LoadingSpinner
          message={REPORTS_COPY.loading.message}
          minHeight="80%"
        />
      ) : error ? (
        <MuiErrorState
          title={REPORTS_COPY.error.title}
          message={error?.message}
          retryLabel={REPORTS_COPY.error.retryLabel}
          onRetry={handleRetry}
        />
      ) : data?.docs?.length === 0 ? (
        <MuiEmptyState
          title={REPORTS_COPY.empty.title}
        />
      ) : (
        // data present — rows render in later increments (B4 grid / B5 cards)
        null
      )}
    </>
  );
};

export default ReportsPage;