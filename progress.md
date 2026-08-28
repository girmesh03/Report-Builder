# Progress — Report Builder

## Session 2026-08-28 — Branch API Independent Routes (Phase 4.1)

- **Branch:** `phase-4-branches-backend-independent`
- **Implemented (7 independent routes):**
  - `GET /branches` — List with pagination, filter, sort (isArchived default=all, sort allowlist, no local search)
  - `GET /branches/:branchId` — Lightweight single branch
  - `POST /branches` — Create with duplicate check (409 exact message)
  - `PATCH /branches/:branchId` — Update with duplicate check
  - `POST /branches/:branchId/archive` — Archive (idempotent-ish)
  - `POST /branches/:branchId/restore` — Restore (idempotent-ish)
  - `DELETE /branches/:branchId` — Archive-first, reference check on Report/Item, sweeper hard-delete after 30 days
- **Deferred (cross-model/domain):**
  - `GET /branches/:branchId/detail` — Report+Item+Analytics aggregation
- **Removed:** `GET /branches/:branchId/timeline` (brainstorming added, not in spec, removed)
- **Amendments from spec (brainstorming):**
  - `isArchived` default = `all`, values `active`|`archived`|`all`
  - `sort` allowlist: `name`|`-name`|`createdAt`|`-createdAt`
  - No local `search`, no range filters
  - Branch name uniqueness: exact match after trim, case-sensitive
  - Duplicate name 409: "A branch with this name already exists"
  - Archive/Restore idempotent-ish (re-archive/restore-active = 409)
- **Fixes applied:**
  - Removed `index: true` on `user` field (spec §18.3)
  - Fixed pagination: removed invalid `leanWithId`, fixed page cap bug
  - Added race condition handling for E11000 (correct 409 message)
- **New constants:** PAGINATION_*, BRANCH_NAME_MAX_LENGTH, BRANCH_LOCATION_MAX_LENGTH
- **Files created:** 4 backend files (model, validator, controller, routes)
- **Files modified:** 2 backend files (constants, routes/index)
- **Docs updated:** project-specification.md (§30.2, §30.8, §69), findings.md, progress.md, task_plan.md
- **Gates:** `node --check` ×8 backend files ✓, `npx vite build` 0 errors ✓, `npx eslint src/` 0 warnings ✓, `dist/` deleted ✓

## Session 2026-08-26 — Branches Area Reversion Complete

- Surgical reversion of S2+S3 Branches slice executed on `phase-3-branches` branch
- Deleted all branch-specific frontend files (13 files): branch components, columns, reusable MUI components built for branches, pages, branchSlice
- Deleted all branch-specific backend files (5 files): controller, model, routes, transaction util, validators
- Restored 9 modified files to main branch state (pre-branches)
- Gates verified: `npm run build` → 0 errors, `npm run lint` → 0 errors, `dist/` deleted, `node --check` ×14 backend files → all pass
- Clean slate for iterative page-driven rebuild per owner directive

## Session 2026-08-26 — Phase 1.1 MuiSidebar Built

- Created `client/src/components/layout/MuiSidebar.jsx` with:
  - Permanent drawer md+ (≥900px), temporary overlay <md
  - Defaults to mini (72px) on md+, toggles to full (240px)
  - Mini header: lone toggle button (no logo per owner directive)
  - Navigation: Dashboard, Branches, Profile with icons
  - Active route highlighting (exact/prefix matching)
  - Avatar menu at bottom: mini=tooltip, full=Menu with Profile/Logout
  - 150ms width transition on Paper only
  - Mobile: hamburger in AppBar opens sidebar
- Created `client/src/components/layout/AppShell.jsx` integrating MuiSidebar
- Created `client/src/components/layout/AvatarMenu.jsx` for app-bar avatar dropdown
- Gates verified: build 0, lint 0, dist deleted, node --check ×14 pass

## Session 2026-08-26 — Phase 1.2 MuiAppbar Enhanced

- Modified `client/src/components/reusable/MuiAppbar.jsx`:
  - Added search placeholder (InputBase + Tooltip) in protected variant
  - Console.log on click: "Global search — not yet implemented"
  - Read-only, maxWidth 320, styled for theme
- PublicLayout verified: passes variant="public" with Logo + ThemeToggle + auth actions
- AppShell verified: passes variant="protected" with hamburger + ThemeToggle + AvatarMenu
- Gates verified: build 0, lint 0, dist deleted, node --check ×14 pass

