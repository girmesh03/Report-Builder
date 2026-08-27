/**
 * MuiEmptyState — the standard empty/placeholder surface (§46.14).
 * Fills its parent (page body today, MuiDataGrid empty overlay
 * tomorrow) and centers the card; only the inner card caps its width.
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
 * @returns {JSX.Element} The empty state.
 */
const MuiEmptyState = ({ title, description, action }) => (
  <Box
    sx={{
      width: "100%",
      minHeight: 320,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Paper variant="outlined" sx={{ maxWidth: 560, width: "100%", p: { xs: 3, sm: 5 } }}>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        COMING SOON
      </Typography>
      <Typography variant="h5" sx={{ mt: 1 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          {description}
        </Typography>
      )}
      {action && (
        <MuiButton variant="contained" onClick={action.onClick} sx={{ mt: 3 }}>
          {action.label}
        </MuiButton>
      )}
    </Paper>
  </Box>
);

export default MuiEmptyState;
