/**
 * @module components/reusable/MuiConfirmDialog
 *
 * Standard confirmation dialog built on MuiDialog (§46.10). Used for
 * destructive actions (archive, restore, delete) and other confirmations.
 */

import MuiDialog from "./MuiDialog.jsx";
import MuiButton from "./MuiButton.jsx";
import Typography from "@mui/material/Typography";

/**
 * Renders a confirmation dialog.
 * @param {Object} props - Component props.
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {Function} props.onClose - Called when the dialog requests close.
 * @param {string} props.title - Dialog title.
 * @param {string} props.message - Confirmation message.
 * @param {Function} props.onConfirm - Called when user confirms.
 * @param {string} props.confirmLabel - Text for confirm button.
 * @param {"primary"|"error"|"warning"} [props.color="primary"] - Confirm button color.
 * @returns {JSX.Element} The confirmation dialog.
 */
export const MuiConfirmDialog = ({
  open,
  onClose,
  title,
  message,
  onConfirm,
  confirmLabel,
  color = "primary",
}) => (
  <MuiDialog
    open={open}
    onClose={onClose}
    title={title}
    maxWidth="sm"
    fullWidth
    actions={
      <>
        <MuiButton variant="text" onClick={onClose}>Cancel</MuiButton>
        <MuiButton variant="contained" color={color} onClick={onConfirm}>
          {confirmLabel}
        </MuiButton>
      </>
    }
  >
    <Typography variant="body1" color="text.secondary">
      {message}
    </Typography>
  </MuiDialog>
);

export default MuiConfirmDialog;