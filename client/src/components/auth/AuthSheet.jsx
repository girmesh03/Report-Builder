/**
 * AuthSheet — the shared sign-in-sheet skeleton (§48.3/§48.4): a
 * border-only paper card carrying the entry datum
 * (`TODAY · {EC date}`, tabular digits) on its header strip and one
 * full-height left margin hairline — the page's ledger identity.
 */
import { useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import MuiPageHeader from "../reusable/MuiPageHeader.jsx";
import { formatEthiopianDatum } from "../../utils/ethiopianDate.js";

/**
 * Wraps one auth form in the sheet surface.
 * @param {Object} props - Component props.
 * @param {string} props.title - Sheet title ("Log in" / "Sign up").
 * @param {React.ReactNode} props.children - Form + OAuth + links.
 * @returns {JSX.Element} The sheet card.
 */
function AuthSheet({ title, children }) {
  const datum = useMemo(() => formatEthiopianDatum(), []);
  return (
    <Paper
      variant="outlined"
      sx={{
        position: "relative",
        width: { xs: "100%", sm: 420, lg: 480 },
        mx: "auto",
        p: { xs: 2.5, sm: 4 },
        pl: { xs: 3, sm: 4.5 },
        overflow: "hidden",
      }}
    >
      {/* full-height left margin hairline — the sheet's ruling */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: { xs: 1.25, sm: 2 },
          borderLeft: 2,
          borderColor: "divider",
        }}
      />
      <MuiPageHeader
        title={title}
        actions={
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            }}
          >
            TODAY · {datum}
          </Typography>
        }
      />
      {children}
    </Paper>
  );
}

export default AuthSheet;
