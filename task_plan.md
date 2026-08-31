# Task Plan — Report Builder

Governing Rule #1 — **KNOWN OR AMENDED ONLY** (owner directive,
2026-08-24, mirrored in `AGENTS.md`): every single thing must be done
for only known or amended things. **Known** = logically valid or
already established (the §1 problem statement; decisions settled
earlier such as `[auth → branches → reports]`; naturally-valid sets
like HTTP status codes) — spec text alone makes nothing known.
**Amended** = what the task's Step-1.1 identification explicitly
decides, with same-commit mirrors. **Define on require:** a
spec-declared item not yet amended stays out even if the spec
schedules it now; it is created when a real consumer requires it, in
its proper place — proven need plus reason. Universal across
constants, env vars, directories, structures, features,
dependencies.

Governing Rule #2 — **STEP-5 REVIEW BEFORE COMMIT** (owner directive,
2026-08-24): no commit of any kind until the owner reviews the diff
and approves. One commit set per increment, post-approval only.

Governing Rule #4 — **ADD → COMMIT → PUSH ONLY, NO MERGE** (owner
directive, 2026-08-31): increments are pushed to their feature branch
and **never merged / never deleted** during active work. Interim
commits on `phase-N-description` are intermediate, not done yet; the
branch is merged only when the owner closes the phase.

Governing Rule #5 — **ONE THING AT A TIME** (owner directive,
2026-08-31): each commit is a single-scope increment. We are not done
yet; later phases/tasks continue from the pushed state. Respect the
"still in progress" status — do not treat an intermediate commit as a
closed increment (see progress.md).

Governing Rule #3 — **NO LONG-BLOCKING COMMANDS** (owner directive,
2026-08-24): never run `node server.js` (even backgrounded with
redirection) through the session shell — it holds the pipe. Spawn
detached via `cmd //c start`, poll separately with sub-second
`curl -m 2`, kill by PID from `netstat`. Builds (~5 s) run alone.

Shell-slice binding note (owner directive, 2026-08-24): when the
AppShell/AppSidebar slice is built, **md+ defaults to `mini` mode**
(amends §47.4's full-default; amend §47.4 in that slice's opening
change set).

## Program plan of record (owner directives, 2026-08-24)

- Sequencing: **vertical slices by domain area** — a small specific
  backend area, then integration with its small specific frontend
  counterpart, then sync. If an area cannot reach sync, backend first
  then frontend.
- No client-side mock adapter is ever built; the §66.10 adapter plan
  and its P7 deletion gate are moot.
- Canonical §66 phase order yields to dependency-driven slices:
  `[auth → branches → reports → …]`.
- The §52 wizard is dropped (superseded UX); its sections and
  constants stay out of the codebase until re-confirmed.
- Every slice runs the §9.8 six-step protocol on its own feature
  branch, with the step-5 approval gate before any commit.

## Increment 1 — P1 Foundations & configuration (branch: phase-1-foundations)

| # | Sub-task | Status |
| --- | --- | --- |
| 0 | AGENTS.md standing scope rule insert | done |
| 1 | Pre-git: branch `phase-1-foundations` | done |
| 2 | Working files initialized (this set) | done |
| 3 | `backend/config/env.js` — frozen §10.4 env, lookup chain, fail-fast | done |
| 4 | `backend/utils/constants.js` — skeleton + deepFreeze only | done |
| 5 | `backend/utils/httpStatus.js` — frozen §11.6 map | done |
| 6 | `backend/server.js` — fail-fast boot prototype | done |
| 7 | Spec mirrors: §69 amendment record (§15.4 needed no edits — paths already listed) | done |
| 8 | Gates: node --check ×4 · fail-fast demo · freeze probe · greps · hygiene | done |
| 9 | Step-5 diff presentation → owner approval → post-git | pending |

Deferred to their first consuming slice (recorded decision): all of
`client/src/utils/*`, every domain constant group (auth/rate-limits
join with the auth slice), the addisai SDK singleton.

## Slice roadmap after P1 — Iterative Page-Driven Rebuild (branch `phase-rebuild-branches`)

### Phase 0: Reversion — COMPLETE ✓
- All branch-specific files deleted, modified files restored to main branch state
- Gates: build 0, lint 0, dist deleted, node --check pass

### Phase 1: Branches Page (`/branches`) — Top-to-Bottom Sections