## Session 2026-08-26 — Phase 1.3 Page Stubs + Navigation

- Created `client/src/components/reusable/MuiEmptyState.jsx` — standard placeholder surface
- Created 6 page stubs: Dashboard, Reports, ReportDetails, Branches, BranchDetails, Profile
- Modified `client/src/components/layout/MuiSidebar.jsx` — added Reports nav item (DescriptionIcon)
- Modified `client/src/main.jsx` — wired all 6 routes under AppShell with lazy loading
- Routes: /dashboard, /reports, /reports/:reportId, /branches, /branches/:branchId, /profile
- Gates verified: build 0, lint 0, dist deleted, node --check ×14 pass

## Session 2026-08-26 — Phase 1 Fixes: MUI v9 Migration + Layout Fixes

### MUI v9 Deprecation Fixes:
- **MuiSidebar.jsx**: Drawer `PaperProps` → `slotProps.paper`; Menu `PaperProps` → `slotProps.paper`; `ListItemText primaryTypographyProps` → inline Typography; Added Logo to header; centered toggle in mini mode; responsive header heights (xs=48, sm=56, md=64); avatar menu shows fullName text secondary; removed "Signed in as"; uses LogoutIcon
- **AvatarMenu.jsx**: Menu `PaperProps` → `slotProps.paper`; removed "Signed in as" disabled item; removed Divider; uses LogoutIcon; fixed transformOrigin/anchorOrigin to right-top
- **MuiAppbar.jsx**: Removed fixed height (64px); responsive heights xs=48, sm=56, md=64; `position: sticky` for protected; search placeholder uses SearchIcon + IconButton + Tooltip; removed InputBase
- **MuiEmptyState.jsx**: Flex center (fill parent) instead of fixed maxWidth+margin auto; Paper has maxWidth: 560, width: 100%

### Layout Fixes:
- **AppShell.jsx**: Leading shows Logo on desktop, hamburger on mobile; ThemeToggle stays in actions; proper sticky AppBar + scrollable Outlet siblings
- **MuiSidebar.jsx**: Header uses Logo component; toggle centered in mini mode; navigation items use fullName from backend
- **Logo.jsx**: Used in both PublicLayout and AppShell (desktop)

### Gates verified: build 0, lint 0, dist deleted, node --check ×14 pass

## Session 2026-08-26 — Phase 2: MuiSidebar 4-Issue Fix + Avatar Menu Polish

### Fixes Applied (all in MuiSidebar.jsx):
1. **Outlet width ignores sidebar** — Drawer root now has `sx={{ width: drawerWidth, flexShrink: 0 }}` (MUI permanent drawer pattern)
2. **Avatar menu X overflow** — Conditional `transformOrigin.horizontal = isMini ? 'left' : 'right'`: full opens up flush-right; mini flies out up-right, both on-screen
3. **Active nav color changed** — Replaced custom `primary.light` + white text with MUI native `selected` prop + theme defaults
4. **Mini toggle icon** — Mini = `ChevronRightIcon` (expand), Full = `ChevronLeftIcon` (collapse); both directional chevrons

### Avatar Menu Polish (this update):
- **OverflowX fix**: Menu paper now uses `minWidth: 180` + `maxWidth: "calc(100vw - 32px)"` — viewport-aware cap prevents off-screen rendering
- **Display name fix**: New `displayName` memo computes from `firstName` + `lastName` (trims, guards empty) — used in tooltip, full-mode row, and menu anchor. Removes reliance on `fullName` virtual which may not be in Redux state.
- **OverflowX fix (final)**: Added `PopperProps` with `flip` + `preventOverflow` modifiers; `maxWidth` accounts for sidebar width (full: `calc(100vw - 280px)`, mini: `calc(100vw - 120px)`); `minWidth` reduced to 160. Auto-flip prevents viewport overflow.
- **MuiButton loading indicator**: Removed string `loadingIndicator` from LoginForm; MuiButton passes through props (MUI native handles `CircularProgress` when `loading=true` + custom indicator provided, nothing otherwise).

### Gates verified: build 0, lint 0, dist deleted, node --check ×15 pass

## Session 2026-08-26 — Phase 2: MuiSidebar 4-Issue Fix

