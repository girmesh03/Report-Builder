/**
 * LoginForm — the §48.3 form: email + password with start
 * adornments, onBlur manual resolution, empty-submit focuses the
 * first invalid field, success navigates to `state.from` else the
 * dashboard, server errors toast (never setError).
 */
import { useNavigate, useLocation } from "react-router";
import { useForm } from "react-hook-form";
import Stack from "@mui/material/Stack";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import MuiTextField from "../reusable/MuiTextField.jsx";
import MuiButton from "../reusable/MuiButton.jsx";
import {
  validateEmail,
  validatePasswordRequired,
} from "./validators.js";
import { useLoginMutation } from "../../redux/features/userSlice.js";
import { authActions } from "../../redux/features/authSlice.js";
import { useDispatch } from "react-redux";
import { showToast } from "../../utils/toast.js";
import {
  TOAST_CATALOGUE,
  LOGIN_REDIRECT_ROUTE,
} from "../../utils/constants.js";

/** Static adornments — stable identities keep typing renders cheap. */
const EMAIL_ADORNMENT = (
  <EmailIcon fontSize="small" sx={{ color: "action.active" }} />
);
const LOCK_ADORNMENT = (
  <LockIcon fontSize="small" sx={{ color: "action.active" }} />
);

/**
 * Renders and drives the login form.
 * @returns {JSX.Element} The form.
 */
const LoginForm = () => {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });

  /**
   * Submits credentials; promotes the session mirror, toasts once,
   * and lands on `state.from` when it is a same-site route.
   * @param {{email: string, password: string}} values - Form values.
   * @returns {Promise<void>}
   */
  async function onSubmit(values) {
    try {
      const user = await login(values).unwrap();
      dispatch(authActions.authenticated(user));
      showToast("success", TOAST_CATALOGUE.auth.loggedIn);
      const from = location.state?.from;
      if (from?.pathname && !String(from.pathname).startsWith("http")) {
        navigate(`${from.pathname}${from.search ?? ""}`, { replace: true });
      } else {
        navigate(LOGIN_REDIRECT_ROUTE, { replace: true });
      }
    } catch (error) {
      showToast("error", error?.message ?? "Login failed");
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
        <MuiTextField
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          startAdornment={LOCK_ADORNMENT}
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          {...register("password", { validate: validatePasswordRequired })}
        />
        <MuiButton
          type="submit"
          variant="contained"
          fullWidth
          loading={isLoading || isSubmitting}
          disabled={isLoading || isSubmitting}
          loadingIndicator="Logging in…"
        >
          Log in
        </MuiButton>
      </Stack>
    </form>
  );
}

export default LoginForm;
