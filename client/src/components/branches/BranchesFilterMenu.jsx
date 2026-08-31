/**
 * @module components/branches/BranchesFilterMenu
 *
 * Branches filter as a Menu (replaces the provisional §56.4/OQ-017
 * dialog): a FormControl with two checkboxes — "Active" and
 * "Archived", each with a start icon. If neither box is checked the
 * filter is `all` (no filter). Selection is applied live; the page
 * derives the `isArchived` query value and resets to page 1 (§46.7).
 */

import Menu from "@mui/material/Menu";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutlined";
import Archive from "@mui/icons-material/Archive";
import { BRANCHES_COPY } from "../../utils/constants.js";

/**
 * Branches filter menu.
 * @param {Object} props - Component props.
 * @param {boolean} props.open - Whether the menu is open.
 * @param {HTMLElement|null} props.anchorEl - Anchor element for the menu.
 * @param {Function} props.onClose - Close handler.
 * @param {{active: boolean, archived: boolean}} props.checked - Checked state.
 * @param {Function} props.onChange - Change handler `(key, value) => void`.
 * @returns {JSX.Element} The filter menu.
 */
export const BranchesFilterMenu = ({
  open,
  anchorEl,
  onClose,
  checked,
  onChange,
}) => (
  <Menu open={open} anchorEl={anchorEl} onClose={onClose}>
    <FormControl component="fieldset" sx={{ m: 1 }}>
      <FormGroup>
        <FormControlLabel
          label={BRANCHES_COPY.filter.activeLabel}
          control={
            <Checkbox
              checked={checked.active}
              onChange={(e) => onChange("active", e.target.checked)}
              size="small"
              color="primary"
              icon={<CheckCircleOutline fontSize="small" />}
              checkedIcon={<CheckCircleOutline fontSize="small" />}
            />
          }
        />
        <FormControlLabel
          label={BRANCHES_COPY.filter.archivedLabel}
          control={
            <Checkbox
              checked={checked.archived}
              onChange={(e) => onChange("archived", e.target.checked)}
              size="small"
              color="primary"
              icon={<Archive fontSize="small" />}
              checkedIcon={<Archive fontSize="small" />}
            />
          }
        />
      </FormGroup>
    </FormControl>
  </Menu>
);

export default BranchesFilterMenu;
