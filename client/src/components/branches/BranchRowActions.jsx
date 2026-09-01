/**
 * @module components/branches/BranchRowActions
 *
 * Row actions for Branches DataGrid (§56.3, §56.6).
 * Icons with tooltips for View, Edit, Archive/Restore, Delete.
 */

import { Box, Tooltip, IconButton } from "@mui/material";
import {
  Visibility,
  Edit,
  Archive,
  Restore,
  Delete,
} from "@mui/icons-material";

/**
 * Row actions for Branches DataGrid.
 * @param {Object} props - Component props.
 * @param {Object} props.branch - Branch data.
 * @param {Function} props.onView - View handler.
 * @param {Function} props.onEdit - Edit handler.
 * @param {Function} props.onArchive - Archive handler.
 * @param {Function} props.onRestore - Restore handler.
 * @param {Function} props.onDelete - Delete handler.
 * @returns {JSX.Element} The row actions component.
 */
export const BranchRowActions = ({
  branch,
  onView,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}) => (
  <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
    <Tooltip title="View">
      <IconButton size="small" onClick={onView} aria-label="View branch">
        <Visibility fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="Edit">
      <IconButton size="small" onClick={onEdit} aria-label="Edit branch" color="action">
        <Edit fontSize="small" />
      </IconButton>
    </Tooltip>
    {branch.isArchived ? (
      <>
        <Tooltip title="Restore">
          <IconButton size="small" onClick={onRestore} aria-label="Restore branch" color="success">
            <Restore fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={onDelete} aria-label="Delete branch">
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </> 
    ) : (
      <Tooltip title="Archive">
        <IconButton size="small" onClick={onArchive} aria-label="Archive branch" color="warning">
          <Archive fontSize="small" />
        </IconButton>
      </Tooltip>
    )}
  </Box>
);

export default BranchRowActions;