| Section | Spec | Status |
|---------|------|--------|
| 1.1 Page Header (MuiPageHeader + Filter ButtonGroup + New Branch) | §56.2, §56.4, §46.12 | pending |
| 1.2 Presentation Toggle (Grid ↔ Ledger, device-first default) | §56.3, §56.7 | pending |
| 1.3 MuiDataGrid View (columns, toolbar, selection, hover actions, pagination) | §56.3, §46.8, §56.6 | pending |
| 1.4 Branch Ledger Cards View (ruled entries, identity row, inline actions) | §56.3, §56.7 | pending |
| 1.5 Filter Dialog — PROVISIONAL (Show-Archived only, OQ-017) | §56.4, OQ-017 | pending |
| 1.6 Create/Edit Branch Dialog (MuiDialog + form, validation, submit) | §56.4, §46.17 | pending |
| 1.7 Confirm Dialogs (Archive/Restore/Delete copy, variants) | §56.6 | pending |
| 1.8 States & Empty States (loading, error, empty, archived-empty) | §56.7, §60 | pending |
| 1.9 Branch Slice (RTK Query: 7 endpoints, Branches tags) | §56, §42 | pending |

### Phase 2: Branch Details Page (`/branches/:branchId`) — Top-to-Bottom

| Section | Spec | Status |
|---------|------|--------|
| 2.1 Route & Data Fetch (single aggregate call, states) | §56.5, §30.2.1 | pending |
| 2.2 Signboard Header (Noto Serif Ethiopic name, location, status badge) | §56.5, §43.2 | pending |
| 2.3 Reports Grid (exact §50 surface, OQ-016 suppress pagination) | §56.5, §50, OQ-016 | pending |
| 2.4 Analytics (charts per §49.4 conventions) | §56.5, §49.4 | pending |
| 2.5 Items (activities/issues/comments groups per §24A) | §56.5, §24A | pending |

### Phase 3: Profile Page (`/profile`) — Top-to-Bottom (§57)

| Section | Spec | Status |
|---------|------|--------|
| 3.1 Page Header (title, subtitle, Logout action) | §57.2 | pending |
| 3.2 ID-Card Face (48px avatar + camera, fullName serif, position, hairline) | §57.3, §43.2 | pending |
| 3.3 Profile Form (position display-only, names editable, avatar upload) | §57.3, §46.4, §46.17 | pending |
| 3.4 States (loading, error, failed PATCH keeps values) | §57.6 | pending |

### Phase 4: Routing Integration
- Protected branch: AppShell → Dashboard, Branches, BranchDetails, Profile
- Catch-all as LAST CHILD of root layout (§41.3)

---

**Methodology per section (Plan Mode → Build Mode):**
1. Read spec + cross-refs
2. mui-mcp research for exact MUI v9 APIs
3. Define component structure, props, sx, behavior, integration points
4. Present section plan → OWNER APPROVAL
5. Build → gates (lint 0, build 0, dist deleted) → owner browser review
6. If changes → back to Plan Mode for that section

**Reusable components emerge on second use:** MuiDialog, MuiConfirmDialog, MuiStatusBadge, MuiDataGrid, MuiDataGridToolbar → `components/reusable/` when needed by multiple pages.

---

## Increment 1 — P1 (branch phase-1-foundations) — CLOSED

Merged to main at `86cbd22` on 2026-08-24: AGENTS.md standing rule,
§69.3.6 record, env/constants/httpStatus skeletons, boot prototype,
working files. All gates green.

## Increment 2 — Phase 4.1 Branch API Independent Routes (branch: phase-4-branches-backend-independent)

| # | Sub-task | Status |
|---|----------|--------|
| 1 | Pre-git: branch `phase-4-branches-backend-independent` | done |
| 2 | `backend/utils/constants.js` — add PAGINATION_*, BRANCH_* constants | done |
| 3 | `backend/models/branch.model.js` — schema, indexes, transforms per §20 | done |
| 4 | `backend/validators/branch.validator.js` — chains per §29, §30 | done |
| 5 | `backend/controllers/branch.controller.js` — 7 handlers (list, get, create, update, archive, restore, delete) | done |
| 6 | `backend/routes/branch.routes.js` — routes + validator mounting | done |
| 7 | `backend/routes/index.js` — mount `/branches` router | done |
| 8 | Docs: `docs/project-specification.md` (§30.2, §30.8, §69), `findings.md`, `progress.md`, `task_plan.md` | done |
| 9 | Gates: `node --check` ×8 backend files, `npx vite build` 0 errors, `npx eslint src/` 0 warnings, `dist/` deleted | done |
| 10 | Delete `docs/branches-backend-exhaustive-analysis.md` | done |
| 11 | Step-5 diff presentation → owner approval → post-git | pending |

