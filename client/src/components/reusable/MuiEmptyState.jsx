/**
 * @module components/reusable/MuiEmptyState
 *
 * The standard empty/placeholder surface (§46.14). Fills its parent (page
 * body today, MuiDataGrid empty overlay tomorrow) and centers the card;
 * only the inner card caps its width.
 */

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import MuiButton from "./MuiButton.jsx";

/**
 * Renders the empty/placeholder state.
 * @param {Object} props - Component props.
 * @param {string} props.title - Main title.
 * @param {string} [props.description] - Supporting description.
 * @param {{label: string, onClick: Function}} [props.action] - Optional action button.
 * @param {React.ReactNode} [props.icon] - Optional icon to display above title.
 * @param {number} [props.minHeight=320] - Minimum height of the empty state container.
 * @param {Object} [props.sx] - Additional styles.
 * @returns {JSX.Element} The empty state.
 */
const MuiEmptyState = ({ title, description, action, icon, minHeight = 320, sx, ...rest }) => (
  <Box
    sx={{
      width: "100%",
      minHeight,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...sx,
    }}
    {...rest}
  >
    <Paper variant="outlined" sx={{ maxWidth: 560, width: "100%", p: { xs: 3, sm: 5 } }}>
      {icon && <Typography variant="caption" sx={{ color: "text.secondary", mb: 1, textAlign: "center" }}>{icon}</Typography>}
      <Typography variant="h5" sx={{ mt: 1, textAlign: "center" }}>{title}</Typography>
      {description && <Typography variant="body1" color="text.secondary" sx={{ mt: 1, textAlign: "center" }}>{description}</Typography>}
      {action && <MuiButton variant="contained" onClick={action.onClick} sx={{ mt: 3, mx: "auto", display: "block" }}>{action.label}</MuiButton>}
    </Paper>
  </Box>
);

export default MuiEmptyState;