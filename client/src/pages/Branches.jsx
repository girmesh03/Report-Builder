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

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import MuiPageHeader from "../components/reusable/MuiPageHeader.jsx";
import BranchesHeaderActions from "../components/branches/BranchesHeaderActions.jsx";
import BranchesFilterMenu from "../components/branches/BranchesFilterMenu.jsx";
import BranchFormDialog from "../components/branches/BranchFormDialog.jsx";
import MuiDataGrid from "../components/reusable/MuiDataGrid.jsx";
import { createBranchColumns } from "../components/columns/branches.jsx";
import LoadingSpinner from "../components/reusable/LoadingSpinner.jsx";
import MuiErrorState from "../components/reusable/MuiErrorState.jsx";
import MuiEmptyState from "../components/reusable/MuiEmptyState.jsx";
import { useGetBranchesQuery } from "../redux/features/branchesSlice.js";
import { showToast } from "../utils/toast.js";
import { BRANCHES_COPY, BRANCH_ISARCHIVED } from "../utils/constants.js";

/** Branch list query — limit 10 aligns with the grid page size and the
 *  backend default/validator (1–100) (§11.3, §46.7). `isArchived` is
 *  state-driven so the filter menu can change it (refetch + page reset). */
const PAGE_SIZE = 10;

/**
 * Branches page component.
 * @returns {JSX.Element} The Branches page.
 */
const BranchesPage = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const [viewMode, setViewMode] = useState("grid");
  const [createOpen, setCreateOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filterChecked, setFilterChecked] = useState({
    active: false,
    archived: false,
  });
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE,
  });
  const [sortModel, setSortModel] = useState([
    { field: "name", sort: "asc" },
  ]);

  // Derive `isArchived` from the checked set (§30.2 values):
  // neither → all; active only → active; archived only → archived;
  // both → all (no filter — covers the whole set).
  const isArchived =
    filterChecked.active && filterChecked.archived
      ? BRANCH_ISARCHIVED.ALL
      : filterChecked.active
        ? BRANCH_ISARCHIVED.ACTIVE
        : filterChecked.archived
          ? BRANCH_ISARCHIVED.ARCHIVED
          : BRANCH_ISARCHIVED.ALL;

  // Stable query arg (C21): a new object only when a dependency changes.
  // Server `sort` is a mongoose string: "field" asc / "-field" desc
  // (backend validator §30.2 allows name/createdAt only).
  const sortParam = useMemo(() => {
    const s = sortModel[0];
    if (!s || !s.field) {
      return "name";
    }
    return s.sort === "desc" ? `-${s.field}` : s.field;
  }, [sortModel]);

  const query = useMemo(
    () => ({
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      sort: sortParam,
      isArchived,
    }),
    [paginationModel.page, paginationModel.pageSize, sortParam, isArchived],
  );

  const { data, error, refetch, isFetching } = useGetBranchesQuery(query);

  // Loading gate (C21, owner directive 2026-08-31): "no content yet",
  // NOT `isLoading`. `isLoading` stays true until a request settles and
  // spins forever on a hung request; `!data && !error` flips off the
  // moment a response (success or error) arrives.
  const loading = !data && !error;

  // xs forces list view (A8) and hides the toggle (A8); on sm+ the
  // user's toggle selection drives the effective view (default grid).
  const effectiveView = isXs ? "list" : viewMode;

  // Filter badge: matched-response count (totalDocs) shown only when a
  // non-`all` filter is applied; invisible in the `all` (no filter) case.
  const filterBadge =
    isArchived === BRANCH_ISARCHIVED.ALL ? 0 : (data?.totalDocs ?? 0);

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

  const handleFilterMenuOpen = useCallback((event) => {
    setFilterAnchorEl(event.currentTarget);
  }, []);

  const handleFilterMenuClose = useCallback(() => {
    setFilterAnchorEl(null);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilterChecked((prev) => ({ ...prev, [key]: value }));
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const handleCreateOpen = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const handleCreateClose = useCallback(() => {
    setCreateOpen(false);
  }, []);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // A32: domain columns. The Actions column with lifecycle handlers is
  // added in increment C′.
  const branchColumns = useMemo(() => createBranchColumns(), []);

  return (
    <>
      <MuiPageHeader
        title={BRANCHES_COPY.header.title}
        subtitle={BRANCHES_COPY.header.subtitle}
        actions={
          <BranchesHeaderActions
            viewMode={isXs ? undefined : effectiveView}
            onViewModeChange={handleViewModeChange}
            filterBadge={filterBadge}
            onFilterMenuOpen={handleFilterMenuOpen}
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
      ) : effectiveView === "grid" ? (
        <MuiDataGrid
          rows={data.docs}
          columns={branchColumns}
          loading={isFetching}
          rowCount={data.totalDocs}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          slotProps={{
            loadingOverlay: { message: BRANCHES_COPY.loading.message },
            noRowsOverlay: { title: BRANCHES_COPY.empty.title },
          }}
        />
      ) : null}
      <BranchesFilterMenu
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={handleFilterMenuClose}
        checked={filterChecked}
        onChange={handleFilterChange}
      />
      <BranchFormDialog
        open={createOpen}
        onClose={handleCreateClose}
        isEdit={false}
      />
    </>
  );
};

export default BranchesPage;
