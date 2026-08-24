/**
 * @module utils/toast
 *
 * The single toast trigger surface (§60): `showToast` is the only
 * way any component raises feedback; react-toastify appears only
 * here and at the `AppToastContainer` mount (§41.4). Auto-dismiss
 * follows TOAST_AUTO_DISMISS_MS; the loading variant never
 * auto-dismisses and is replaced by its closing call.
 */
import { toast, Slide } from "react-toastify";
import { TOAST_AUTO_DISMISS_MS } from "./constants.js";

/** Toast variants accepted by showToast (§60.5 cadence keys). */
const VARIANTS = ["success", "info", "warning", "error", "loading"];

/**
 * Shows one toast.
 * @param {"success"|"info"|"warning"|"error"|"loading"} variant - The
 *   feedback variant.
 * @param {string} title - Bold lead line (plain end-user language).
 * @param {string} [message] - Optional supporting line.
 * @returns {string|number} The toast id — pass to dismissToast or a
 *   loading toast's update.
 */
function showToast(variant, title, message = "") {
  if (!VARIANTS.includes(variant)) {
    return toast.error(title);
  }
  return toast(`${title}${message ? `\n${message}` : ""}`, {
    type: variant === "loading" ? "info" : variant,
    isLoading: variant === "loading",
    autoClose: TOAST_AUTO_DISMISS_MS[variant],
    closeOnClick: variant !== "loading",
    closeButton: variant !== "loading",
    icon: true,
  });
}

/**
 * Dismisses one toast by id.
 * @param {string|number} id - Id returned by showToast.
 * @returns {void}
 */
function dismissToast(id) {
  toast.dismiss(id);
}

/** The react-toastify container props for the single mount (§41.4). */
const containerProps = {
  position: "bottom-right",
  transition: Slide,
  newestOnTop: true,
  pauseOnFocusLoss: false,
  theme: "colored",
};

export { showToast, dismissToast, containerProps };
