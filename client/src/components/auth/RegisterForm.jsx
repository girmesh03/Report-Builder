/**
 * RegisterForm — the §48.4 form: email + password + client-only
 * confirm field; the name-reveal line previews the §19.2 derived
 * name while the email is valid; success toasts once and lands on
 * `/login` — never auto-login (locked decisions 9/11).
 */
import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MuiTextField from "../reusable/MuiTextField.jsx";
import MuiButton from "../reusable/MuiButton.jsx";
import CircularProgress from "@mui/material/CircularProgress";
import {
  validateNewPassword,
  makeConfirmPasswordValidator,
} from "./validators.js";
import { useRegisterMutation } from "../../redux/features/userSlice.js";
import { showToast } from "../../utils/toast.js";
import {
  TOAST_CATALOGUE,
  REGISTER_REDIRECT_ROUTE,
} from "../../utils/constants.js";

/** Static adornments — stable identities keep typing renders cheap. */
const EMAIL_ADORNMENT = (
  <span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      sx={{ color: "action.active", fontSize: "small" }}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  </span>
);
const LOCK_ADORNMENT = (
  <span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      sx={{ color: "action.active", fontSize: "small" }}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  </span>
);

/**
 * Derives the preview name exactly as the server will (§19.2):
 * local part before `@`, `.`/`_`/`-` separators split the parts.
 * @param {string} email - Current email value.
 * @returns {string|null} "Beza Ayalew"-style preview or null.
 */
const derivePreviewName = (email) => {
  if (!email) return null;
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length === 0) return null;
  const firstName = capitalize(parts[0]);
  const lastName = capitalize(parts[1] ?? parts[0]);
  return `${firstName} ${lastName}`;
};

/**
 * Capitalizes one name part for display (§48.4 — server stores
 * lowercase; this line is an approximate preview only).
 * @param {string} part - Raw local-part segment.
 * @returns {string} The capitalized segment.
 */
const capitalize = (part) => {
  return part.charAt(0).toUpperCase() + part.slice(1);
};

/**
 * Renders and drives the registration form.
 * @returns {JSX.Element} The form.
 */
const RegisterForm = () => {
  const [registerAccount, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();
  const [previewName, setPreviewName] = useState("");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });

  /**
   * Creates the account, then routes to login with one toast.
   * @param {{email: string, password: string}} values - Form values.
   * @returns {Promise<void>}
   */
  async function onSubmit(values) {
    try {
      await registerAccount(values).unwrap();
      showToast("success", TOAST_CATALOGUE.auth.accountCreated);
      navigate(REGISTER_REDIRECT_ROUTE, { replace: true });
    } catch (error) {
      showToast("error", error?.message ?? "Registration failed");
    }
  }

  const handleEmailChange = (event) => {
    const value = event.target.value;
    setPreviewName(derivePreviewName(value));
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={1}>
        <MuiTextField
          label="Email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          startAdornment={EMAIL_ADORNMENT}
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          onChange={handleEmailChange}
          {...register("email", {
            required: "Email is required",
            validate: (value) =>
              value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                ? true
                : "Enter a valid email address",
            setValueAs: (v) => v?.trim(),
          })}
        />
        {previewName && (
          <Typography
            sx={{
              minHeight: 20,
              fontFamily: "'Noto Serif Ethiopic', 'Inter', sans-serif",
              fontSize: 12,
              color: "text.primary",
              userSelect: "none",
              mt: 0.5,
            }}
          >
            Your name will be: {previewName}
          </Typography>
        )}
        <MuiTextField
          label="Password"
          type="password"
          required
          autoComplete="new-password"
          startAdornment={LOCK_ADORNMENT}
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          {...register("password", { validate: validateNewPassword })}
        />
        <MuiTextField
          label="Confirm password"
          type="password"
          required
          autoComplete="new-password"
          startAdornment={LOCK_ADORNMENT}
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            validate: makeConfirmPasswordValidator(getValues),
          })}
        />
        <MuiButton
          type="submit"
          variant="contained"
          fullWidth
          loading={isLoading || isSubmitting}
          disabled={isLoading || isSubmitting}
          loadingIndicator={<CircularProgress size={20} />}
        >
          Sign up
        </MuiButton>
      </Stack>
    </form>
  );
};

export default RegisterForm;
