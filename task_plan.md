# Task Plan — Report Builder

Governing Rule #6 — **SPEC TRUST OVERLAY** (owner directive,
2026-09-01): `docs/project-specification.md` is NOT a single source of
truth for the following areas, nor for anything involved with them:

- **§18–§24A — Domain models** (User, Branch, Report, Audio,
  Transcription, ChatConversation, Item): schema field contracts &
  indexes.
- **§30–§39 — Domain API contracts** (Branch CRUD/lifecycle, Report,
  Audio, STT, Generation, Correction, Chat, Export, Analytics,
  Search) — incl. §30.2 filter semantics and §30.6 delete flow.
- **§48–§59 — Pages & features** (auth pages, dashboard, reports
  list/detail, branches §56.2/§56.3/§56.5/§56.6/§56.7, profile §57,
  exports §58, wizard-replacement workspace).

Every detail in these areas is binding ONLY once it is amended WITH the
owner during the Step-1.1 identification of each phase/task/sub-task
and recorded in findings.md / progress.md / task_plan.md / AGENTS.md in
the same working tree (§66.6 same-commit mirrors). Spec text alone
never binds here; a detail stays out until owner-amended (Rule #1 —
KNOWN OR AMENDED ONLY). Already owner-amended branches state and built
code are unaffected.

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

Governing Rule #4 — **ADD → COMMIT → PUSH, MERGE ONLY AT PHASE CLOSE** (owner
directive, 2026-08-31; updated 2026-09-01): increments are pushed to their
feature branch during active work. Interim commits on `phase-N-description`
are intermediate, not done yet — **no merge during active work**. When the
owner approves the phase (step-5 review), run the step-6 close: commit → push
→ **ff-merge to `main`** → **delete the branch**. This supersedes the earlier
"never merged / never deleted" wording. The standing workflow is interim
add/commit/push only; the merge+delete runs once per phase close.

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
| 11 | Step-5 diff presentation → owner approval → post-git | done (merged to main `364eb24`) |

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
| 10 | Missing newline at end of files | done (verified — all edited files have trailing newline) |
| 11 | Planning files overwritten | done (reverted + appended) |
| 12 | task_plan.md stale statuses | done (updated above) |

### Phase 5.6: Branches List Rendering + Lifecycle (planning-with-files tracked)

Decomposed increments A′–C′ (owner 2026-08-31). EACH increment: build → gates →
**owner in-browser review of the wired Branches page** → approve → add/commit/push (no merge).

| # | Increment | Task | Status |
|---|-----------|------|--------|
| 1 | A′ | MuiDataGrid v9 rewrite (A29/C29/C30/C31) + MuiDataGridToolbar (drop Print+QuickFilter, add children, **reusable per-page export config**) + MuiPagination (A30) + Ethiopian dates (A31) + wire grid into Branches.jsx (A32) | done (commit `02c387b`) |
| 2 | B′ | **Card/list view + FULL lifecycle (A33-A36, A38)** — BranchLedgerCard map (Grid `size`) + MuiPagination (list-only, >1 page) + View navigate (A35) + edit dialog seed (A36) + archive/restore/delete confirm→inline loading→toast (A34) | done (commit `2f8151c`) |
| 3 | C′ | **Grid Actions column wiring ONLY** (BranchRowActions + Actions col in `columns/branches.jsx`); getBranchDetail inert (A37) | built — pending owner in-browser review → step-5 approval → step-6 commit/merge |

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
**Increment C′ (Phase 5.6 #3) — grid Actions column + barrel cleanup (built,
2026-09-01):** `BranchRowActions.jsx` rewrite (single imports, `sx` icon colors
A43, Tooltip `<span>` wrapper, per-row `actionLoading` A34) + `actions` column
in `columns/branches.jsx` (flex C31, non-sortable/filterable, `disableColumnMenu`),
wired into the `Branches.jsx` `branchColumns` memo (handlers + `getActionLoading`).
Barrel-import cleanup folded into C′ (per owner): removed `@mui/material` root
barrel in MuiPagination/MuiSidebar + `@mui/icons-material` named→default in
BranchRowActions/BranchLedgerCard/BranchesHeaderActions/BranchFormDialog.
Gates passed (lint 0 · vite build 0 → dist removed · grep clean). After
**owner in-browser review** → step-5 approval → step-6 add/commit/push
`feat: phase 5 branches grid actions column (C′); chore: client barrel-import
cleanup` → ff-merge to `main` → delete branch.