**Deferred (cross-model/domain — Phase 5):**
- `GET /branches/:branchId/detail` (Report+Item+Analytics aggregation)

**Removed:**
- `GET /branches/:branchId/timeline` (brainstorming added, not in spec, removed)

---

## Redux Layer Fix — Session 2026-08-26

**Owner directive:** Centralized transform in apiSlice — no extractUser.

| File | Change | Status |
|------|--------|--------|
| `apiSlice.js` | Split `normalizeResult` → `unwrapEnvelope` + `normalizeError`; refresh dispatches `authenticated` | pending |
| `userSlice.js` | Delete `extractUser`, `refresh` mutation, all `transformResponse` | pending |
| `store.js` | Add `login.matchFulfilled` listener → dispatches `authenticated` | pending |
| `LoginForm.jsx` | Remove manual `dispatch(authActions.authenticated(user))` | pending |

---

## Phase 5: Branches Page Frontend

### Phase 5.1: Core Reusable Components

| # | Task | Status |
|---|------|--------|
| 1 | Create `MuiDialog` reusable component | done |
| 2 | Create `MuiConfirmDialog` reusable component | done |
| 3 | Create `MuiStatusBadge` reusable component | done |
| 4 | Enhance `MuiEmptyState` with icon/minHeight/sx props | done |
| 5 | Fix `MuiPageHeader` for single line on xs | done |
| 6 | Create `MuiDataGrid` wrapper component | done (needs fix: components → slots) |
| 7 | Create `MuiDataGridToolbar` reusable component | done |
| 8 | Create `MuiPagination` reusable component | done (needs fix: non-standard props) |
| 9 | Update `LoadingSpinner` with disableShrink | done |

### Phase 5.2: Branch Domain Components

| # | Task | Status |
|---|------|--------|
| 10 | Create `BranchesFilterDialog` → replaced by `BranchesFilterMenu` (2026-08-31: Menu + FormControl checkbox; delete dialog) | done |
| 11 | Create `BranchFormDialog` (RHF + MuiTextField) | done (reworked 2026-08-31: register, redux, toast — C25-C27/A21-A24) |
| 12 | Create `BranchesHeaderActions` | done (filter badge = matched count C28/A25-A28) |
| 13 | Create `BranchLedgerCard` | done |
| 14 | Create `BranchRowActions` | done |
| 15 | Create `branchesSlice.js` (RTK Query) | done (needs fix: tag path, tagTypes) |

### Phase 5.3: Page Integration

| # | Task | Status |
|---|------|--------|
| 16 | Create `branchColumns` definitions | done |
| 17 | Create `BranchesPage` full implementation | done (needs fix: duplicate loading, no-op sort) |
| 18 | Add `ROWS_PER_PAGE_OPTIONS` to constants | done |

## Session 2026-08-31 — Responsive Page Header (Task 1.1)

### Phase 5 Sub-task: Responsive MuiPageHeader + Branches Header

| # | Task | Status |
|---|------|--------|
| 1 | MuiPageHeader.jsx — hideTitle prop, alignItems in sx | implemented (needs gates) |
| 2 | BranchesHeaderActions.jsx — conditional toggle + create button | implemented (needs gates) |
| 3 | Branches.jsx — responsive view logic + `useCallback` handlers (C12) | implemented (needs gates) |
| 4 | AuthSheet.jsx — hideTitle={false} (A15) | implemented (needs gates) |
| 5 | AGENTS.md — A13 alignItems + C12 useCallback convention + spec-trust codification | done |
| 6 | Spec §46.12 — hideTitle prop | done |
| 7 | Spec §56.4 — xs icon-only create button | done |
| 8 | Spec §56.7 — responsive breakpoint matrix update | done |
| 9 | Spec §66.6 — spec-trust rule + §46.2 useCallback convention | done |
| 10 | Run validation gates | pending |

### Phase 5.4: Issue Fixes

