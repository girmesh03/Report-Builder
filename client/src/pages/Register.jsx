/**
 * Register — the self-service registration page (§48.4): the same
 * sign-in sheet family with the name-reveal moment, OAuth entry,
 * login link. Post-registration always lands on `/login`.
 */
import { Link as RouterLink } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AuthSheet from "../components/auth/AuthSheet.jsx";
import RegisterForm from "../components/auth/RegisterForm.jsx";
import GoogleOAuthButton from "../components/auth/GoogleOAuthButton.jsx";
import BrandPanel from "../components/auth/BrandPanel.jsx";
import { LOGIN_ROUTE } from "../utils/constants.js";

/**
 * Renders the register page.
 * @returns {JSX.Element} The page.
 */
const Register = () => {
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
        <AuthSheet title="Sign up">
          <RegisterForm />
          <Box sx={{ mt: 1 }}>
            <GoogleOAuthButton />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
            Already have an account?{" "}
            <Typography
              component={RouterLink}
              to={LOGIN_ROUTE}
              sx={{ color: "primary.main", textDecoration: "none" }}
            >
              Log in
            </Typography>
          </Typography>
        </AuthSheet>
        <BrandPanel />
      </Box>
    </Box>
  );
}

export default Register;
