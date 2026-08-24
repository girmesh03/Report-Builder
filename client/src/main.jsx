/**
 * main.jsx — the only module that mounts the application (§41.3):
 * fonts → StrictMode → Provider → PersistGate → LocalizationProvider
 * (AdapterDayjs) → RouterProvider over the flat route map (ADR-025).
 * Pages load via the lazy `Component` form with literal specifiers;
 * guards, error page, and 404 ship statically (§41.3).
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { createBrowserRouter, RouterProvider } from "react-router";

import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

import App from "./App.jsx";
import AppErrorPage from "./pages/AppErrorPage.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";
import PublicRoute from "./components/layout/PublicRoute.jsx";
import PublicLayout from "./components/layout/PublicLayout.jsx";
import { store, persistor } from "./redux/app/store.js";
import LoadingSpinner from "./components/reusable/LoadingSpinner.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <AppErrorPage />,
    hydrateFallbackElement: <LoadingSpinner message="Loading…" />,
    children: [
      // Public branch — Landing browsable by guests and sessions (§41.5).
      {
        element: <PublicLayout />,
        children: [
          {
            index: true,
            lazy: { Component: () => import("./pages/Landing.jsx") },
          },
        ],
      },
      // Public-gated branch — Login and Register only (§41.5).
      {
        element: <PublicRoute />,
        children: [
          {
            element: <PublicLayout />,
            children: [
              {
                path: "login",
                lazy: { Component: () => import("./pages/Login.jsx") },
              },
              {
                path: "register",
                lazy: { Component: () => import("./pages/Register.jsx") },
              },
            ],
          },
        ],
      },
      // Protected branch — bridge until the shell/dashboard slice.
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "dashboard",
            lazy: { Component: () => import("./pages/Dashboard.jsx") },
          },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner message="Restoring session…" />} persistor={persistor}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <RouterProvider router={router} />
        </LocalizationProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
);
