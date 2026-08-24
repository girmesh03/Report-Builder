/**
 * MuiTextField — all text entry (§46.4): single-line, multiline, and
 * passwords (internal eye toggle that never shifts layout or steals
 * focus). Forwards its ref to the real `<input>` element via
 * `inputRef`, the react-hook-form contract.
 *
 * Perf contract: the `slotProps.input` object and the adornment
 * elements are memoized — a fresh object identity per keystroke used
 * to re-render the whole input-adornment subtree (visible typing lag).
 */
import { useState, useCallback, useMemo, forwardRef } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

/**
 * The standard text field; helperText space is always reserved so an
 * appearing error never shifts the form (§46.4).
 * @param {Object} props - MUI TextField props plus the slice below.
 * @param {React.ReactNode} [props.startAdornment] - Leading adornment.
 * @param {React.ReactNode} [props.endAdornment] - Trailing adornment;
 *   on password fields it merges after the eye toggle.
 * @param {Object} [props.slotProps] - Merged with the internal slots.
 * @param {React.Ref} ref - Lands on the underlying input element.
 * @returns {JSX.Element} The configured field.
 */
const MuiTextField = forwardRef(
  /**
   * The standard text field; helperText space is always reserved so
   * an appearing error never shifts the form (§46.4).
   * @param {Object} props - MUI TextField props plus the slice below.
   * @param {React.ReactNode} [props.startAdornment] - Leading adornment.
   * @param {React.ReactNode} [props.endAdornment] - Trailing adornment;
   *   on password fields it merges after the eye toggle.
   * @param {Object} [props.slotProps] - Merged with the internal slots.
   * @param {React.Ref} ref - Lands on the underlying input element.
   * @returns {JSX.Element} The configured field.
   */
  (
    {
      type = "text",
      startAdornment,
      endAdornment,
      slotProps,
      helperText,
      ...rest
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const togglePassword = useCallback(() => setShowPassword((v) => !v), []);
    const isPassword = type === "password";

    /** Eye toggle keeps focus: onMouseDown prevents default blur. */
    const eyeSlot = useMemo(
      () =>
        isPassword ? (
          <InputAdornment position="end">
            <IconButton
              size="small"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={togglePassword}
              onMouseDown={(event) => event.preventDefault()}
              edge="end"
              sx={{ mr: 0.5 }}
            >
              {showPassword ? (
                <VisibilityOff fontSize="small" />
              ) : (
                <Visibility fontSize="small" />
              )}
            </IconButton>
          </InputAdornment>
        ) : null,
      [isPassword, showPassword, togglePassword],
    );

    /** Stable input slot so keystrokes never rebuild the subtree. */
    const inputSlot = useMemo(
      () => ({
        startAdornment: startAdornment ? (
          <InputAdornment position="start">{startAdornment}</InputAdornment>
        ) : undefined,
        endAdornment: eyeSlot ?? endAdornment,
        ...slotProps?.input,
      }),
      [startAdornment, eyeSlot, endAdornment, slotProps],
    );

    return (
      <TextField
        ref={ref}
        inputRef={ref}
        type={isPassword && showPassword ? "text" : type}
        size="small"
        fullWidth
        helperText={helperText ?? " "}
        slotProps={{ ...slotProps, input: inputSlot }}
        {...rest}
      />
    );
  },
);

MuiTextField.displayName = "MuiTextField";

export default MuiTextField;
