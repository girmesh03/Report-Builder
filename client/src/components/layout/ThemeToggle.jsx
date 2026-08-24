/**
 * ThemeToggle — the light/dark switch of both bars (§47.5): flips
 * the MUI color scheme behind `data-mui-color-scheme` (§43.4).
 */
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useColorScheme } from "@mui/material/styles";

/**
 * Renders the scheme toggle; icons resolve through roles so they
 * read in either scheme.
 * @returns {JSX.Element} The icon button.
 */
function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  const isLight = mode === "light";
  return (
    <Tooltip title={isLight ? "Dark mode" : "Light mode"}>
      <IconButton
        size="small"
        aria-label="Toggle color scheme"
        onClick={() => setMode(isLight ? "dark" : "light")}
      >
        {isLight ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
}

export default ThemeToggle;
