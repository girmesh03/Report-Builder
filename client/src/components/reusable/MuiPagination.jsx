/**
 * @module components/reusable/MuiPagination
 *
 * Pagination for the card/list view (§46.7, §56.7). Plain numbered
 * `Pagination` — no page-size selector (page size is fixed by the owning
 * list). Used ONLY in card/list view; MuiDataGrid owns its own footer
 * pagination (§46.8) and never uses this component (A30).
 */

import { Pagination } from "@mui/material";

/**
 * Standard numbered pagination for card/list views.
 * @param {Object} props - Component props.
 * @param {number} props.count - Total number of pages (= server `totalPages`).
 * @param {number} props.page - Current page (1-indexed).
 * @param {Function} props.onChange - Page change handler (1-indexed).
 * @param {boolean} [props.disabled] - Disable the control.
 * @param {Object} [props.sx] - Additional styles.
 * @returns {JSX.Element} The pagination component.
 */
const MuiPagination = ({ count, page, onChange, disabled, sx, ...rest }) => {
  return (
    <Pagination
      count={count}
      page={page}
      onChange={onChange}
      disabled={disabled}
      color="primary"
      size="small"
      boundaryCount={1}
      siblingCount={1}
      showFirstButton={false}
      showLastButton={false}
      sx={{
        "& .MuiPagination-ul": { gap: 0.5, justifyContent: "center" },
        "& .MuiPaginationItem-root": { minWidth: 32 },
        ...sx,
      }}
      {...rest}
    />
  );
};

export default MuiPagination;