### Phase 5.5: Validation & Integration

| # | Task | Status |
|---|------|--------|
| 19 | Run `node --check` all backend files | done (pass) |
| 20 | Run `npx vite build` (0 errors) | done (pass) |
| 21 | Run `npx eslint src/` (0 warnings) | done (pass) |
| 22 | Delete `dist/` | done |

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

## Session 2026-09-01 (l) — Increment B′ rework round 3 (owner review, 2 defects)

Owner flagged two defects in the reworked `Branches.jsx`/delete path:
1. **Per-card loading** — RTK mutation `isLoading` is hook-wide; switched to a
   `pendingBranch = { id, type } | null` state so only the acted-on row's icon
   spins (`actionLoading={pendingBranch?.id === branch._id ? pendingBranch.type : null}`);
   cleared in a `finally`.
2. **Delete 500 `MissingSchemaError`** — `deleteBranch` called
   `mongoose.model("Report"/"Item")` (schemas don't exist yet). Removed only the
   ref-check block; endpoint keeps §30.6 archive step-1 + `data: { archived: true }`
   + "…retention period". Session/transaction kept (mongoose ^9.9.3).
- **Owner directive (defer):** branch hard-delete MUST cascade to
  reports/items/audios/transcriptions/chat — those schemas are later-phase, so
  hard-delete + ref-check (409) + the pre-30-day bypass are STRICT TODOs for the
  reports phase (findings (l)); NOT built now (define-on-require).
- **Recorded in:** findings.md (l), progress.md (l), this task_plan, AGENTS.md,
  spec §30.6/§20.4/§69.15.
- **Next:** gates passed → owner in-browser review → add/commit/push (no merge).

## Session 2026-09-01 (m) — Increment B′ delete-flow correction (owner review, round 4)

Owner corrected `deleteBranch` (round-3's archive-only + `data: { archived: true }`
was wrong). Now, in the session:
1. **Find the branch — must already be archived** (`{ _id, user, isArchived: true }`)
   → 404 if not found.
2. **Delete the branch row** (`deleteOne`) + a **TODO comment** for the linked-
   resource cascade (reports → items → audios → transcriptions → chat, §17.4/§62)
   once those schemas exist (reports phase). No dependents can exist this phase,
   so only the row is removed (no orphans).
3. **Response** `{ success: true, message: "Branch deleted", data: null }`.
- **Amendment (spec §30.6/§62/§12941):** DELETE hard-deletes the already-archived
  branch immediately in the session with `data: null` (overrides archive-first +
  sweeper-only for this phase). Cascade + ref-check (409) remain STRICT TODOs.
- **Recorded in:** findings.md (m), progress.md (m), this task_plan, AGENTS.md,
  spec §30.6/§69.15/§12941.
- **Next:** gate → owner restarts backend + in-browser review (delete success
  toast + branch gone) → add/commit/push (no merge).

## Session 2026-09-01 (n) — Increment B′ delete: find ARCHIVED branch, no updateOne (round 5)

Owner corrected round-4 again: `deleteBranch` must **find the branch already
archived** (`{ _id, user, isArchived: true }`), NOT set `isArchived` via
`updateOne`. The `updateOne` archive step is removed from the delete (Archive is
a separate action). Delete = find archived → 404 → `deleteOne` + cascade TODO →
`{ success, message: "Branch deleted", data: null }`.
- **Recorded in:** findings.md (n), progress.md (n), this task_plan, AGENTS.md,
  spec §30.6/§69.15/§12941.
- **Next:** gate → owner restarts backend + in-browser review → add/commit/push
  (no merge).

## Increment C′ — grid Actions column (2026-09-01)

- [x] Rewrite `BranchRowActions.jsx`: tree-shaken imports, `sx` icon colors (A43), Tooltip `<span>` wrapper, per-row `actionLoading` (A34), `(branch) => void` handlers.
- [x] `columns/branches.jsx`: `createBranchColumns({...})` gains the `actions` column (flex width C31, non-sortable/filterable, `disableColumnMenu`).
- [x] `Branches.jsx`: `branchColumns` memo wired with handlers + per-row `getActionLoading` (deps updated).
- [x] Gates: lint 0, `vite build` 0 → `rm -rf dist`, grep battery clean.
- [ ] Owner in-browser review of grid actions → add/commit/push `feat: phase 5 branches grid actions column (C′)` (no merge).

## Breadcrumb: barrel-import cleanup (folded into C′)

- [x] Remove `@mui/material` root barrel (MuiPagination, MuiSidebar).
- [x] `@mui/icons-material` named → single default imports (BranchRowActions, BranchLedgerCard, BranchesHeaderActions, BranchFormDialog).
- [x] Leave `@mui/x-data-grid`/`@mui/x-date-pickers`/`@mui/material/styles` untouched.
- [x] Gates: lint 0, `vite build` 0 → `rm -rf dist`, grep clean.
- [ ] Owner review → single C′ commit incl. cleanup (no merge).

## Phase 6 — Trust Overlay Amendments: Data Modeling + API Design

**Branch:** `phase-6-trust-overlay-amendments`
**Origin:** off `main` (after commit 4f2f5a2 — trust overlay note-down)
**Objective:** amend every single detail in the trust-overlay scope
(models §18–§24A, API contracts §30–§39) with the owner during
Step-1.1 identification. No implementation in this phase — design-only
amendments recorded in the working files.

**Why this phase exists:** the trust overlay (owner directive,
2026-09-01, recorded in all 5 planning files + the spec, committed
4f2f5a2) established that `docs/project-specification.md` is NOT a
single source of truth for domain models, API contracts, or pages.
Every detail in those areas becomes binding only when amended WITH the
owner during Step-1.1 of each phase/task/sub-task. This phase is the
first campaign of that process.

**Scope boundaries (confirmed):**
- **In scope:** data models §21/§24A/§22/§23/§24 + API contracts
  §31–§39 — amended incrementally, one resource at a time.
- **Out of scope (deferred to frontend campaign):** pages §48–§59.
  Each page increment maps to the API row that supplies it (listed
  in the consumed-by column below).
- **§17/§18 handling:** outside the overlay list but "involved" —
  relevant provisions (ERD/cascade map §17.3/§17.4, conventions §18)
  folded into each model increment as restated canon, not standalone
  increments.
- **§52 Wizard:** dropped/inert (owner directive). Any resurrection
  = new owner amendment in a future Step-1.1.

**Already amended and built (unaffected):**
- §19 User Model + §28 Auth — done, code on main.
- §20 Branch Model + §30 Branch API + §56 Branches page (incl. grid
  Actions column, lifecycle, filter menu) — done, code on main.
- The trust overlay banner itself — committed 4f2f5a2.

**Increment plan (one resource = model + API together):**

| # | Increment | Model | API | Involved-with-it | Blocked-by | Pages consumed later |
|---|---|---|---|---|---|---|
| R1 | **Report resource ✅ (amended)** | §21 | §31 | §6 skeleton/type; status enums (§21.4/§31.4); visits[]+isMain capture (Option X); §21.3 multikey indexes; §30.6 delete-cascade + ref-check; constants; envelope shapes; Ethiopian date/time boundary | — | §50, §51, §53, §58 |
| R2 | **Item resource ✅ (amended)** | §24A | §31.6 | per-type vocabulary (activity completed/in_progress default completed; issue reported/in_progress/completed default reported; comment no-status/no-rating, text nullable); ItemDto `{_id,report,branch,date,type,text,status,createdAt,updatedAt}`; `GET /reports/:reportId/items` + `GET /items` (paginated, 403 archived, two-surface split); `PATCH items/:itemId {status}` (same-status→200, not generated-gated); partial-unique comment index; micro-decisions (no per-item delete, text immutable, any-direction, defaults at accept) | R1 | §51 details |
| R3 | **Audio resource ✅ (amended)** | §22 | §32 | multer config, `uploads/` location, nested `/reports/:reportId/clips` routes, no stream/no archive/direct-delete, final-clip→draft, add-at-transcribed keeps status/drops readiness, temp-chunk-cleanup, Audio-tab one-card layout | R1 | §53/§54 |
| R4 | Transcription | §23 | §33 | addis provider contract; stored shape (raw/latest, language codes §7.7); session contract | R3 | §54 review |
| R5 | Generation service | — | §34 | §8 16-rules applicability; provider selection; generation→Item persist + terminal-status transition | R1, R2, R4 | §53 workspace |
| R6 | Correction service | — | §35 | 3 modes (typed/voice); re-transcription; raw/latest rewrite + undo | R1, R4 | §53/§54 |
| R7 | Chat resource | §24 | §36 | messages array; conversation-to-report transformation (§8.4) | R1 | §55, §59 |
| R8 | Export feature | — | §37 | §58 surfaces; Print-to-PDF; CSV/PDF/Excel formats; branch+report context | R1 | §58 |
| R9 | Analytics | — | §38 | visits/aggregations; branch×report stats | R1 | §49 dashboard; §56.5 Branch Details |
| R10 | Search | — | §39 | global text-index scoping; all models with text indexes | all | MuiAppbar global search |

**Dependency chain (fixture order §5916 aligned):**
```
User ✅ → Branch ✅ → R1 Report → R2 Item
                            ├→ R3 Audio → R4 Transcription
                            ├→ R5 Generation (needs R2+R4)
                            ├→ R6 Correction (needs R4)
                            ├→ R7 Chat
                            ├→ R8 Export
                            ├→ R9 Analytics
                            └→ R10 Search (needs all)
```

**Open questions (to resolve during R1 Step-1.1, NOT before):**

| # | Question | Why it matters | Resolved during |
|---|---|---|---|
| OQ-1 | Report model exact field set (name, branch ref, status enum values, date, raw/latest content shape, timestamps, archivedAt?) | Defines the entire domain's identity contract | R1 |
| OQ-2 | Status machine: exact enum values and legal transitions (§5.3/§21.4/§31.4) | Every lifecycle endpoint guards on these | R1 |
| OQ-3 | `raw` + `latest` content: exact shape/typing and the single-undo revert contract | Drives §31 endpoints, §34 generation, §35 correction | R1 |
| OQ-4 | §56.5 Branch Details scope: what does `GET /branches/:branchId/detail` return? | Blocks the last branches-domain remnant | R9 |
| OQ-5 | Item: separate collection or embedded subdoc? Per-type fields exact shapes | **RESOLVED (R2, 2026-09-01)** — separate collection; per-type statuses; no rating; ItemDto confirmed | R2 ✅ |

**Amendment session mechanics (per increment):**

1. Owner switches session to **plan mode** for the increment.
2. Agent presents the spec's current letter for the increment's sections
   (verbatim claims + sub-section map — e.g., §21.1–§21.13,
   §31.1–§31.10).
3. Agent separates **canon** (rules that cannot be wrong: conventions,
   patterns locked in Branch, foundational truths) from **amendments**
   (every field/enum/index/envelope/endpoint — one detail at a time).
4. Owner decides each detail. Approved items form the increment's
   **Amendment record**.
5. On build-mode approval: record written into `findings.md`/
   `progress.md`/`task_plan.md`/`AGENTS.md` + spec § in one commit
   (§66.6 same-commit mirrors).
6. **No merge** — push to branch only. Merge at phase close (Governing
   Rule #4).

**Phase 6 governance:**
- **Governing Rule #4:** push to `phase-6-trust-overlay-amendments`
  during active work. No merge during active work. Merge to `main` +
  delete branch when the owner closes the phase.
- **Step-5 review:** no commit until the owner reviews the diff and
  approves — applies to every increment's mirror-record commit.
- **Same-change discipline (§66.6):** every amendment record is written
  in the same commit as its spec mirror edit — working files + spec
  together, never separately.

**Current status:** R1 + R3 complete; **CONSOLIDATED user-first re-amendment done** —
R1 (`06a351a`) and R3 (`b39791a`) records SUPERSEDED (see "Consolidated supersession"
below). Post-creation + create-time design fully amended. Next step = resolve the open
items (§ Open items) and proceed to the remaining increments (R2 Item, R4 transcription-
create, R5 Generation+Presets, R6 Correction, R7 Chat, R8 Export, R9/R10).

### Consolidated supersession (2026-09-01, user-first re-amendment)

Owner directive: every detail derives user-first — interaction → user story → user flow →
UI → API → model. "The logic should win"; "don't take my word as is". This record
**SUPERSEDES the R1 and R3 records above** (they were spec-first; user-first re-grounding
changed the domain). Full detail: findings.md "CONSOLIDATED re-amendment".

- **Report model (single collection, embedded):** visits[] (with isMain, position-independent),
  audios[] embedded (metadata only; binary on disk), transcription{raw,latest} embedded.
  NO status, NO generatedAt, NO contributions, NO language/requestId/model, NO items embedded;
  `metadata + items = report`, body DERIVED (not in latest). Freeze gate = items exist;
  revert reopens. Derived: day start/exit, main branch, Type, generated (= items exist).
- **Item:** separate collection (denorm branch+date; type activities|issues|comment; status
  reported|in_progress|completed) — boss/agent/sheet surface.
- **GenerationPreset:** user CRUD, NO default.
- **ChatConversation:** per report; acceptedResponseId; re-try truncate/accept/revert.
- **Create:** atomic multipart POST /reports (`metadata`+`clips[]`+lazy `createKey`);
  attempt-session per-clip marks; incremental retry; one §27.7 commit; empty-merge reject;
  dialog preserved on failure (outside-click won't close).
- **STT:** Addis-only Path A (no prompts); ffmpeg mono-16k-PCM; ≤60s silence chunks; am-only.
- **Post-creation:** /edit 3 tabs; /chat card protocol (Copy / Re-try / Like accept-revert;
  one accepted per report); grounded-history digest agent.
- **API table + edge-case verdicts + MUI X Chat + 16MB/storage contract:** in findings.md.

### Open items (owner verdicts before further work)
**ALL CLOSED (2026-09-01).** 1. Status-update = direct `PATCH items/:itemId {status}`
(R2). 2. Duplicate-day allowed (no `{user,date}` — 1+ reports/day possible).
3. System wins; transcript = data; **+ exemplars from prior generated bodies** (§34.2).
4. Require a preset (RHF dialog, provider-conditional, Addis has no reasoning);
composer fills `latest` IFF `generated === ""`; digest = items + light transcription +
correction-habits, fresh per generation, DIGEST_MAX_TOKENS. 5. §11 caps confirmed
(CONTENT_MAX_SIZE_BYTES ~1MB; AUDIO_MAX_TOTAL_DURATION_SEC). 6. Chat streaming
**DEFERRED to R7**. 7. Preset per-message, user-adjustable at generation time.
8. **DONE** (consolidated record + spec sweep). See findings.md "Open-items closure".

**Remaining open only:** GET /items consumer page (decided later: dedicated
Activities&Issues page / Dashboard band / Branch Details / exports-only); chat streaming
(R7).

### Next increments
- **R2 — Item resource: **COMPLETE (2026-09-01).** Item model/ItemDto/lists/
  status PATCH recorded (findings.md "R2"; spec §24A/§31.6/§31.9). Status
  PATCH = direct `PATCH items/:itemId {status}` (same-status→200; 403 archived;
  not generated-gated); two-surface split (`GET .../reports/:reportId/items`
  report-context + `GET /items` cross-report boss/agent/sheet); 401 = global
  auth gate only.
- **R4 transcription-create details** (pending-clip/re-transcribe bookkeeping —
  the deferred contributions replacement) — next.
- R5 Generation+Presets (digest+exemplars+correction-habits); R6 Correction;
  R7 Chat (streaming + MUI + card protocol); R8 Export.
- GET /items consumer page decided later.

### Spec reconciliation sweep (2026-09-01) — COMPLETE

One full top-to-bottom pass over `docs/project-specification.md`
applying ONLY confirmed/amended decisions (see `progress.md` sweep
record). Highlights: §5 BR-05/06/08, §6 (isMain, Type-2 main
attribution, no rating), §11 (REPORT_STATUSES removed, ITEM_STATUSES_
BY_TYPE with comment: []), §17 five entities + no-status presence,
§21/§22/§23 rewritten (embedded audios/transcription + generated),
§24 (acceptedResponseId/cards), §24A rewritten (no rating, per-type
statuses, comments no status), §31 rewritten (atomic multipart create,
no status machine, conversation/preset routes), §34/§35/§36 rewritten
(accept→generated+items, modes→latest, card protocol), frontend
banners §49–§55/§58, §52 wizard RETIRED, §62 staging, §66/§69 notes.
findings.md: `payload`→`text`, per-type status record.

### R1 — Report resource — COMPLETE (design-only amendment, 2026-09-01)

Amended Report model §21 + Report & Status API §31 with the owner (Step-1.1).

- **Model (Option X):** visits[]-only capture (isMain flag), no root branch/
  clockIn/clockOut/transcription ref; status stored+transition-guarded; lifecycle =
  isArchived/archivedAt (Branches mirror); index set; invariants; derived values.
  Content model: metadata + items = report; generated freezes metadata.
- **API:** POST /reports (meta-only), GET /reports (list: page/limit/isArchived
  active|archived|all Branches-mirror/status/branch Q1/sort date|-date),
  GET /reports/:reportId (meta read), PATCH /reports/:reportId (meta edit,
  <generated), lifecycle archive/restore/delete (+ child cascade). Dropped
  visit-subpaths + ?withContent.
- **Frontend facts:** reports-page create dialog (react-hook-form date+visits),
  edit route /reports/:reportId/edit with Meta/Audio/Transcription tabs (strict
  <Tab/>/TabContext/TabList/TabPanel/TabScrollButton/Tabs stack), tab mobility,
  branch-visit dialog spec (branches/ component wrapping reusable MuiDialog +
  LoadingSpinner + MuiTimePicker + MuiPagination).
- **Open/deferred:** GET /reports/:reportId/details (separate brainstorm);
  Audio (§32/R3) + Transcription (§33/R4) endpoints + tab UI.
- **Recorded in:** findings.md (R1), progress.md (R1), this task_plan, AGENTS.md,
  spec §21/§31 (same commit, §66.6).

### R3 — Audio resource — COMPLETE (design-only amendment, 2026-09-01)

Amended Audio model §22 + Audio API §32 with the owner (Step-1.1).
- **Model:** 8 fields (child-side 1:N `report`, no status/isArchived/archivedAt/
  deletedAt); indexes `{user}`,`{user,report}`; no TTL (inherited from report);
  direct-delete lifecycle.
- **Lifecycle/status:** final-clip-deleted → `draft`; delete-one keeps
  `audio_attached` / cascades `transcribed`→`audio_attached`; add-at-`transcribed`
  keeps status but drops readiness (pending until re-transcribe+merge §33.6);
  frozen at `generated`.
- **Binary:** temp-chunk-cleanup on transcription success (keep originals).
- **API:** nested `/reports/:reportId/clips` only (upload/list/single/delete);
  no flat `/audios/*`, no `/play` stream, no archive/restore, flat `{ clips }`.
  AudioDto `{ _id, report, mimeType, sizeBytes, durationSec, createdAt, updatedAt }`.
- **Audio-tab UI (R3):** one card = big orb + drag-drop upload; "Narrations"
  divider; per-clip play/seek/duration/size/delete/transcribe; Transcribe-all
  only-when-pending; Blob/object-URL playback (no stream).
- **Deferred to R4:** per-clip Transcribe/Re-transcribe engine + Transcribe-all +
  heard-count readiness + merge + §23 + §33.
- **Recorded in:** findings.md (R3), progress.md (R3), this task_plan, AGENTS.md,
  spec §22/§32 (same commit, §66.6).
