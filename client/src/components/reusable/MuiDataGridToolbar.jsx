/**
 * @module components/reusable/MuiDataGridToolbar
 *
 * The standard DataGrid toolbar (§46.8): columns panel, filter panel, and
 * (opt-in) export dropdown. Generic and reusable — used based on the page
 * we are on; no domain copy. Per-page toolbar actions may be injected via
 * `children`.
 *
 * v9 composition: each trigger (`ColumnsPanelTrigger`, `FilterPanelTrigger`,
 * `ExportCsv`, `ExportPrint`) is merged into a single `ToolbarButton` /
 * `MenuItem` via its `render` prop (prop-merging — never nested inside
 * another button).
 *
 * Export is PER-FEATURE OPT-IN (owner 2026-08-31): a page enables the export
 * dropdown and its formats via `showExport` + `exportFormats`. Pages are
 * configured through `slotProps.toolbar` on MuiDataGrid. Branches leaves
 * export/Print off (C29); other pages may enable any combination later.
 *
 * No quick filter / search here (C29) — there is one global search on
 * MuiAppbar (later phase).
 */

import { useState, useCallback } from "react";
import {
  Toolbar,
  ToolbarButton,
  ExportCsv,
  ExportPrint,
  ColumnsPanelTrigger,
  FilterPanelTrigger,
} from "@mui/x-data-grid";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

/** Native (community) export formats the toolbar can render in the menu. */
const EXPORT_FORMAT_ITEMS = {
  csv: { label: "Download as CSV", Component: ExportCsv },
  print: { label: "Print", Component: ExportPrint },
};

/**
 * Standard reusable DataGrid toolbar.
 * @param {Object} props - Component props.
 * @param {boolean} [props.showExport=false] - Show the export dropdown +
 *   Divider. Opt-in per page (C29 — Branches leaves it off).
 * @param {string} [props.exportFileName="export"] - Base filename for CSV export.
 * @param {string[]} [props.exportFormats=["csv"]] - Export formats rendered
 *   in the menu (out of "csv" | "print").
 * @param {React.ReactNode} [props.children] - Page-specific toolbar actions.
 * @returns {JSX.Element} The toolbar component.
 */
export const MuiDataGridToolbar = ({
  showExport = false,
  exportFileName = "export",
  exportFormats = ["csv"],
  children,
  ...rest
}) => {
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const exportMenuOpen = Boolean(exportMenuAnchor);

  const handleExportMenuOpen = useCallback((event) => {
    setExportMenuAnchor(event.currentTarget);
  }, []);

  const handleExportMenuClose = useCallback(() => {
    setExportMenuAnchor(null);
  }, []);

  return (
    <Toolbar {...rest}>
      <Tooltip title="Columns" arrow placement="top">
        <ColumnsPanelTrigger render={<ToolbarButton aria-label="Toggle columns panel" />}>
          <ViewColumnIcon fontSize="small" />
        </ColumnsPanelTrigger>
      </Tooltip>
      <Tooltip title="Filters" arrow placement="top">
        <FilterPanelTrigger
          render={(props) => (
            <ToolbarButton {...props} aria-label="Toggle filter panel">
              <FilterListIcon fontSize="small" />
            </ToolbarButton>
          )}
        />
      </Tooltip>
      {showExport ? (
        <>
          <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
          <Tooltip title="Export" arrow placement="top">
            <ToolbarButton
              onClick={handleExportMenuOpen}
              aria-label="Open export menu"
              aria-controls="export-menu"
              aria-haspopup="true"
              aria-expanded={exportMenuOpen ? "true" : undefined}
            >
              <FileDownloadIcon fontSize="small" />
            </ToolbarButton>
          </Tooltip>
          <Menu
            id="export-menu"
            anchorEl={exportMenuAnchor}
            open={exportMenuOpen}
            onClose={handleExportMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              list: {
                "aria-labelledby": "export-menu",
              },
            }}
          >
            {exportFormats.map((format) => {
              const item = EXPORT_FORMAT_ITEMS[format];
              if (!item) {
                return null;
              }
              const ExportComponent = item.Component;
              return (
                <ExportComponent
                  key={format}
                  render={<MenuItem />}
                  options={format === "csv" ? { fileName: exportFileName } : undefined}
                >
                  {item.label}
                </ExportComponent>
              );
            })}
          </Menu>
        </>
      ) : null}
      {children}
    </Toolbar>
  );
};

export default MuiDataGridToolbar;
