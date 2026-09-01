/**
 * @module components/columns/branches
 *
 * Column definitions for Branches DataGrid (§56.3). Includes the Status
 * badge column and the Actions column (branch lifecycle actions, A38 —
 * finished in increment C′).
 *
 * Column widths are NEVER hardcoded (C31) — each column uses `flex` +
 * `minWidth` so the grid distributes the full horizontal space
 * proportionally (Name/Location weighted larger, Status/Created compact).
 */

import MuiStatusBadge from "../reusable/MuiStatusBadge.jsx";
import BranchRowActions from "../branches/BranchRowActions.jsx";
import { formatEthiopianDate } from "../../utils/ethiopianDate.js";

/**
 * Branch DataGrid column definitions.
 * @param {Object} [actions] - Lifecycle handler bundle for the Actions column.
 * @param {Function} actions.onView - View handler.
 * @param {Function} actions.onEdit - Edit handler.
 * @param {Function} actions.onArchive - Archive handler.
 * @param {Function} actions.onRestore - Restore handler.
 * @param {Function} actions.onDelete - Delete handler.
 * @param {Function} actions.getActionLoading - `(branchId) => "archive"|"restore"|"delete"|null`.
 * @returns {Array} Column definitions for MuiDataGrid.
 */
export const createBranchColumns = ({
  onView,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  getActionLoading,
} = {}) => [
  {
    field: "name",
    headerName: "Name",
    flex: 2,
    minWidth: 200,
    renderCell: (params) => (
      <span
        style={{
          fontFamily: "Noto Serif Ethiopic",
          fontWeight: 600,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "block",
        }}
      >
        {params.value}
      </span>
    ),
  },
  {
    field: "location",
    headerName: "Location",
    flex: 2,
    minWidth: 160,
    sortable: false,
    renderCell: (params) => (
      <span
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "block",
        }}
      >
        {params.value}
      </span>
    ),
  },
  {
    field: "isArchived",
    headerName: "Status",
    flex: 1,
    minWidth: 120,
    sortable: false,
    renderCell: (params) => (
      <MuiStatusBadge
        status={params.value ? "archived" : "active"}
        variant="branchActive"
      />
    ),
  },
  {
    field: "createdAt",
    headerName: "Created",
    flex: 1,
    minWidth: 120,
    valueFormatter: (v) => formatEthiopianDate(v) ?? "—",
  },
  {
    field: "actions",
    headerName: "Actions",
    flex: 1,
    minWidth: 180,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    renderCell: (params) => (
      <BranchRowActions
        branch={params.row}
        actionLoading={getActionLoading?.(params.row._id) ?? null}
        onView={onView}
        onEdit={onEdit}
        onArchive={onArchive}
        onRestore={onRestore}
        onDelete={onDelete}
      />
    ),
  },
];

export default createBranchColumns;