### Fixes Applied (all in MuiSidebar.jsx):
1. **Outlet width ignores sidebar** — Drawer root now has `sx={{ width: drawerWidth, flexShrink: 0 }}` (MUI permanent drawer pattern)
2. **Avatar menu X overflow** — Conditional `transformOrigin.horizontal = isMini ? 'left' : 'right'`: full opens up flush-right; mini flies out up-right, both on-screen
3. **Active nav color changed** — Replaced custom `primary.light` + white text with MUI native `selected` prop + theme defaults
4. **Mini toggle icon** — Mini = `ChevronRightIcon` (expand), Full = `ChevronLeftIcon` (collapse); both directional chevrons

### Additional Improvements:
- Nav active state uses MUI native `selected` prop + theme defaults (exact match per spec)
- Avatar menu conditional `transformOrigin` prevents X overflow in both modes
- Mini header toggle = centered `ChevronRightIcon` (expand affordance)
- Drawer root width set via `sx={{ width: drawerWidth, flexShrink: 0 }}` (fixes outlet width)

### Gates verified: build 0, lint 0, dist deleted, node --check ×14 pass

## Session 2026-08-26 — Phase 1 Fixes: MUI v9 Migration + Layout Fixes

- Owner challenged round-7 claims → full mui-mcp re-verification:
  showToolbar requirement, native selection-first export, utf8WithBom
  all confirmed against docs. Remaining bug identified: v9 slots take
  a COMPONENT — my inline arrow `() => node` is an undocumented form
  and silently never mounted.
- MuiDataGrid rewritten: module-scope `GridToolbarSurface` (constant
  identity) reads the caller's node via context; auto-showToolbar
  retained; version pinned proof `@mui/x-data-grid@9.12.0`.
- Gates: eslint EXIT=0 · build OK → dist deleted.
- NEXT: owner browser pass focused on toolbar visibility + selection-
  first export + Amharic CSV in Excel. If still hidden: live pairing
  with owner console (no further blind rounds).

## Session 2026-08-26 — Phase 1 Shell Committed + Pushed

- 22 files committed as `feat: phase 1 shell and navigation` (`e9dfb97`)
- Pushed to `phase-3-branches` (not merged)
- Content: AppShell, MuiSidebar, AvatarMenu, MuiEmptyState, 6 page stubs,
  MuiAppbar search placeholder, Logo/PublicLayout/Main.jsx wiring,
  auth review fixes (LoginForm, RegisterForm, userSlice), constants

## Session 2026-08-26 — Redux Layer Fix (normalizeResult + refresh cleanup)

**Owner directive:** "I don't want extractUser. Only centralized in apiSlice
that will work for both error and data transform."

### Issues identified:
1. `refresh` mutation exported from userSlice — dead code (never imported);
   refresh is handled internally by `baseQueryWithReauth` but fresh user
   data was discarded on success.
2. `normalizeResult` mixes two concerns: envelope unwrapping (success) +
   error transformation (failure). Owner wants single centralized function.

### Fix applied:
- Split `normalizeResult` → `unwrapEnvelope` (success, detects `data.user`
  pattern) + `normalizeError` (error, `{ status, message, fieldErrors }`)
- Deleted `extractUser` function from userSlice.js
- Deleted `refresh` mutation + `useRefreshMutation` export
- Removed `transformResponse` from login/register/googleAuth
- `baseQueryWithReauth`: dispatches `authenticated(freshUser)` on refresh
  success; uses `normalizeError` for error path only
- Added `login.matchFulfilled` listener in store.js → dispatches
  `authenticated` automatically
- Simplified LoginForm: removed manual dispatch, `useDispatch`, authActions

### Gates: lint 0, build 0, dist deleted

## Session 2026-08-26 — Login Redirect Bug Fix

**Symptom:** After login, redirected back to login; `selectAuthUser` is null.

**Root cause (2 issues in store.js):**
1. Missing side-effect import: `userSlice.js` not imported in `store.js`,
   so `apiSlice.endpoints.login` was `undefined` when the listener
   registered — the matcher never fired.
2. Custom string matcher (`action.type?.includes?.("login")`) instead
   of idiomatic `apiSlice.endpoints.login.matchFulfilled`.

**Fix applied:**
- Added `import "../features/userSlice.js"` to store.js (side-effect,
  runs before listener registration → injects login endpoint)
- Replaced custom matcher with `apiSlice.endpoints.login.matchFulfilled`

### Gates: node --check OK, lint 0, build 0, dist deleted