| # | Issue | Fix Status |
|---|-------|-----------|
| 1 | MuiPagination non-standard props | done (A30: card-view-only plain Pagination — Phase 5.6/A′) |
| 2 | Branches.jsx duplicate loading check | done (single C21 gate already; grid overlays for refetch only — C30) |
| 3 | branchesSlice tag path wrong | verified OK (C22 `result.docs` + LIST tags already correct) |
| 4 | getBranchDetail non-existent route | done (A37: declared inert, never imported) |
| 5 | apiSlice tagTypes missing "Branch" | done (already `["User","Branch"]`, prior commit) |
| 6 | onSortModelChange no-op | done (A32: server sort wired in Phase 5.6/A′) |
| 7 | ButtonGroup/ToggleButtonGroup nesting | done (prior commit) |
| 8 | MuiDataGrid deprecated components prop | done (A29: v9 slots/slotProps rewrite — Phase 5.6/A′) |
| 9 | BranchFormDialog stale defaultValues | done (A36: useEffect seed — Phase 5.6/C′) |
| 10 | Missing newline at end of files | pending (verify each edited file) |
| 11 | Planning files overwritten | done (reverted + appended) |
| 12 | task_plan.md stale statuses | done (updated above) |

### Phase 5.6: Branches List Rendering + Lifecycle (planning-with-files tracked)

Decomposed increments A′–C′ (owner 2026-08-31). EACH increment: build → gates →
**owner in-browser review of the wired Branches page** → approve → add/commit/push (no merge).

| # | Increment | Task | Status |
|---|-----------|------|--------|
| 1 | A′ | MuiDataGrid v9 rewrite (A29/C29/C30/C31) + MuiDataGridToolbar (drop Print+QuickFilter, add children, **reusable per-page export config**) + MuiPagination (A30) + Ethiopian dates (A31) + wire grid into Branches.jsx (A32) | in_progress |
| 2 | B′ | BranchLedgerCard map + MuiPagination list view (A33) | pending |
| 3 | C′ | Lifecycle confirm (A34) + edit seed (A36) + view navigate (A35) + getBranchDetail inert (A37) | pending |

> **Owner directive (2026-08-31):** EVERY reusable component (all of
> `components/reusable/`) is page-agnostic; MuiDataGrid+Toolbar are consumed per page and must be
> **per-feature opt-in configurable** (Print/CSV/PDF/Excel via `slotProps.toolbar`). Branches skips
> Print (C29) but the reusable toolbar still supports it for other pages.
>
> **Toolbar fix (done):** rewrite `MuiDataGridToolbar.jsx` — rename `export`→`showExport`, real
> `useState`/`useCallback` Menu control, per-feature export config, drop filter Badge dot.
>
> **Canon C31 (2026-08-31):** grid columns NEVER hardcode `width` — always `flex` + `minWidth`
> (all current/future `columns/*.jsx`); `MuiDataGrid` sets `disableColumnResize`. Branches
> weighting (owner): name flex:2/200 · location flex:2/160 · status flex:1/120 · createdAt flex:1/120.

