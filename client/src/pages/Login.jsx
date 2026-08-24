/**
 * Login — the session-entry page (§48.3): the sign-in sheet, brand
 * panel from lg (static), OAuth entry, sign-up link. Layout comes
 * from the router's PublicLayout; reads `state.from` via the form.
 */
import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AuthSheet from "../components/auth/AuthSheet.jsx";
import LoginForm from "../components/auth/LoginForm.jsx";
import GoogleOAuthButton from "../components/auth/GoogleOAuthButton.jsx";
import BrandPanel from "../components/auth/BrandPanel.jsx";
import { REGISTER_ROUTE } from "../utils/constants.js";

/**
 * Renders the login page.
 * @returns {JSX.Element} The page.
 */
const Login = () => {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          minHeight: "calc(100vh - 64px)",
          maxWidth: 1100,
          mx: "auto",
          px: { xs: 2, sm: 4 },
          py: 4,
        }}
      >
        <AuthSheet title="Log in">
          <LoginForm />
          <Box sx={{ mt: 1 }}>
            <GoogleOAuthButton />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
            Don&apos;t have an account?{" "}
            <Typography
              component={RouterLink}
              to={REGISTER_ROUTE}
              sx={{ color: "primary.main", textDecoration: "none" }}
            >
              Sign up
            </Typography>
          </Typography>
        </AuthSheet>
        <BrandPanel />
      </Box>
    </Box>
  );
}

export default Login;