## Session 2026-08-26 — Phase 1 Shell Committed + Pushed

- 22 files committed as `feat: phase 1 shell and navigation` (`e9dfb97`)
- Pushed to `phase-3-branches` (not merged)
- Content: AppShell, MuiSidebar, AvatarMenu, MuiEmptyState, 6 page stubs,
  MuiAppbar search placeholder, Logo/PublicLayout/Main.jsx wiring,
  auth review fixes (LoginForm, RegisterForm, userSlice), constants

## Session 2026-08-26 — Redux Layer Fix (normalizeResult + refresh cleanup)

**Owner directive:** "I don't want extractUser. Only centralized in apiSlice
that will work for both error and data transform."

### Issues identified:
1. `refresh` mutation exported from userSlice — dead code (never imported);
   refresh is handled internally by `baseQueryWithReauth` but fresh user
   data was discarded on success.
2. `normalizeResult` mixes two concerns: envelope unwrapping (success) +
   error transformation (failure). Owner wants single centralized function.

### Fix applied:
- Split `normalizeResult` → `unwrapEnvelope` (success, detects `data.user`
  pattern) + `normalizeError` (error, `{ status, message, fieldErrors }`)
- Deleted `extractUser` function from userSlice.js
- Deleted `refresh` mutation + `useRefreshMutation` export
- Removed `transformResponse` from login/register/googleAuth
- `baseQueryWithReauth`: dispatches `authenticated(freshUser)` on refresh
  success; uses `normalizeError` for error path only
- Added `login.matchFulfilled` listener in store.js → dispatches
  `authenticated` automatically
- Simplified LoginForm: removed manual dispatch, `useDispatch`, authActions

### Gates: lint 0, build 0, dist deleted

## Session 2026-08-26 — Login Redirect Bug Fix

**Symptom:** After login, redirected back to login; `selectAuthUser` is null.

**Root cause (2 issues in store.js):**
1. Missing side-effect import: `userSlice.js` not imported in `store.js`,
   so `apiSlice.endpoints.login` was `undefined` when the listener
   registered — the matcher never fired.
2. Custom string matcher (`action.type?.includes?.("login")`) instead
   of idiomatic `apiSlice.endpoints.login.matchFulfilled`.

**Fix applied:**
- Added `import "../features/userSlice.js"` to store.js (side-effect,
  runs before listener registration → injects login endpoint)
- Replaced custom matcher with `apiSlice.endpoints.login.matchFulfilled`

### Gates: node --check OK, lint 0, build 0, dist deleted

## Session 2026-08-25 — S3 review round 7 (toolbar visibility + selection export) — BUILT

- **Toolbar root cause finally nailed:** v9 requires `showToolbar`
  EVEN when a custom `slots.toolbar` is provided — without it the
  slot never renders. MuiDataGrid now auto-sets `showToolbar` when
  its `toolbar` prop is present (override possible via rest.showToolbar).
- **Selection export = built-in:** docs confirm DataGrid exports
  SELECTED rows when any are selected, else filtered/sorted rows —
  exactly the owner's rule, zero custom code. ExportCsv now also
  passes utf8WithBom:true so Amharic survives Excel.
- checkboxSelection restored on branches grid; Columns/Filters/
  Export triggers unchanged.
- Gates: eslint EXIT=0 · build OK → dist deleted.
- NEXT: owner browser pass → approval → single commit.

## Session 2026-08-25 — S3 review round 6 (toolbar + cards) — BUILT

- MuiDataGrid contract += `toolbar` ReactNode prop (maps to v9
  toolbar slot internally); page passes <MuiDataGridToolbar
  exportFileName/> directly — zero slot plumbing at call sites.
- Toolbar contract locked per owner: Columns · Filters · Export
  triggers only; Export = standard grid CSV (filters respected,
  NEVER selection-scoped). checkboxSelection removed from the grid.
- BranchLedgerCards rebuilt to approved anatomy: identity row
  (name+chip), location line with inline right icons, inset
  dividers aligned to page padding, 64px targets, hover lift.
- Gates: eslint EXIT=0 · build OK → dist deleted · x-grid imports
  isolated to reusable belt.
- NEXT: owner browser pass → approval → single commit.

## Session 2026-08-25 — S3 review round 5 (4 directives) — BUILT