## Next Step
**Increment A′ (Phase 5.6 #1):** after gates pass, stop for owner in-browser review of the
Branches grid, then add/commit/push `feat: phase 5 branches grid + reusable grid/Toolbar
(A29-A32, C29/C30)` — no merge. Pre-req: owner restarts backend (7b) so `/api/v1/branches`
returns seeded rows.

### Phase 5.5: Validation & Integration

| # | Task | Status |
|---|------|--------|
| 19 | Run `node --check` all backend files | pending |
| 20 | Run `npx vite build` (0 errors) | pending |
| 21 | Run `npx eslint src/` (0 warnings) | pending |
| 22 | Delete `dist/` | pending |

## Session 2026-08-31 (b) — Branches Page Fetch / Loading / Error / Empty

Canon C13–C20 · Amendments A16–A20 (see findings.md). No data passed to
any child component — rows render in a later increment.

| # | Task | Status |
|---|------|--------|
| 1 | Wire apiSlice tagTypes → `["User","Branch"]` (A16) | done |
| 2 | store.js side-effect import branchesSlice (A17) | done |
| 3 | Track branchesSlice.js (A18) | done |
| 4 | Add copy constants to constants.js (A19) | done |
| 5 | Branches.jsx fetch + loading(Ls)/error(inline retry)/empty(MuiEmptyState) (A20) | done |
| 6 | Mirrors — AGENTS.md + spec §56.7/§42/§60.2/§15 (same-commit) | done |
| 7 | Gates — lint, build 0 err, delete dist | done (all pass) |
| 8 | Step-5 review → add/commit/push (no merge) | pending review |

**Rework (build, 2026-08-31, owner "clean page" directive):**
- New `MuiErrorState` belt component replaces the inline error `<Box>`
  retry band (prop-driven, `refetch`-capable; AppErrorPage stays for the
  router boundary only).
- Branches.jsx body = stock surfaces only; NO `<body>` wrapper; all copy
  via `BRANCHES_COPY` (added `header.title`/`header.subtitle`).
- **C21 codified (owner directive 2026-08-31):** query loading gate =
  **`!data && !error`**, NEVER `isLoading` — prevents the endless
  spinner. Mirrored in findings.md, AGENTS.md, spec §46.14. RESPECT
  FOREVER.

**Bug fix (build, 2026-08-31): `data` undefined — Redux normalization**
- Cause: `getBranches.providesTags` read `result.data.docs`, but
  `unwrapEnvelope` already strips the envelope — `result` is the inner
  payload, so `result.data` is `undefined` → TypeError → cache never
  settles → `data` undefined.
- Fix: `branchesSlice.js` `providesTags` now reads `result.docs` (C22).
- **C22 codified (2026-08-31):** envelope unwrapped once in `apiSlice`;
  consumers/tag callbacks read the inner payload (`result.docs`), NEVER
  `result.data.*`. Mirrored in findings.md, AGENTS.md, spec §42.4.
  RESPECT FOREVER.

**Backend fix (build, 2026-08-31): `Branch.paginate` undefined → `data` undefined**
- Cause: `getBranches` (branch.controller.js:48) calls `Branch.paginate`,
  but `mongoose-paginate-v2` was never registered; `backend/utils/pagination.js`
  claimed by spec §15 never existed (false marker).
- Fix (schema-level, owner): `branch.model.js` += import +
  `branchSchema.plugin(mongoosePaginate)` before `mongoose.model(...)`.
- **C23 codified (2026-08-31):** pagination = `mongoose-paginate-v2`
  registered PER-SCHEMA via `.plugin()`; no `pagination.js` wrapper (spec
  false claim corrected to removed/deprecated). Mirrored in findings.md,
  AGENTS.md, spec §27.6/§15. RESPECT FOREVER.

### Backend hang — task-7 updates (validate() invocation)
- **Root cause (owner-led, not mongoose):** all 7 `branch.routes.js`
  routes passed the bare `validate` reference instead of `validate()`.
  `validate` is a factory → Express called it as `validate(req,res,next)`
  (req → `options`), the returned inner middleware was ignored, `next()`
  never ran → the request hung forever (no response; `/health` fine).
- **Fix:** every route now invokes `validate()` (working tree, C24).
- **C24 codified (2026-08-31):** `validate()` must be **invoked** in route
  chains, never passed bare — else silent hang. Mirrored in findings.md,
  AGENTS.md, spec §29.2/§29.3. RESPECT FOREVER.

### Backend pagination — task-6 updates
| # | Task | Status |
|---|------|--------|
| 6a | Register `mongoose-paginate-v2` on Branch schema | done |
| 6b | Mirrors — findings, AGENTS, spec §15/§27.6, task_plan, progress | done |
| 6c | Gates — node --check + client lint/build/delete dist | done |
| 7a | Fix bare `validate` → `validate()` in all branch routes (C24) | done |
| 7b | Restart backend + Postman `/branches` re-test | pending (owner runtime step) |
| 7c | Step-5 review of full uncommitted set; NO commit until approval | done (owner approved commit below) |

**Committed + pushed (owner directive 2026-08-31, add-commit-push only, NO merge):**
- Commit `f64c924` on `phase-5-branches-frontend` — Branches page fetch/loading/error/empty
  (C21/C22/C24) + backend `validate()`/paginate fixes (C23) + mirrors (14 files, 512+/42-).
- Pushed `dfd278c..f64c924`. **Phase 5.4 untracked components remain** (next increment):
  MuiDialog, MuiConfirmDialog, MuiDataGrid, MuiDataGridToolbar, MuiPagination, MuiStatusBadge,
  BranchesFilterDialog, BranchFormDialog, BranchLedgerCard, BranchRowActions, `components/columns/`.
- **Remaining immediately:** 7b restart + Postman `/branches` re-test (prove the fix), then
  the Phase 5.4 issue-fix/step-5 increment (task_plan §Phase 5.4 234-243).
