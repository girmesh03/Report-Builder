/**
 * @module components/branches/BranchRowActions
 *
 * Row actions for the Branches DataGrid (§56.3, §56.6). Mirrors the
 * BranchLedgerCard action bar (owner review): icon buttons with tooltips,
 * per-action inline loading (A34) — when `actionLoading` matches an action a
 * small spinner replaces just that icon; sibling actions stay live.
 *
 * Conventions (§44.2): icon colors are set via `sx` (`sx={{ color:
 * '<palette>.main' }}`), never the `color` prop; tree-shaken single imports
 * (no `@mui/material` barrel). A disabled IconButton is wrapped in a `<span>`
 * inside the Tooltip so a disabled element still fires pointer events for the
 * tooltip (MUI "Disabled elements" fix).
 */

import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Visibility from "@mui/icons-material/Visibility";
import Edit from "@mui/icons-material/Edit";
import Archive from "@mui/icons-material/Archive";
import Restore from "@mui/icons-material/Restore";
import Delete from "@mui/icons-material/Delete";

/**
 * Renders one row action as an icon button with inline loading.
 * @param {Object} props - Component props.
 * @param {string} props.action - The action key (`edit`|`archive`|`restore`|`delete`).
 * @param {import("react").ReactNode} props.icon - The action icon.
 * @param {string} props.label - Accessible/tooltip label.
 * @param {string} props.color - MUI color token (`primary.main`, …) for `sx`.
 * @param {Function} props.onClick - The action handler.
 * @param {string|null} [props.actionLoading] - The action in flight.
 * @returns {JSX.Element} The action button.
 */
const RowActionButton = ({
  action,
  onClick,
  icon,
  label,
  color,
  actionLoading,
}) => {
  const loading = actionLoading === action;
  return (
    <Tooltip title={loading ? "Working…" : label}>
      <span>
        <IconButton
          size="small"
          onClick={onClick}
          aria-label={label}
          disabled={loading}
          sx={{ color }}
        >
          {loading ? <CircularProgress size={16} /> : icon}
        </IconButton>
      </span>
    </Tooltip>
  );
};

/**
 * Row actions for Branches DataGrid.
 * @param {Object} props - Component props.
 * @param {Object} props.branch - Branch data (row).
 * @param {"edit"|"archive"|"restore"|"delete"|null} [props.actionLoading] -
 *   The lifecycle action in flight on this row (drives per-action loading).
 * @param {Function} props.onView - View handler `(branch) => void` (navigate to detail page).
 * @param {Function} props.onEdit - Edit handler `(branch) => void` (opens seeded dialog).
 * @param {Function} props.onArchive - Archive handler `(branch) => void`.
 * @param {Function} props.onRestore - Restore handler `(branch) => void`.
 * @param {Function} props.onDelete - Delete handler `(branch) => void`.
 * @returns {JSX.Element} The row actions component.
 */
export const BranchRowActions = ({
  branch,
  actionLoading = null,
  onView,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}) => (
  <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
    <RowActionButton
      action="view"
      onClick={() => onView(branch)}
      icon={<Visibility fontSize="small" />}
      label="View"
      color="primary.main"
    />
    <RowActionButton
      action="edit"
      onClick={() => onEdit(branch)}
      icon={<Edit fontSize="small" />}
      label="Edit"
      color="info.main"
    />
    {branch.isArchived ? (
      <>
        <RowActionButton
          action="restore"
          onClick={() => onRestore(branch)}
          icon={<Restore fontSize="small" />}
          label="Restore"
          color="success.main"
          actionLoading={actionLoading}
        />
        <RowActionButton
          action="delete"
          onClick={() => onDelete(branch)}
          icon={<Delete fontSize="small" />}
          label="Delete"
          color="error.main"
          actionLoading={actionLoading}
        />
      </>
    ) : (
      <RowActionButton
        action="archive"
        onClick={() => onArchive(branch)}
        icon={<Archive fontSize="small" />}
        label="Archive"
        color="warning.main"
        actionLoading={actionLoading}
      />
    )}
  </Box>
);

export default BranchRowActions;
