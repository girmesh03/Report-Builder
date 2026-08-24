/**
 * MuiPageHeader — the standard header strip (§46.12): title +
 * optional subtitle on one line, right-side actions slot, hairline
 * rule beneath — the §43.2 motif every page opens with.
 */
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/**
 * Renders the page header.
 * @param {Object} props - Component props.
 * @param {string} props.title - Page title (truncates, never wraps).
 * @param {string} [props.subtitle] - Optional supporting line.
 * @param {React.ReactNode} [props.actions] - Right-aligned slot.
 * @returns {JSX.Element} The header block.
 */
const MuiPageHeader = ({ title, subtitle, actions }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        mb: 2,
        pb: 1,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="h4"
          noWrap
          sx={{ maxWidth: "100%", lineHeight: 1.25 }}
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" noWrap>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      {actions ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          {actions}
        </Box>
      ) : null}
    </Box>
  );
}

export default MuiPageHeader;
