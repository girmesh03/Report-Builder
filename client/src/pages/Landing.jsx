/**
 * Landing — the product's front door (§48.2), structural slice-1
 * form: hero with the ruled dictation desk (waveform rendered fully
 * drawn; animation polish amends later), branches strip,
 * how-it-works loop, CTA band, footer. Browsable by guests and
 * authenticated sessions alike.
 */
import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import MuiButton from "../components/reusable/MuiButton.jsx";
import { REGISTER_ROUTE, LOGIN_ROUTE, APP_NAME } from "../utils/constants.js";

/** Hairline rules + the spoken-report waveform, fully drawn (static). */
const HeroDesk = () => {
  return (
    <Box
      aria-hidden
      sx={{
        position: "relative",
        height: { xs: 130, md: 170 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        "& .rule": { borderTop: 1, borderColor: "divider" },
      }}
    >
      {[0, 1, 2, 3, 4].map((row) => (
        <span className="rule" key={row} />
      ))}
      <Box
        component="svg"
        viewBox="0 0 320 60"
        preserveAspectRatio="none"
        sx={{ position: "absolute", inset: 0, m: "auto", width: "88%", height: 56 }}
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

const LOOP_STEPS = [
  { step: "01", title: "Speak", copy: "Dictate the branch visit in Amharic, on site." },
  { step: "02", title: "Review", copy: "The transcript becomes the report's eight-line story." },
  { step: "03", title: "Send", copy: "Correct in your own words, then hand it to the boss." },
];

/**
 * Renders the landing page (structural form).
 * @returns {JSX.Element} The page.
 */
const Landing = () => {
  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4 } }}>
        {/* 1 — Hero */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0,5fr) minmax(0,7fr)" },
            alignItems: "center",
            gap: { xs: 3, md: 8 },
            py: { xs: 6, md: 10 },
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", letterSpacing: 1 }}>
              SPEAK · SIGN · SEND
            </Typography>
            <Typography variant="h2" sx={{ mt: 1, letterSpacing: "-0.5px" }}>
              Daily supervision reports,
              <br />
              in Amharic
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: 460 }}>
              The area supervisor speaks the visit; Report Builder writes
              the eight-line report the boss reads.
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
              <MuiButton component={RouterLink} to={REGISTER_ROUTE} variant="contained">
                Sign up
              </MuiButton>
              <MuiButton component={RouterLink} to={LOGIN_ROUTE} variant="outlined">
                Log in
              </MuiButton>
            </Box>
          </Box>
          <HeroDesk />
        </Box>

        {/* 2 — Branches strip */}
        <Box sx={{ borderTop: 1, borderBottom: 1, borderColor: "divider", py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Your branches · your names · your reports — managed under Branches once you sign in.
          </Typography>
        </Box>

        {/* 3 — How it works */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: { xs: 2, md: 6 },
            py: { xs: 5, md: 8 },
          }}
        >
          {LOOP_STEPS.map(({ step, title, copy }) => (
            <Box key={step}>
              <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600 }}>
                {step}
              </Typography>
              <Typography variant="h6" sx={{ mt: 0.5 }}>{title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {copy}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* 4 — CTA band */}
        <Box
          sx={{
            borderTop: 1,
            borderColor: "divider",
            py: { xs: 5, md: 7 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography variant="h5">Start today's report</Typography>
          <MuiButton component={RouterLink} to={REGISTER_ROUTE} variant="contained">
            Sign up
          </MuiButton>
        </Box>

        {/* 5 — Footer */}
        <Box sx={{ borderTop: 1, borderColor: "divider", py: 3, pb: 5 }}>
          <Typography variant="caption" color="text.secondary">
            {APP_NAME} © 2026 — built for restaurant-chain supervision.
          </Typography>
        </Box>
      </Container>
  );
}

export default Landing;
