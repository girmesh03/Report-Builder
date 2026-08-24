/**
 * RegisterForm — the §48.4 form: email + password + client-only
 * confirm field; the name-reveal line previews the §19.2 derived
 * name while the email is valid; success toasts once and lands on
 * `/login` — never auto-login (locked decisions 9/11).
 */
import { useNavigate } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import MuiTextField from "../reusable/MuiTextField.jsx";
import MuiButton from "../reusable/MuiButton.jsx";
import {
  EMAIL_PATTERN,
  validateEmail,
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
  <EmailIcon fontSize="small" sx={{ color: "action.active" }} />
);
const LOCK_ADORNMENT = (
  <LockIcon fontSize="small" sx={{ color: "action.active" }} />
);

/**
 * Derives the preview name exactly as the server will (§19.2):
 * local part before `@`, `.`/`_`/`-` separators split the parts.
 * @param {string} email - Current email value.
 * @returns {string|null} "beza ayalew"-style preview or null.
 */
const derivePreviewName = (email) => {
  if (!email || !EMAIL_PATTERN.test(email.trim())) {
    return null;
  }
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length === 0) {
    return null;
  }
  const firstName = capitalize(parts[0]);
  const lastName = capitalize(parts[1] ?? parts[0]);
  return `${firstName} ${lastName}`;
}

/**
 * Capitalizes one name part for display (§48.4 — server stores
 * lowercase; this line is an approximate preview only).
 * @param {string} part - Raw local-part segment.
 * @returns {string} The capitalized segment.
 */
const capitalize = (part) => {
  return part.charAt(0).toUpperCase() + part.slice(1);
}

/**
 * Renders and drives the registration form.
 * @returns {JSX.Element} The form.
 */
const RegisterForm = () => {
  const [registerAccount, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });

  const emailValue = useWatch({ control, name: "email" });
  const previewName = derivePreviewName(emailValue ?? "");

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
          {...register("email", {
            required: "Email is required",
            validate: validateEmail,
            setValueAs: (v) => v?.trim(),
          })}
        />
        {/* The §43.2 Amharic-moment analog: the sheet's single serif line */}
        <Typography
          sx={{
            minHeight: 20,
            fontFamily: "'Noto Serif Ethiopic', 'Inter', sans-serif",
            fontSize: 12,
            color: previewName ? "text.primary" : "transparent",
            userSelect: "none",
          }}
        >
          Your name will be: {previewName ?? "\u00A0"}
        </Typography>
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
          loadingIndicator="Creating account…"
        >
          Sign up
        </MuiButton>
      </Stack>
    </form>
  );
}

export default RegisterForm;
