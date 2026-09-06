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
 * `console.log`s its payload; the real view→grid/list rendering (B4) and
 * create dialog (B6) replace them incrementally. The filter menu (B2) is
 * wired for real (radio sections → query derivation + badge). On xs (A8)
 * the header forces list intent: the toggle is hidden and the create
 * collapses to an icon-only button (`viewMode` passed as `undefined` to
 * ReportsHeaderActions).
 */

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import MuiPageHeader from "../components/reusable/MuiPageHeader.jsx";
import LoadingSpinner from "../components/reusable/LoadingSpinner.jsx";
import MuiErrorState from "../components/reusable/MuiErrorState.jsx";
import MuiEmptyState from "../components/reusable/MuiEmptyState.jsx";
import ReportsHeaderActions from "../components/reports/ReportsHeaderActions.jsx";
import ReportsFilterMenu from "../components/reports/ReportsFilterMenu.jsx";
import { useGetReportsQuery } from "../redux/features/reportsSlice.js";
import { showToast } from "../utils/toast.js";
import {
  BRANCH_ISARCHIVED,
  REPORTS_COPY,
  TOAST_CATALOGUE,
} from "../utils/constants.js";

/** Report list query — limit 10 aligns with the backend default/validator
 *  (1–100) (§11.3, §31.3). Default sort business-date desc. */
const PAGE_SIZE = 10;

/** Default filter state — every dimension on "all" (no filter). */
const DEFAULT_FILTER = Object.freeze({
  archive: BRANCH_ISARCHIVED.ALL,
  generated: "all",
  branch: "all",
});

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

  // Filter state — one value per radio section (owner B2: select-one).
  const [filterChecked, setFilterChecked] = useState(DEFAULT_FILTER);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  // Stable query arg (C21): recreated only when a dependency changes.
  // Backend `generated`/`branch` are omitted when "all" so no filter sends.
  const query = useMemo(() => {
    const q = {
      page: 1,
      limit: PAGE_SIZE,
      sort: "-date",
      isArchived: filterChecked.archive,
    };
    if (filterChecked.generated !== "all") {
      q.generated = filterChecked.generated;
    }
    if (filterChecked.branch !== "all") {
      q.branch = filterChecked.branch;
    }
    return q;
  }, [filterChecked]);

  const { data, error, refetch } = useGetReportsQuery(query);

  // Loading gate (C21, owner directive 2026-08-31): "no content yet",
  // NOT `isLoading`. `!data && !error` flips off the moment a response
  // (success or error) arrives.
  const loading = !data && !error;

  // Filter badge: matched count shown only when a filter is applied
  // (any dimension off "all"); invisible in the no-filter case.
  const hasFilter =
    filterChecked.archive !== BRANCH_ISARCHIVED.ALL ||
    filterChecked.generated !== "all" ||
    filterChecked.branch !== "all";
  const filterBadge = hasFilter ? (data?.totalDocs ?? 0) : 0;

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
  // view rendering (B4) and create dialog (B6) replace them incrementally.
  const handleViewModeChange = useCallback((mode) => {
    console.log("reports view mode:", mode);
    setViewMode(mode);
  }, []);

  const handleCreateDialogOpen = useCallback(() => {
    console.log("reports create dialog: open");
  }, []);

  // Filter — real wiring (B2): opens/closes the menu and derives the query.
  const handleFilterMenuOpen = useCallback((event) => {
    setFilterAnchorEl(event.currentTarget);
  }, []);

  const handleFilterMenuClose = useCallback(() => {
    setFilterAnchorEl(null);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilterChecked((prev) => ({ ...prev, [key]: value }));
    // Filter change resets to page 1 (§46.7) — page is fixed today; the
    // pagination widget lands with the grid (B4).
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
            filterBadge={filterBadge}
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
      <ReportsFilterMenu
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={handleFilterMenuClose}
        checked={filterChecked}
        onChange={handleFilterChange}
      />
    </>
  );
};

export default ReportsPage;