/**
 * NotFound — the §59.4 404 page: ships statically, reuses
 * PublicLayout via children so chrome stays consistent on any
 * unmatched URL (§47.2). Carries the scaffold's 404 art with the
 * recovery pair — Go back (history) and Home (landing).
 */
import { Link as RouterLink, useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";
import PublicLayout from "../components/layout/PublicLayout.jsx";
import MuiButton from "../components/reusable/MuiButton.jsx";
import notFoundArt from "../assets/notFound_404.svg";

/**
 * Renders the not-found page inside the public shell.
 * @returns {JSX.Element} The 404 page.
 */
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 4 },
          py: 6,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 1,
            maxWidth: 480,
          }}
        >
          <Box
            component="img"
            src={notFoundArt}
            alt=""
            aria-hidden
            sx={{ width: { xs: 220, sm: 300 }, height: "auto", mb: 2 }}
          />
          <Typography variant="body1" color="text.secondary">
            The requested page doesn&apos;t exist.
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
            <MuiButton
              variant="outlined"
              startIcon={<ArrowBackIcon fontSize="small" />}
              onClick={() => navigate(-1)}
            >
              Go back
            </MuiButton>
            <MuiButton
              component={RouterLink}
              to="/"
              variant="contained"
              startIcon={<HomeIcon fontSize="small" />}
            >
              Home
            </MuiButton>
          </Box>
        </Box>
      </Box>
    </PublicLayout>
  );
}

export default NotFound;
