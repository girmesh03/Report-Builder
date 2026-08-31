/**
 * @module components/reusable/MuiDataGrid
 *
 * Standardized DataGrid wrapper for server-side lists (§46.8). MUI X v9
 * API: controlled `paginationModel`/`sortModel`, `paginationMode="server"`
 * and `sortingMode="server"`, `pageSizeOptions`, `rowCount`. Generic and
 * consumer-driven — the owning page supplies its `columns` and any
 * overriding `slots` / `slotProps` (overlays, toolbar). The wrapper itself
 * hardcodes no domain copy (C30).
 *
 * Overlays (C30): the default `loadingOverlay` / `noRowsOverlay` slots are
 * the existing `LoadingSpinner` / `MuiEmptyState`; the owning page feeds
 * their props through `slotProps.loadingOverlay` / `slotProps.noRowsOverlay`.
 * These appear only for in-grid refetch/pagination feedback — page-level
 * states stay with the page.
 *
 * No quick filter / search anywhere (C29) — there is one global search on
 * MuiAppbar (later phase). No checkbox selection (no bulk action). Column
 * resizing is disabled (C31) — widths are driven by the domain column
 * definitions (`flex` + `minWidth`, never hardcoded `width`).
 */

import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import MuiDataGridToolbar from "./MuiDataGridToolbar.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";
import MuiEmptyState from "./MuiEmptyState.jsx";
import { ROWS_PER_PAGE_OPTIONS } from "../../utils/constants.js";

/**
 * Default loading overlay — the shared LoadingSpinner, copy fed via
 * `slotProps.loadingOverlay.message`.
 * @param {Object} props - Overlay props.
 * @returns {JSX.Element} The loading overlay.
 */
const DefaultLoadingOverlay = ({ message }) => (
  <LoadingSpinner message={message} minHeight="100%" />
);

/**
 * Default no-rows overlay — the shared MuiEmptyState, copy fed via
 * `slotProps.noRowsOverlay` (`title`, `description`, `action`, `icon`).
 * @param {Object} props - Overlay props.
 * @returns {JSX.Element} The empty overlay.
 */
const DefaultNoRowsOverlay = (props) => (
  <MuiEmptyState {...props} minHeight={320} />
);

/**
 * Standardized DataGrid with server-side pagination/sort.
 * @param {Object} props - Component props.
 * @param {Array} props.rows - Row data.
 * @param {Array} props.columns - Column definitions (domain-owned).
 * @param {boolean} props.loading - Whether an in-grid refetch is in flight.
 * @param {number} props.rowCount - Total row count (= server `totalDocs`).
 * @param {{page: number, pageSize: number}} props.paginationModel - v9 model (0-indexed page).
 * @param {Function} props.onPaginationModelChange - Pagination model change handler.
 * @param {Array} props.sortModel - v9 sort model.
 * @param {Function} props.onSortModelChange - Sort model change handler.
 * @param {number} [props.maxHeight=600] - Max height of the grid container.
 * @param {Object} [props.sx] - Additional styles.
 * @param {Object} [props.slots] - Consumer override of any grid slot.
 * @param {Object} [props.slotProps] - Consumer props for any grid slot.
 * @param {Object} [props.rest] - Remaining DataGrid props.
 * @returns {JSX.Element} The DataGrid component.
 */
export const MuiDataGrid = ({
  rows,
  columns,
  loading = false,
  rowCount,
  paginationModel,
  onPaginationModelChange,
  sortModel,
  onSortModelChange,
  maxHeight = 600,
  sx,
  slots,
  slotProps,
  ...rest
}) => {
  return (
    <Box sx={{ width: "100%", maxHeight, ...sx }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        rowCount={rowCount}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        paginationMode="server"
        sortingMode="server"
        pageSizeOptions={ROWS_PER_PAGE_OPTIONS}
        getRowId={(row) => row._id}
        density="compact"
        rowHeight={52}
        disableColumnResize
        showToolbar
        slots={{
          toolbar: MuiDataGridToolbar,
          loadingOverlay: DefaultLoadingOverlay,
          noRowsOverlay: DefaultNoRowsOverlay,
          ...slots,
        }}
        slotProps={{
          ...slotProps,
        }}
        {...rest}
      />
    </Box>
  );
};

export default MuiDataGrid;
