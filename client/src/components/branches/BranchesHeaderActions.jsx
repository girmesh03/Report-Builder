/**
 * @module components/branches/BranchesHeaderActions
 *
 * Header actions for Branches page: View toggle (List/Grid),
 * Filter button with badge, New Branch button.
 */

import Box from "@mui/material/Box";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import { ViewList, ViewModule, FilterList, Add } from "@mui/icons-material";
import MuiButton from "../reusable/MuiButton.jsx";

/**
 * Header actions for Branches page.
 * @param {Object} props - Component props.
 * @param {"list"|"grid"|undefined} props.viewMode - Current view mode.
 *   When `undefined` (xs viewport) the view toggle is hidden and the
 *   create action collapses to an icon-only button (§56.4).
 * @param {Function} props.onViewModeChange - View mode change handler.
 * @param {boolean} props.showArchived - Show archived state.
 * @param {Function} props.onFilterDialogOpen - Opens filter dialog.
 * @param {Function} props.onCreateDialogOpen - Opens create dialog.
 * @returns {JSX.Element} The header actions component.
 */
export const BranchesHeaderActions = ({
  viewMode,
  onViewModeChange,
  showArchived,
  onFilterDialogOpen,
  onCreateDialogOpen,
}) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {/* View Toggle — sm+ only (hidden on xs via undefined viewMode) */}
      {viewMode !== undefined && (
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, v) => {
            if (v !== null) onViewModeChange(v);
          }}
          size="small"
          aria-label="View mode"
        >
          <ToggleButton value="list" aria-label="List view" sx={{ p: 1 }}>
            <Tooltip title="List view" arrow placement="top">
              <ViewList fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="grid" aria-label="Grid view" sx={{ p: 1 }}>
            <Tooltip title="Grid view" arrow placement="top">
              <ViewModule fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      )}

      {/* Filter Button with Badge */}
      <Tooltip title="Filter" arrow placement="top">
        <IconButton
          size="small"
          onClick={onFilterDialogOpen}
          aria-label="Filter branches"
          sx={{ border: 1, borderColor: "divider" }}
        >
          <Badge
            badgeContent={showArchived ? 1 : 0}
            color="error"
            invisible={!showArchived}
          >
            <FilterList fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Create Button — xs: icon-only; sm+: labeled */}
      {viewMode === undefined ? (
        <Tooltip title="New branch" arrow placement="top">
          <IconButton
            size="small"
            onClick={onCreateDialogOpen}
            aria-label="New branch"
            color="primary"
            sx={{ border: 1, borderColor: "divider" }}
          >
            <Add fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : (
        <MuiButton
          variant="contained"
          startIcon={<Add fontSize="small" />}
          onClick={onCreateDialogOpen}
        >
          New branch
        </MuiButton>
      )}
    </Box>
  );
};

export default BranchesHeaderActions;
