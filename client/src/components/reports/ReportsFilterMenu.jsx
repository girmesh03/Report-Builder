/**
 * @module components/reports/ReportsFilterMenu
 *
 * Reports filter as a Menu (§50/§46.14): three sections, each a
 * **select-one RadioGroup** (one at a time, owner 2026-09-01) — Archive
 * (All/Active/Archived), Generated (All/Generated/Not generated), and
 * Branch (All + the supervisor's branches, Q1 single-select). Divider
 * separators + captions; no icons. Selection is applied live; the page
 * derives the `GET /reports` query params (`isArchived`/`generated`/
 * `branch`) and resets to page 1 (§31.3).
 */

import Menu from "@mui/material/Menu";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Divider from "@mui/material/Divider";
import { useGetBranchesQuery } from "../../redux/features/branchesSlice.js";
import {
  BRANCH_ISARCHIVED,
  BRANCH_FILTER_LIST_LIMIT,
  REPORTS_COPY,
} from "../../utils/constants.js";

/**
 * Reports filter menu.
 * @param {Object} props - Component props.
 * @param {boolean} props.open - Whether the menu is open.
 * @param {HTMLElement|null} props.anchorEl - Anchor element for the menu.
 * @param {Function} props.onClose - Close handler.
 * @param {{archive: string, generated: string, branch: string}} props.checked
 *   - Checked state; `archive` ∈ all|active|archived, `generated` ∈
 *   all|true|false, `branch` = "all" or a branch `_id`.
 * @param {Function} props.onChange - Change handler `(key, value) => void`.
 * @returns {JSX.Element} The filter menu.
 */
export const ReportsFilterMenu = ({
  open,
  anchorEl,
  onClose,
  checked,
  onChange,
}) => {
  // Branch filter candidates — ALL the user's branches (a filter must cover
  // branches that may hold archived reports; BR-14 keeps refs valid).
  const { data: branchesData } = useGetBranchesQuery({
    page: 1,
    limit: BRANCH_FILTER_LIST_LIMIT,
    sort: "name",
    isArchived: BRANCH_ISARCHIVED.ALL,
  });
  const branches = branchesData?.docs ?? [];

  return (
    <Menu open={open} anchorEl={anchorEl} onClose={onClose}>
      <FormControl component="fieldset" sx={{ m: 1 }}>
        <FormLabel component="legend">
          {REPORTS_COPY.filter.sections.archive}
        </FormLabel>
        <RadioGroup
          value={checked.archive}
          onChange={(e) => onChange("archive", e.target.value)}
        >
          <FormControlLabel
            value={BRANCH_ISARCHIVED.ALL}
            control={<Radio size="small" />}
            label={REPORTS_COPY.filter.allLabel}
          />
          <FormControlLabel
            value={BRANCH_ISARCHIVED.ACTIVE}
            control={<Radio size="small" />}
            label={REPORTS_COPY.filter.activeLabel}
          />
          <FormControlLabel
            value={BRANCH_ISARCHIVED.ARCHIVED}
            control={<Radio size="small" />}
            label={REPORTS_COPY.filter.archivedLabel}
          />
        </RadioGroup>

        <Divider sx={{ my: 1 }} />

        <FormLabel component="legend">
          {REPORTS_COPY.filter.sections.generated}
        </FormLabel>
        <RadioGroup
          value={checked.generated}
          onChange={(e) => onChange("generated", e.target.value)}
        >
          <FormControlLabel
            value="all"
            control={<Radio size="small" />}
            label={REPORTS_COPY.filter.allLabel}
          />
          <FormControlLabel
            value="true"
            control={<Radio size="small" />}
            label={REPORTS_COPY.filter.generatedLabel}
          />
          <FormControlLabel
            value="false"
            control={<Radio size="small" />}
            label={REPORTS_COPY.filter.notGeneratedLabel}
          />
        </RadioGroup>

        <Divider sx={{ my: 1 }} />

        <FormLabel component="legend">
          {REPORTS_COPY.filter.sections.branch}
        </FormLabel>
        <RadioGroup
          value={checked.branch}
          onChange={(e) => onChange("branch", e.target.value)}
        >
          <FormControlLabel
            value="all"
            control={<Radio size="small" />}
            label={REPORTS_COPY.filter.allLabel}
          />
          {branches.map((branch) => (
            <FormControlLabel
              key={branch._id}
              value={branch._id}
              control={<Radio size="small" />}
              label={branch.name}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Menu>
  );
};

export default ReportsFilterMenu;