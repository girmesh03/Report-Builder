/**
 * @module components/columns/branches
 *
 * Column definitions for Branches DataGrid (§56.3). Includes the Status
 * badge column. The Actions column (branch lifecycle actions) is added in
 * increment C′ (§56.3).
 *
 * Column widths are NEVER hardcoded (C31) — each column uses `flex` +
 * `minWidth` so the grid distributes the full horizontal space
 * proportionally (Name/Location weighted larger, Status/Created compact).
 */

import MuiStatusBadge from "../reusable/MuiStatusBadge.jsx";
import { formatEthiopianDate } from "../../utils/ethiopianDate.js";

/**
 * Branch DataGrid column definitions.
 * @returns {Array} Column definitions for MuiDataGrid.
 */
export const createBranchColumns = () => [
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
];

export default createBranchColumns;