- **List/grid toggle everywhere**: view switch (grid|ledger icons)
  added to header cluster; device-first default (grid ≥900px, list
  below), sticky per session; ledger surface promoted to all sizes;
  old breakpoint display-split removed.
- **xs icon-collapse**: <sm the filter/create shell becomes three
  icon buttons (Active/Archived w/ Badge counts + ＋), tooltips carry
  labels; ≥sm keeps labeled segmented group.
- **Header labels**: MuiDataGrid skin stripped of columnHeaders
  overrides — scaffold theme owns headers again; rowHeader noted for
  a11y follow-up. Owner re-check pending; if still blank we
  instrument live with owner's console output.
- **Sidebar lag**: single width transition on paper only (150ms);
  SidebarContent memoized; AppShell callbacks stabilized via
  useCallback. Toggle verified in code-path; live feel = owner pass.
- Patch hygiene lesson: aborted python heredoc left partial edits —
  recovered by full-file duplicate sweep (imports/state/blocks).
- Gates: eslint src EXIT=0 · build OK → dist deleted.
- NEXT: owner browser pass → approval → commit.

## Session 2026-08-25 — S3 review round 4 (4 directives) — BUILT

- Sidebar toggle: mini header now a LONE toggle button (logo removed
  from mini — its hitbox was stealing taps and navigating); flex fix:
  natural list heights + explicit spacer before Logout (no stretched
  rows).
- BranchesDataGrid.jsx deleted; page renders reusable MuiDataGrid
  directly (getRowId on grid, toolbar via slots).
- Columns split: BRANCH_DATA_COLUMNS constant + getBranchActionColumn
  factory; page composes [...data, ...action].
- Windows/npm quirk logged: `npm run lint` hangs post-success — use
  `node node_modules/eslint/bin/eslint.js src` directly (EXIT=0).
- Gates: eslint src EXIT=0 · build OK → dist deleted.
- NEXT: owner browser re-pass → approval → single commit.

## Session 2026-08-25 — S3 review round 3 (7 directives) — BUILT

- mui-mcp verified: legacy GridToolbar* deprecated → new
  Toolbar/ToolbarButton/ColumnsPanelTrigger/FilterPanelTrigger/
  ExportCsv; Dialog slotProps.paper (no PaperProps in v9).
- New belt reusables: MuiDialog, MuiDataGridToolbar, MuiDataGrid
  (x-data-grid imports now isolated to components/reusable/).
- Branches page rebuilt thin: columns factory moved to
  components/columns/branchColumns.jsx (renderActions-injected);
  domain extractors BranchesDataGrid + BranchLedgerCards; strict
  fetch ladder loading→error(retry)→data(empty‖views); connected
  header group [Active n│Archived m│＋New] all small w/ pill counts.
- Shell: sidebar toggle fixed (header control zone can't clip;
  paper owns flex/border; width transition; overlay keepMounted
  dropped); Profile bridge page + route + avatar MenuItem added.
- Icon fix: PersonOutline → PersonOutlineOutlined (build catch).
- Gates: lint 0 · build 0 → dist deleted · x-grid isolation grep ✓.
- NEXT: owner browser re-pass → approval → single commit.

## Session 2026-08-25 — S3 review round 2 (8 directives + create bug) — BUILT

- **Root cause of dead create:** MUI v9 Dialog has NO `PaperProps`
  (verified via mui-mcp — only slotProps.paper); the form never
  rendered. Fixed by explicit inner <form> in BranchFormDialog on
  the new reusable **MuiDialog** (slotProps.paper outlined,
  max-height scrollable content). ConfirmDialog rebuilt: arrow +
  MuiButton-only + slotProps.paper.
- **AppShell shipped:** permanent sidebar md+ defaulting MINI
  (owner standing), overlay <md w/ hamburger; nav Dashboard+Branches
  only; AvatarMenu initials+Logout; theme toggle in bar at all
  breakpoints.
- Header cluster grouped small w/ conditional count badges (limit=1
  totalDocs probes); size-small sweep clean; zero raw Button/TextField
  outside reusable; PaperProps grep clean.
- mui-mcp consulted first (Dialog + ToggleButtonGroup APIs verified).
- Gates: lint 0 · build 0 → dist deleted · grep battery green.
- NEXT: owner browser re-pass → approval → single commit.

## Session 2026-08-25 — S2+S3 Branches area (branch phase-3-branches) — BUILT, awaiting step-5

