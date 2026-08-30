/**
 * @module components/reusable/MuiPageHeader
 *
 * MuiPageHeader — the standard header strip (§46.12): title +
 * optional subtitle on one line, right-side actions slot, hairline
 * rule beneath — the §43.2 motif every page opens with.
 * One-line rule: the header is always a single row — the title
 * is `noWrap` with an ellipsis (`maxWidth: 100%`) so a long title
 * truncates instead of wrapping or crowding the actions; the
 * `actions` slot is `flexShrink: 0` at the right end.
 */

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/**
 * Renders the page header.
 * @param {Object} props - Component props.
 * @param {string} props.title - Page title (truncates, never wraps).
 * @param {string} [props.subtitle] - Optional supporting line.
 * @param {React.ReactNode} [props.actions] - Right-aligned slot.
 * @param {boolean} [props.hideSubtitle] - Force-hide subtitle; when
 *   unset the subtitle auto-hides below 600px portrait (§46.12).
 * @param {boolean} [props.hideTitle] - Force-hide title; when unset
 *   the title auto-hides below 600px portrait (§46.12) so the header
 *   reduces to the actions slot on xs.
 * @returns {JSX.Element} The header block.
 */
const MuiPageHeader = ({
  title,
  subtitle,
  actions,
  hideSubtitle,
  hideTitle,
}) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const subtitleHidden = hideSubtitle !== undefined ? hideSubtitle : isXs;
  const titleHidden = hideTitle !== undefined ? hideTitle : isXs;

  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ mb: 2, flexWrap: "nowrap", alignItems: "center" }}
    >
      {!titleHidden && (
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant={isXs ? "h6" : "h4"}
            noWrap
            sx={{ maxWidth: "100%", lineHeight: 1.25, minWidth: 0 }}
          >
            {title}
          </Typography>
          {subtitle && !subtitleHidden && (
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ minWidth: 0 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
      <Box sx={{ flexGrow: 1, minWidth: 0 }} />
      {actions ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexShrink: 0,
            minWidth: 0,
          }}
        >
          {actions}
        </Box>
      ) : null}
    </Stack>
  );
};

export default MuiPageHeader;
