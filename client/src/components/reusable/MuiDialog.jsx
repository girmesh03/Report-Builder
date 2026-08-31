/**
 * @module components/reusable/MuiDialog
 *
 * The only dialog wrapper (§46.10); `MuiConfirmDialog` and `MuiDatePicker`
 * mobile mode build on it; the search dialog is the one exception (§46.15,
 * standalone). All dialogs in the app must use this wrapper.
 */

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

/**
 * Renders a standardized dialog with consistent behavior across the app.
 * @param {Object} props - Component props.
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {Function} props.onClose - Called when the dialog requests close.
 * @param {string} [props.title] - Dialog title (renders DialogTitle when given).
 * @param {React.ReactNode} props.children - Dialog body content.
 * @param {React.ReactNode} [props.actions] - Footer actions (renders DialogActions).
 * @param {"xs"|"sm"|"md"|"lg"|"xl"|false} [props.maxWidth="sm"] - Max width breakpoint.
 * @param {boolean} [props.fullWidth=true] - Whether dialog stretches to maxWidth.
 * @param {boolean} [props.disableEnforceFocus=true] - Disable focus enforcement.
 * @param {boolean} [props.disableRestoreFocus=true] - Disable restore focus.
 * @param {Object} [props.sx] - Additional styles.
 * @returns {JSX.Element} The dialog component.
 */
export const MuiDialog = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true,
  disableEnforceFocus = true,
  disableRestoreFocus = true,
  ...rest
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      disableEnforceFocus={disableEnforceFocus}
      disableRestoreFocus={disableRestoreFocus}
      {...rest}
      slotProps={{
        paper: {
          sx: { backgroundImage: "none" },
        },
      }}
    >
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent dividers>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
};

export default MuiDialog;
