/**
 * @module components/reusable/MuiStatusBadge
 *
 * Read-only presentation of status — a non-interactive, color-coded chip
 * (§46.13). Used for branch status (Active/Archived) and report status.
 */

import Chip from "@mui/material/Chip";

/**
 * Renders a status badge.
 * @param {Object} props - Component props.
 * @param {string} props.status - Status value (required).
 * @param {"report"|"branchActive"} [props.variant="report"] - Variant determines color mapping.
 * @returns {JSX.Element} The status badge.
 */
const MuiStatusBadge = ({ status, variant = "report" }) => {
  const colors = variant === "branchActive"
    ? { active: "success", archived: "default" }
    : { draft: "default", audio_attached: "warning", transcribed: "info", generated: "primary" };

  const label = variant === "branchActive"
    ? (status === "archived" ? "Archived" : "Active")
    : status;

  return (
    <Chip
      label={label}
      size="small"
      color={colors[status] || "default"}
      variant="outlined"
      sx={{ fontWeight: 500 }}
    />
  );
};

export default MuiStatusBadge;