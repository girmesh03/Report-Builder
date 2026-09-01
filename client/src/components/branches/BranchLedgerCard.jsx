/**
 * @module components/branches/BranchLedgerCard
 *
 * Card view for a branch in list mode (§56.3, §56.7). Styling relies on the
 * theme customizations (`MuiCard`, `MuiCardHeader`, `MuiCardContent`,
 * `MuiCardActions` — §46 theme) — this file adds only the layout/color this
 * branch card needs, no hand-rolled padding/border (owner review, 2026-08-31).
 *
 * Anatomy (owner, 2026-08-31): CardHeader with a first-letter Avatar
 * (deterministic color via `getAvatarColor`, §46.8), title = branch name,
 * subheader = status chip; a location row and a date row (Created when
 * active / Archived when archived); a divider before the action row. The
 * action bar is per-action with inline loading (A34): only the in-flight
 * action's icon is replaced by a spinner.
 *
 * Conventions: CardHeader title is a direct `<Typography>` child (no
 * `titleTypographyProps` — §44.2 deprecated-slot-prop ban); action icon
 * colors are set via `sx` (`sx={{ color: '<palette>.main' }}`), never the
 * `color` prop (§44.2). Tree-shaken single imports only (§44.2).
 */

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Visibility,
  Edit,
  Archive,
  Restore,
  Delete,
  LocationOn,
  EventNote,
} from "@mui/icons-material";
import MuiStatusBadge from "../reusable/MuiStatusBadge.jsx";
import { formatEthiopianDate } from "../../utils/ethiopianDate.js";
import { getAvatarColor } from "../../utils/avatarColor.js";

/**
 * Renders one action as an icon button with inline loading: when
 * `actionLoading` matches its action, a small spinner replaces just that
 * icon (A34, per-mutation loading); sibling actions stay live (owner).
 *
 * The disabled IconButton is wrapped in a `<span>` inside the Tooltip so a
 * disabled element still fires pointer events for the tooltip (MUI "Disabled
 * elements" fix); the color is applied via `sx`, never the `color` prop
 * (§44.2).
 * @param {Object} props - Component props.
 * @param {string} props.action - The action key (`archive`|`restore`|`delete`).
 * @param {import("react").ReactNode} props.icon - The action icon.
 * @param {string} props.label - Accessible/tooltip label.
 * @param {string} props.color - MUI color token (`primary.main`, …) for `sx`.
 * @param {Function} props.onClick - The action handler.
 * @param {string|null} [props.actionLoading] - The action in flight.
 * @returns {JSX.Element} The action button.
 */
const ActionButton = ({ action, onClick, icon, label, color, actionLoading }) => {
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
 * Branch card for list view.
 * @param {Object} props - Component props.
 * @param {Object} props.branch - Branch data.
 * @param {boolean} [props.showActions=true] - Show the lifecycle action bar (A38).
 * @param {"archive"|"restore"|"delete"|null} [props.actionLoading] - Which
 *   lifecycle action is in flight on this branch (drives per-action loading).
 * @param {Function} props.onView - View handler (navigate to detail page).
 * @param {Function} props.onEdit - Edit handler (opens seeded dialog).
 * @param {Function} props.onArchive - Archive handler.
 * @param {Function} props.onRestore - Restore handler.
 * @param {Function} props.onDelete - Delete handler.
 * @returns {JSX.Element} The branch card.
 */
export const BranchLedgerCard = ({
  branch,
  showActions = true,
  actionLoading = null,
  onView,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}) => {
  const active = !branch.isArchived;
  const dateLabel = active ? "Created" : "Archived";
  const dateValue = active ? branch.createdAt : branch.archivedAt;
  const formattedDate = dateValue ? formatEthiopianDate(dateValue) : "—";

  return (
    <Card
      variant="outlined"
      sx={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <CardHeader
        avatar={
          <Avatar
            sx={{
              bgcolor: getAvatarColor(branch.name),
              fontWeight: 600,
              textTransform: "uppercase",
            }}
            aria-hidden="true"
          >
            {branch.name?.[0] ?? "?"}
          </Avatar>
        }
        title={<Typography variant="h6" noWrap>{branch.name}</Typography>}
        subheader={
          <MuiStatusBadge status={active ? "active" : "archived"} variant="branchActive" />
        }
      />

      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <LocationOn fontSize="small" sx={{ color: "text.secondary" }} />
          {branch.location}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <EventNote fontSize="small" sx={{ color: "text.secondary" }} />
          {dateLabel} {formattedDate}
        </Typography>
      </CardContent>

      {showActions && (
        <>
          <Divider sx={{ mt: 1 }} />
          <CardActions sx={{ mt: 1, justifyContent: "flex-end", gap: 0.5 }}>
            <ActionButton
              action="view"
              onClick={onView}
              icon={<Visibility fontSize="small" />}
              label="View"
              color="primary.main"
            />
            <ActionButton
              action="edit"
              onClick={onEdit}
              icon={<Edit fontSize="small" />}
              label="Edit"
              color="info.main"
            />
            {active ? (
              <ActionButton
                action="archive"
                onClick={onArchive}
                icon={<Archive fontSize="small" />}
                label="Archive"
                color="warning.main"
                actionLoading={actionLoading}
              />
            ) : (
              <>
                <ActionButton
                  action="restore"
                  onClick={onRestore}
                  icon={<Restore fontSize="small" />}
                  label="Restore"
                  color="success.main"
                  actionLoading={actionLoading}
                />
                <ActionButton
                  action="delete"
                  onClick={onDelete}
                  icon={<Delete fontSize="small" />}
                  label="Delete"
                  color="error.main"
                  actionLoading={actionLoading}
                />
              </>
            )}
          </CardActions>
        </>
      )}
    </Card>
  );
};

export default BranchLedgerCard;
