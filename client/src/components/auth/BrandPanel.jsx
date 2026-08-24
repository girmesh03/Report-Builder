/**
 * BrandPanel — the static left panel beside the auth sheets from lg
 * (§48.3): the ruled dictation desk motif, fully drawn — the
 * waveform animation is landing-only and never animates here.
 */
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/** The static ruled-desk motif: hairlines + one settled waveform line. */
function RuledDesk() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "relative",
        height: 220,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        "& .rule": {
          borderTop: 1,
          borderColor: "divider",
        },
      }}
    >
      {[0, 1, 2, 3, 4].map((row) => (
        <span className="rule" key={row} />
      ))}
      <Box
        component="svg"
        viewBox="0 0 320 60"
        preserveAspectRatio="none"
        sx={{
          position: "absolute",
          inset: 0,
          m: "auto",
          width: "86%",
          height: 60,
        }}
      >
        <path
          d="M2 30 C 20 6, 34 54, 52 30 S 84 8, 102 30 132 52, 150 30 182 10, 200 30 232 50, 250 30 284 14, 318 30"
          fill="none"
          stroke="var(--template-palette-primary-main)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity={0.55}
        />
      </Box>
    </Box>
  );
}

/**
 * Renders the brand panel.
 * @returns {JSX.Element} The panel column.
 */
function BrandPanel() {
  return (
    <Box
      sx={{
        display: { xs: "none", lg: "flex" },
        flexDirection: "column",
        justifyContent: "center",
        gap: 3,
        px: 8,
      }}
    >
      <Typography variant="h4" sx={{ letterSpacing: "-0.5px" }}>
        Daily supervision reports,
        <br />
        in Amharic
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Speak your branch visit — the report writes itself, ready for
        the boss.
      </Typography>
      <RuledDesk />
    </Box>
  );
}

export default BrandPanel;
