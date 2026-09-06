/**
 * @module components/reports/ReportsHeaderActions
 *
 * Header actions for Reports page: View toggle (List/Grid), Filter
 * button with badge, New Report button. Mirrors the Branches header
 * actions (§50/§46.12); copy sourced from REPORTS_COPY.actions.
 */

import Box from "@mui/material/Box";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import ViewList from "@mui/icons-material/ViewList";
import ViewModule from "@mui/icons-material/ViewModule";
import FilterList from "@mui/icons-material/FilterList";
import Add from "@mui/icons-material/Add";
import MuiButton from "../reusable/MuiButton.jsx";
import { REPORTS_COPY } from "../../utils/constants.js";

/**
 * Header actions for Reports page.
 * @param {Object} props - Component props.
 * @param {"list"|"grid"|undefined} props.viewMode - Current view mode.
 *   When `undefined` (xs viewport) the view toggle is hidden and the
 *   create action collapses to an icon-only button (§50).
 * @param {Function} props.onViewModeChange - View mode change handler.
 * @param {number} props.filterBadge - Matched-response count for the
 *   filter badge (0/empty when no filter is applied — badge hidden).
 * @param {Function} props.onFilterMenuOpen - Opens the filter menu
 *   (receives the click event; the clicked button anchors the menu).
 * @param {Function} props.onCreateDialogOpen - Opens create dialog.
 * @returns {JSX.Element} The header actions component.
 */
export const ReportsHeaderActions = ({
  viewMode,
  onViewModeChange,
  filterBadge = 0,
  onFilterMenuOpen,
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
          aria-label={REPORTS_COPY.actions.viewModeAria}
        >
          <ToggleButton value="list" aria-label={REPORTS_COPY.actions.listViewAria} sx={{ p: 1 }}>
            <Tooltip title={REPORTS_COPY.actions.listViewAria} arrow placement="top">
              <ViewList fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="grid" aria-label={REPORTS_COPY.actions.gridViewAria} sx={{ p: 1 }}>
            <Tooltip title={REPORTS_COPY.actions.gridViewAria} arrow placement="top">
              <ViewModule fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      )}

      {/* Filter Button with Matched-Count Badge */}
      <Tooltip title={REPORTS_COPY.actions.filterTooltip} arrow placement="top">
        <IconButton
          size="small"
          onClick={onFilterMenuOpen}
          aria-label={REPORTS_COPY.actions.filterAria}
          sx={{ border: 1, borderColor: "divider" }}
        >
          <Badge
            badgeContent={filterBadge}
            color="error"
            invisible={!filterBadge}
          >
            <FilterList fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Create Button — xs: icon-only; sm+: labeled */}
      {viewMode === undefined ? (
        <Tooltip title={REPORTS_COPY.actions.newReportTooltip} arrow placement="top">
          <IconButton
            size="small"
            onClick={onCreateDialogOpen}
            aria-label={REPORTS_COPY.actions.newReportAria}
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
          {REPORTS_COPY.empty.createLabel}
        </MuiButton>
      )}
    </Box>
  );
};

export default ReportsHeaderActions;