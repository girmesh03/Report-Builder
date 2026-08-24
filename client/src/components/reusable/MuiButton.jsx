/**
 * MuiButton — the single button of the product (§46.3): defaults to
 * size="small", uses MUI's native loading state, and never shrinks
 * on flex. Icon-only buttons stay raw IconButton — never this.
 */
import Button from "@mui/material/Button";

/**
 * Renders the standard button; unlisted props pass through (§46.2).
 * @param {Object} props - MUI Button props plus children.
 * @param {string} [props.size] - Defaults to `small`.
 * @param {Object} [props.sx] - Merged after the flex-shrink guard.
 * @returns {JSX.Element} The configured button.
 */
const MuiButton = ({ size = "small", sx, ...rest }) => {
  return (
    <Button
      size={size}
      sx={{ flexShrink: 0, ...sx }}
      {...rest}
    />
  );
}

export default MuiButton;