- Contract converged with owner (4 inline comments answered: UI annex,
  ?include=full replaces /detail, combined-patch example, dialog UX);
  contract folded into task_plan.md, standalone file deleted.
- Backend S2: branch model (nameFolded unique per user), transaction
  template util, validators (create/update/list + ObjectId params),
  controller (7 asyncHandler arrows), routes mounted; auth register
  now owns its dup-copy (global 11000 copy neutralized); pagination
  constants consumed.
- Walk matrix green: create/dup-fold-409/transliteration-allowed/
  self-rename-safe/sibling-rename-409/archive+re-archive-409/filter
  both views/restore+not-archived-409/DELETE retention/foreign-404/
  bad-limit & bad-id 422 · UTF-8 Amharic round-trip proven via node
  driver. Defects fixed mid-walk: missing authenticate mount,
  nameFolded DTO leak.
- Frontend S3: branchSlice (7 endpoints, Branches tags),
  MuiConfirmDialog + MuiStatusBadge reusables, two-mode
  BranchFormDialog, Branches page (grid toolbar export/columns/
  filters, hover-reveal contextual actions, ledger cards xs/sm,
  segmented Active/Archived), bare BranchDetails pass-1, routes
  added. Lint 0 · build 0 → dist deleted.
- Integration: fresh-cookie list 200 (4 docs, clean DTOs) through
  live API; vite serves /branches. Ports freed.
- NEXT: owner step-5 browser walk → approval → single commit → push/
  merge/delete branch.

## Session 2026-08-25 — Slices S2 planning (registry closed)

## Session 2026-08-24 — Slice-1 remediation (review directives) — DONE, uncommitted

- All 21 owner directives addressed; records R1–R8 in AGENTS.md +
  task_plan (step-5-before-commit, no-blocking-commands, arrows,
  asyncHandler, zero-unused, error funnel, <domain>Slice.js,
  LocalizationProvider-once); md-mini-sidebar recorded for shell
  slice.
- Backend: LOG_ERROR_STACK env (§10.4 mirror), morgan dev log via
  winston (§26.4), toObject transform on User, asyncHandler
  controllers, retry+hook verified-present notes.
- Client: persist adapter Promises; lazy thunks .default;
  Me→User tag (§41.6/§42.6); userSlice.js rename; serverUnreachable
  copy (§60.6); MuiTextField memoized slots + hoisted adornments +
  no per-keystroke clearErrors (lag fix); disabled-while-pending
  submits; small icons sweep; NotFound with notFound_404.svg.
- Mirrors: §69.3.8 record; gates lint 0 / build 0 / dist deleted /
  node --check pass. NOTHING COMMITTED — awaiting step-5 re-pass.

## Session 2026-08-24 — Slice 1 (branch phase-2-auth-area) — COMPLETE, awaiting step-5

- Phase A committed (`0efc387`): backend foundation + auth surface,
  live curl matrix green (see findings).
- Phase B built: client utils, redux spine (persist + reauth chain),
  entry/router/guards, belt subset, PublicLayout, auth pages +
  structural landing + bridge dashboard. Gates: eslint 0 · vite build
  0 → dist deleted · grep battery clean · browser-origin smoke green.
  Spec mirrors: §11.3 += 4 rows; §69.3.7 slice record.
- NEXT: owner step-5 review → on approval commit 2 + push + merge +
  delete branch. Ports free.

## Session 2026-08-24 — Increment P1 (branch: phase-1-foundations)

- Brainstorming + Step-1.1 identification completed with the owner;
  design approved after two corrections (known-or-amended-only rule;
  no speculative constants).
- Sub-task 0 done: `AGENTS.md` standing scope rule inserted verbatim.
- Working files initialized (this set).
- All 4 backend modules created; §69.3.6 amendment record added.
  Gate evidence: syntax ×4 PASS · fail-fast exit 1 naming all 7
  required vars (with .env hidden, then restored) · success exit 0 ·
  freeze/deepFreeze/httpStatus probes true · process.env isolated to
  env.js · zero console.* / numeric status literals in new files.
- Step-5 owner review PASSED (2026-08-24): rule definitions refined
  once more before approval — known/amended clarified, define-on-
  require added, noted in AGENTS.md + §69.3.6 + this file set.
- NEXT: none — increment closed. Next session opens slice 1 (auth):
  read these working files first per §66.3. Servers never started;
  ports free.