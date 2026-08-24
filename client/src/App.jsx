/**
 * App — the router root layout (§41.4, locked decision 3): AppTheme →
 * CssBaseline → error boundary → toast container → Outlet.
 * Nothing renders beside it; no page re-creates any of these.
 */
import { Outlet } from "react-router";
import { ErrorBoundary } from "react-error-boundary";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "./theme/AppTheme.jsx";
import AppToastContainer from "./components/layout/AppToastContainer.jsx";
import AppErrorPage from "./pages/AppErrorPage.jsx";

/**
 * Renders the fixed shell around every routed view.
 * @returns {JSX.Element} The root layout.
 */
const App = () => {
  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <ErrorBoundary FallbackComponent={AppErrorPage}>
        <Outlet />
      </ErrorBoundary>
      <AppToastContainer />
    </AppTheme>
  );
}

export default App;
