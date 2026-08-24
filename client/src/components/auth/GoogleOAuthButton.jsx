/**
 * GoogleOAuthButton — the shared OAuth entry (§48.5): outline,
 * full-width, Google mark start adornment; shows its spinner until
 * the §28.6 flow resolves. Today that flow is the stub — the toast
 * carries its 404 copy.
 */
import Box from "@mui/material/Box";
import MuiButton from "../reusable/MuiButton.jsx";
import { useGoogleAuthMutation } from "../../redux/features/userSlice.js";
import { showToast } from "../../utils/toast.js";

/** The four-color Google "G" mark, inline SVG (no icon-pack asset). */
const GoogleMark = () => {
  return (
    <Box
      component="svg"
      aria-hidden
      viewBox="0 0 48 48"
      sx={{ width: 16, height: 16, display: "block" }}
    >
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Box>
  );
}

/**
 * Renders the OAuth entry button.
 * @param {Object} props - Component props.
 * @param {boolean} [props.disabled] - Disables alongside a submitting form.
 * @returns {JSX.Element} The button.
 */
const GoogleOAuthButton = ({ disabled = false }) => {
  const [googleAuth, { isLoading }] = useGoogleAuthMutation();

  /** Runs the stub flow and surfaces its plain-language result. */
  const handleClick = async () => {
    try {
      await googleAuth().unwrap();
    } catch (error) {
      showToast("error", error?.message ?? "Google sign-in failed");
    }
  };

  return (
    <MuiButton
      variant="outlined"
      fullWidth
      loading={isLoading}
      disabled={disabled}
      onClick={() => void handleClick()}
      startIcon={<GoogleMark />}
    >
      Continue with Google
    </MuiButton>
  );
}

export default GoogleOAuthButton;
