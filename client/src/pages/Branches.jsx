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
import { useNavigate } from "react-router";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import MuiPageHeader from "../components/reusable/MuiPageHeader.jsx";
import BranchesHeaderActions from "../components/branches/BranchesHeaderActions.jsx";
import BranchesFilterMenu from "../components/branches/BranchesFilterMenu.jsx";
import BranchFormDialog from "../components/branches/BranchFormDialog.jsx";
import MuiDataGrid from "../components/reusable/MuiDataGrid.jsx";
import MuiPagination from "../components/reusable/MuiPagination.jsx";
import MuiConfirmDialog from "../components/reusable/MuiConfirmDialog.jsx";
import BranchLedgerCard from "../components/branches/BranchLedgerCard.jsx";
import { createBranchColumns } from "../components/columns/branches.jsx";
import LoadingSpinner from "../components/reusable/LoadingSpinner.jsx";
import MuiErrorState from "../components/reusable/MuiErrorState.jsx";
import MuiEmptyState from "../components/reusable/MuiEmptyState.jsx";
import {
  useGetBranchesQuery,
  useArchiveBranchMutation,
  useRestoreBranchMutation,
  useDeleteBranchMutation,
} from "../redux/features/branchesSlice.js";
import { showToast } from "../utils/toast.js";
import {
  BRANCHES_COPY,
  BRANCH_ISARCHIVED,
  TOAST_CATALOGUE,
} from "../utils/constants.js";

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
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filterChecked, setFilterChecked] = useState({
    active: false,
    archived: false,
  });
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE,
  });
  const [sortModel, setSortModel] = useState([{ field: "name", sort: "asc" }]);

  // B′ lifecycle state (A33-A36, A38): ONE form dialog driven by `dialog`
  // (`{mode:"create"}` | `{mode:"edit", branch}` — owner review), the
  // confirm-dialog payload (type + branch).
  const [dialog, setDialog] = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  // Per-row loading scope (A34, owner review). Because RTK Query mutation
  // `isLoading` is a single hook-wide boolean (not per-target), it would make
  // every card spin. Instead track the exact branch being acted on so only
  // that row's icon shows the in-flight action.
  const [pendingBranch, setPendingBranch] = useState(null);

  const navigate = useNavigate();
  const [archiveBranch] = useArchiveBranchMutation();
  const [restoreBranch] = useRestoreBranchMutation();
  const [deleteBranch] = useDeleteBranchMutation();

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
    setDialog({ mode: "create" });
  }, []);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Lifecycle handlers (B′). Each open/confirm is `useCallback`-stabilized
  // with correct deps (C12); confirm runs the mutation then toasts (C27).
  const handleView = useCallback(
    (branch) => {
      navigate(`/branches/${branch._id}`);
    },
    [navigate],
  );

  const handleEdit = useCallback((branch) => {
    setDialog({ mode: "edit", branch });
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialog(null);
  }, []);

  const handleConfirmOpen = useCallback((type, branch) => {
    setConfirmState({ type, branch });
  }, []);

  const handleConfirmClose = useCallback(() => {
    setConfirmState(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!confirmState) {
      return;
    }
    const { type, branch } = confirmState;
    setConfirmState(null);
    setPendingBranch({ id: branch._id, type });
    try {
      let message;
      if (type === "archive") {
        await archiveBranch(branch._id).unwrap();
        message = TOAST_CATALOGUE.branches.archived;
      } else if (type === "restore") {
        await restoreBranch(branch._id).unwrap();
        message = TOAST_CATALOGUE.branches.restored;
      } else if (type === "delete") {
        await deleteBranch(branch._id).unwrap();
        message = TOAST_CATALOGUE.branches.deleted;
      }
      showToast("success", message);
    } catch (error) {
      showToast("error", error?.message ?? BRANCHES_COPY.error.title);
    } finally {
      setPendingBranch(null);
    }
  }, [confirmState, archiveBranch, restoreBranch, deleteBranch]);

  const handlePaginationChange = useCallback((event, page) => {
    setPaginationModel((prev) => ({ ...prev, page: page - 1 }));
  }, []);

  // A32: domain columns. The Actions column with lifecycle handlers is
  // added in increment C′ (A38).
  const branchColumns = useMemo(() => createBranchColumns(), []);

  // Confirm-dialog copy derived from the pending action type (§56.6).
  const confirmConfig = useMemo(() => {
    if (!confirmState) {
      return null;
    }
    const name = confirmState.branch?.name ?? "";
    switch (confirmState.type) {
      case "archive":
        return {
          title: BRANCHES_COPY.confirm.archiveTitle,
          message: BRANCHES_COPY.confirm.archiveMessage(name),
          confirmLabel: BRANCHES_COPY.confirm.archiveLabel,
          color: "warning",
        };
      case "restore":
        return {
          title: BRANCHES_COPY.confirm.restoreTitle,
          message: BRANCHES_COPY.confirm.restoreMessage(name),
          confirmLabel: BRANCHES_COPY.confirm.restoreLabel,
          color: "primary",
        };
      case "delete":
        return {
          title: BRANCHES_COPY.confirm.deleteTitle,
          message: BRANCHES_COPY.confirm.deleteMessage(name),
          confirmLabel: BRANCHES_COPY.confirm.deleteLabel,
          color: "error",
        };
      default:
        return null;
    }
  }, [confirmState]);

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
        <LoadingSpinner
          message={BRANCHES_COPY.loading.message}
          minHeight="80%"
        />
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
      ) : (
        <Stack spacing={2}>
          <Grid container spacing={2}>
            {data.docs.map((branch) => (
              <Grid key={branch._id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <BranchLedgerCard
                  branch={branch}
                  actionLoading={
                    pendingBranch?.id === branch._id ? pendingBranch.type : null
                  }
                  onView={() => handleView(branch)}
                  onEdit={() => handleEdit(branch)}
                  onArchive={() => handleConfirmOpen("archive", branch)}
                  onRestore={() => handleConfirmOpen("restore", branch)}
                  onDelete={() => handleConfirmOpen("delete", branch)}
                />
              </Grid>
            ))}
          </Grid>
          {data.totalPages > 1 && (
            <MuiPagination
              count={data.totalPages}
              page={paginationModel.page + 1}
              onChange={handlePaginationChange}
            />
          )}
        </Stack>
      )}
      <BranchesFilterMenu
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={handleFilterMenuClose}
        checked={filterChecked}
        onChange={handleFilterChange}
      />
      <BranchFormDialog
        open={Boolean(dialog)}
        onClose={handleDialogClose}
        isEdit={dialog?.mode === "edit"}
        initialData={dialog?.mode === "edit" ? dialog.branch : undefined}
      />
      {confirmConfig && (
        <MuiConfirmDialog
          open={Boolean(confirmState)}
          onClose={handleConfirmClose}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmLabel={confirmConfig.confirmLabel}
          color={confirmConfig.color}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
};

export default BranchesPage;
