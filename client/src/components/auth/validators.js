/**
 * @module components/auth/validators
 *
 * Client-side manual-resolver rules for the auth forms (§48.3/§48.4
 * error copy). Server errors never route through these — toasts own
 * them (§42.4); these feed only react-hook-form `setError`-style
 * inline validation.
 */

/** Format rule shared by both forms (§48.3 table). */
export const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Minimum password length (§48.4; mirrors the §29 chain). */
export const PASSWORD_MIN_LENGTH = 8;

/**
 * Resolves the email field error, if any.
 * @param {string} value - Field value.
 * @returns {string|undefined} The error message or undefined when valid.
 */
function validateEmail(value) {
  if (!value?.trim()) {
    return "Email is required";
  }
  if (!EMAIL_PATTERN.test(value.trim())) {
    return "Enter a valid email address";
  }
  return undefined;
}

/**
 * Resolves the login password field error, if any.
 * @param {string} value - Field value.
 * @returns {string|undefined} The error message or undefined when valid.
 */
function validatePasswordRequired(value) {
  return value ? undefined : "Password is required";
}

/**
 * Resolves the registration password error, if any.
 * @param {string} value - Field value.
 * @returns {string|undefined} The error message or undefined when valid.
 */
function validateNewPassword(value) {
  if (!value) {
    return "Password is required";
  }
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  return undefined;
}

/**
 * Builds the confirm-password resolver bound to the current password.
 * @param {Function} getValues - RHF getValues accessor.
 * @returns {Function} Resolver for the confirmPassword field.
 */
function makeConfirmPasswordValidator(getValues) {
  return (value) => {
    if (!value) {
      return "Please confirm your password";
    }
    return value === getValues("password") ? undefined : "Passwords must match";
  };
}

export {
  validateEmail,
  validatePasswordRequired,
  validateNewPassword,
  makeConfirmPasswordValidator,
};
