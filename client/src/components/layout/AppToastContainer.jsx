/**
 * AppToastContainer — the single toast surface of §60: react-toastify
 * appears only here and in utils/toast.js. Kept inside the error
 * boundary tree but after the outlet so feedback survives view
 * failures within a route.
 */
import { ToastContainer } from "react-toastify";
import { containerProps } from "../../utils/toast.js";

/**
 * Mounts the toast container once.
 * @returns {JSX.Element} The container.
 */
const AppToastContainer = () => {
  return <ToastContainer {...containerProps} />;
}

export default AppToastContainer;
